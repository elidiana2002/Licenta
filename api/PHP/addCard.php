<?php
// Debug: să vedem dacă scriptul rulează
error_log('=== addCard.php START ===');

// Afișează erorile PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Debug: să vedem dacă headers sunt setate
error_log('Headers set successfully');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

// Funcție de decriptare (să corespundă cu cea din frontend)
function decryptData($encryptedData) {
    $encryptionKey = 'licenta2024';
    try {
        // Decodare Base64
        $decoded = base64_decode($encryptedData);
        $decrypted = '';
        
        // Decriptare XOR
        for ($i = 0; $i < strlen($decoded); $i++) {
            $charCode = ord($decoded[$i]) ^ ord($encryptionKey[$i % strlen($encryptionKey)]);
            $decrypted .= chr($charCode);
        }
        
        return $decrypted;
    } catch (Exception $e) {
        error_log('Decryption error: ' . $e->getMessage());
        return $encryptedData; // Returnează original în caz de eroare
    }
}

$data = json_decode(file_get_contents('php://input'), true);

// Debug: să vedem exact ce primește
error_log('Received data: ' . print_r($data, true));

if (
    !$data || 
    !isset($data['client_id']) || 
    !isset($data['card_number']) || 
    !isset($data['expiration_date']) || 
    !isset($data['cvv'])
) {
    error_log('Missing required data!');
    echo json_encode([
        'error' => 'Date lipsă',
        'debug' => [
            'data_exists' => !empty($data),
            'client_id_exists' => isset($data['client_id']),
            'card_number_exists' => isset($data['card_number']),
            'expiration_date_exists' => isset($data['expiration_date']),
            'cvv_exists' => isset($data['cvv']),
            'received_data' => $data
        ]
    ]);
    exit;
}

// -------------------- TEMPORAR: FĂRĂ DECRIPTARE --------------------
// Datele vin deja necriptate din frontend
$card_number_decrypted = $data['card_number'];
$expiration_date_decrypted = $data['expiration_date'];
$cvv_decrypted = $data['cvv'];

// Eliminăm spațiile și caracterele non-digit din numărul cardului
$card_number = preg_replace('/\s/', '', $card_number_decrypted); 
$card_number_clean = preg_replace('/\D/', '', $card_number);

// Verificăm lungimea (16 - 32 cifre)
if (strlen($card_number_clean) < 16 || strlen($card_number_clean) > 32) {
    echo json_encode([
        'error' => 'Numărul cardului trebuie să conțină între 16 și 32 de cifre.',
        'debug' => [
            'encrypted' => $data['card_number'],
            'decrypted' => $card_number_decrypted,
            'without_spaces' => $card_number,
            'only_digits' => $card_number_clean,
            'digit_count' => strlen($card_number_clean)
        ]
    ]);
    exit;
}

// Validare data expirării (MM/YY)
if (!preg_match('/^\d{2}\/\d{2}$/', $expiration_date_decrypted)) {
    echo json_encode(['error' => 'Data expirării trebuie să fie în format MM/YY.']);
    exit;
}

// Validare CVV (3 cifre)
if (!preg_match('/^\d{3}$/', $cvv_decrypted)) {
    echo json_encode(['error' => 'CVV-ul trebuie să conțină exact 3 cifre.']);
    exit;
}

// Validare bank_id
if (!isset($data['bank_id']) || empty($data['bank_id']) || $data['bank_id'] === 'other') {
    echo json_encode(['error' => 'Selectează o bancă validă!']);
    exit;
}

// Convertim data MM/YY -> YYYY-MM-DD (prima zi din luna)
$expiration_parts = explode('/', $expiration_date_decrypted);
$month = $expiration_parts[0];
$year = '20' . $expiration_parts[1];
$expiration_date = $year . '-' . $month . '-01';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifică dacă bank_id există în tabela banks
    $bank_id = intval($data['bank_id']);
    $stmt = $conn->prepare("SELECT id, name FROM banks WHERE id = ?");
    $stmt->execute([$bank_id]);
    $bank_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$bank_data) {
        echo json_encode(['error' => 'Banca selectată nu există!']);
        exit;
    }

    $bank_name = $bank_data['name']; // Numele băncii pentru log/afișare

    // Verificăm dacă clientul există
    $stmt = $conn->prepare("SELECT id FROM clients WHERE id = ?");
    $stmt->execute([$data['client_id']]);
    if ($stmt->rowCount() == 0) {
        echo json_encode(['error' => 'Clientul nu există!']);
        exit;
    }

    // Dacă nu avem account_id, creăm un cont nou
    if (!isset($data['account_id'])) {
        $bank_id = $data['bank_id'] ?? 1; // Default la Banca Transilvania (ID: 1)
        $stmt = $conn->prepare("SELECT id FROM banks WHERE id = ?");
        $stmt->execute([$bank_id]);
        $bank_result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$bank_result) {
            echo json_encode(['error' => 'Banca selectată nu există!']);
            exit;
        }
        
        // Generăm un IBAN unic
        $iban = 'RO' . rand(10, 99) . 'BANK' . strtoupper(substr(md5(uniqid()), 0, 16));
        
        $stmt = $conn->prepare("INSERT INTO accounts (client_id, bank_id, iban, currency, account_type) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['client_id'],
            $bank_id,
            $iban,
            $data['currency'] ?? 'RON',
            $data['account_type'] ?? 'current'
        ]);
        $account_id = $conn->lastInsertId();
        
        // Logăm crearea contului nou
        $stmt = $conn->prepare("INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_by) VALUES (?, ?, 'account_created', 'N/A', ?, 'system')");
        $stmt->execute([$data['client_id'], $account_id, "Cont nou creat cu IBAN: $iban"]);
        
    } else {
        $account_id = $data['account_id'];
        $stmt = $conn->prepare("SELECT id FROM accounts WHERE id = ? AND client_id = ?");
        $stmt->execute([$account_id, $data['client_id']]);
        if ($stmt->rowCount() == 0) {
            echo json_encode(['error' => 'Contul nu aparține acestui client!']);
            exit;
        }
    }

    // Verificăm dacă numărul de card există deja
    $stmt = $conn->prepare("SELECT id FROM cards WHERE card_number = ?");
    $stmt->execute([$card_number_clean]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['error' => 'Există deja un card cu acest număr!']);
        exit;
    }

    // Obținem IBAN-ul contului
    $stmt = $conn->prepare("SELECT iban FROM accounts WHERE id = ?");
    $stmt->execute([$account_id]);
    $account_data = $stmt->fetch(PDO::FETCH_ASSOC);
    $account_iban = $account_data['iban'];

    // Inserăm cardul
    $stmt = $conn->prepare("INSERT INTO cards (account_id, card_number, expiration_date, cvv, card_type, bank_id, iban, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $account_id,
        $card_number_clean,
        $expiration_date,
        $cvv_decrypted,
        $data['card_type'] ?? 'debit',
        $bank_id, // Folosim bank_id validat
        $account_iban,
        $data['currency'] ?? 'RON'
    ]);

    // Logăm crearea cardului
    $card_id = $conn->lastInsertId();
    $stmt = $conn->prepare("INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_by) VALUES (?, ?, 'card_created', 'N/A', ?, 'system')");
    $stmt->execute([$data['client_id'], $account_id, "Card nou creat cu ID: $card_id pentru banca cu ID: $bank_id"]);

    // Debug: să vedem dacă ajungem aici
    error_log('About to send success response');
    
    echo json_encode([
        'success' => true, 
        'account_id' => $account_id,
        'card_id' => $card_id,
        'message' => 'Cardul a fost creat cu succes!'
    ]);
    
    // Debug: să vedem dacă răspunsul a fost trimis
    error_log('Success response sent');
    
} catch(PDOException $e) {
    error_log('PDO Exception: ' . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

// Debug: să vedem dacă scriptul se termină normal
error_log('=== addCard.php END ===');
?>
