<?php
// Debug: să vedem dacă scriptul rulează
error_log('=== addCard.php START ===');

// Afișează erorile PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control, Pragma');
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

// Funcție pentru generarea unui IBAN random
function generateRandomIBAN() {
    $countryCode = 'RO';
    $checkDigits = str_pad(rand(10, 99), 2, '0', STR_PAD_LEFT);
    $bankCode = 'BANK';
    $accountNumber = strtoupper(substr(md5(uniqid() . rand(1000, 9999)), 0, 16));
    return $countryCode . $checkDigits . $bankCode . $accountNumber;
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

// Validare data expirării (poate fi MM/YY sau YYYY-MM-DD)
if (!preg_match('/^\d{2}\/\d{2}$/', $expiration_date_decrypted) && 
    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $expiration_date_decrypted)) {
    echo json_encode(['error' => 'Data expirării trebuie să fie în format MM/YY sau YYYY-MM-DD.']);
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

// Data vine deja formatată ca YYYY-MM-DD (ultima zi din lună) din frontend
// Dacă vine în format MM/YY, o convertim la ultima zi din lună
if (preg_match('/^\d{2}\/\d{2}$/', $expiration_date_decrypted)) {
    // Format MM/YY - convertim la ultima zi din lună
    $expiration_parts = explode('/', $expiration_date_decrypted);
    $month = $expiration_parts[0];
    $year = '20' . $expiration_parts[1];
    $lastDayOfMonth = date('t', mktime(0, 0, 0, $month, 1, $year));
    $expiration_date = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . $lastDayOfMonth;
} else {
    // Data vine deja formatată ca YYYY-MM-DD
    $expiration_date = $expiration_date_decrypted;
}

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

    // Verificăm dacă clientul există
    $stmt = $conn->prepare("SELECT id FROM clients WHERE id = ?");
    $stmt->execute([$data['client_id']]);
    if ($stmt->rowCount() == 0) {
        echo json_encode(['error' => 'Clientul nu există!']);
        exit;
    }

    // Verificăm dacă numărul de card există deja
    $stmt = $conn->prepare("SELECT id FROM cards WHERE card_number = ?");
    $stmt->execute([$card_number_clean]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['error' => 'Există deja un card cu acest număr!']);
        exit;
    }

    // Generăm un IBAN random unic
    $iban = generateRandomIBAN();
    
    // Verificăm dacă IBAN-ul există deja (foarte puțin probabil, dar să fim siguri)
    $stmt = $conn->prepare("SELECT id FROM accounts WHERE iban = ?");
    $stmt->execute([$iban]);
    while ($stmt->rowCount() > 0) {
        $iban = generateRandomIBAN();
        $stmt->execute([$iban]);
    }

    // Creăm account-ul nou (fără card_id pentru moment)
    $stmt = $conn->prepare("INSERT INTO accounts (client_id, bank_id, iban, currency, account_type, balance) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['client_id'],
        $bank_id,
        $iban,
        $data['currency'] ?? 'RON',
        $data['account_type'] ?? 'current',
        0.00 // Balance inițial 0
    ]);
    $account_id = $conn->lastInsertId();

    // Creăm cardul nou cu account_id
    $stmt = $conn->prepare("INSERT INTO cards (account_id, card_number, expiration_date, cvv, card_type, status, issued_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([
        $account_id,
        $card_number_clean,
        $expiration_date,
        $cvv_decrypted,
        $data['card_type'] ?? 'debit',
        $data['status'] ?? 'active'
    ]);
    $card_id = $conn->lastInsertId();

    // Actualizăm account-ul să conțină card_id
    $stmt = $conn->prepare("UPDATE accounts SET card_id = ? WHERE id = ?");
    $stmt->execute([$card_id, $account_id]);

    // Logăm crearea cardului și account-ului
    $stmt = $conn->prepare("INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_by) VALUES (?, ?, 'card_created', 'N/A', ?, 'system')");
    $stmt->execute([$data['client_id'], $account_id, "Card nou creat cu ID: $card_id și account cu IBAN: $iban"]);

    // Debug: să vedem dacă ajungem aici
    error_log('About to send success response');
    
    echo json_encode([
        'success' => true, 
        'account_id' => $account_id,
        'card_id' => $card_id,
        'message' => 'Cardul și account-ul au fost create cu succes!'
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
