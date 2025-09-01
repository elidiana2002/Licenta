<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['client_id']) || !isset($data['card_id']) || !isset($data['currency'])) {
    echo json_encode(['error' => 'Date lipsă pentru crearea account-ului']);
    exit;
}

$client_id = intval($data['client_id']);
$card_id = intval($data['card_id']);
$currency = $data['currency'];

// Validare monedă
$allowed_currencies = ['RON', 'EUR', 'USD'];
if (!in_array($currency, $allowed_currencies)) {
    echo json_encode(['error' => 'Monedă nevalidă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verifică dacă cardul există și obține bank_id din account-ul principal
    $stmt = $conn->prepare("
        SELECT c.id, a.bank_id 
        FROM cards c 
        INNER JOIN accounts a ON c.account_id = a.id 
        WHERE c.id = ?
    ");
    $stmt->execute([$card_id]);
    $card = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$card) {
        echo json_encode(['error' => 'Cardul nu a fost găsit']);
        exit;
    }
    
    $bank_id = $card['bank_id'];
    
    // Generează IBAN unic
    function generateRandomIBAN() {
        $prefixes = ['RO', 'DE', 'FR', 'IT', 'ES'];
        $prefix = $prefixes[array_rand($prefixes)];
        $digits = '';
        for ($i = 0; $i < 22; $i++) {
            $digits .= rand(0, 9);
        }
        return $prefix . $digits;
    }
    
    // Generează IBAN-uri până găsești unul unic
    do {
        $iban = generateRandomIBAN();
        $stmt = $conn->prepare("SELECT COUNT(*) FROM accounts WHERE iban = ?");
        $stmt->execute([$iban]);
        $exists = $stmt->fetchColumn() > 0;
    } while ($exists);
    
    // Creează account-ul nou cu card_id
    $stmt = $conn->prepare("
        INSERT INTO accounts (client_id, bank_id, card_id, iban, currency, balance, account_type, created_at) 
        VALUES (?, ?, ?, ?, ?, 0.00, 'current', NOW())
    ");
    $stmt->execute([$client_id, $bank_id, $card_id, $iban, $currency]);
    
    $account_id = $conn->lastInsertId();
    
    // Înregistrează în istoric
    $stmt = $conn->prepare("
        INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
        VALUES (?, ?, 'account_created', 'N/A', ?, NOW(), 'system')
    ");
    $stmt->execute([$client_id, $account_id, "Cont nou creat cu IBAN: $iban pentru cardul #$card_id"]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Account creat cu succes pentru card!',
        'account' => [
            'id' => $account_id,
            'iban' => $iban,
            'currency' => $currency,
            'balance' => 0.00,
            'card_id' => $card_id
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
