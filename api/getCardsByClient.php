<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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

if (!$data || !isset($data['client_id'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Selectează toate cardurile pentru client (join accounts + cards + banks)
    $stmt = $conn->prepare("SELECT cards.id, cards.account_id, cards.card_number, cards.expiration_date, cards.cvv, cards.status, cards.card_type, cards.issued_at, accounts.iban, accounts.currency, accounts.bank_id, banks.name AS bank_name FROM cards INNER JOIN accounts ON cards.account_id = accounts.id INNER JOIN banks ON accounts.bank_id = banks.id WHERE accounts.client_id = ?");
    $stmt->execute([$data['client_id']]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'cards' => $cards]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 