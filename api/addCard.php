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

// Validare date necesare
if (!$data || !isset($data['account_id']) || !isset($data['card_number']) || !isset($data['expiration_date']) || !isset($data['cvv'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifică dacă există deja card cu același număr
    $stmt = $conn->prepare("SELECT id FROM cards WHERE card_number = ?");
    $stmt->execute([$data['card_number']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['error' => 'Există deja un card cu acest număr!']);
        exit;
    }

    // Inserează cardul
    $stmt = $conn->prepare("INSERT INTO cards (account_id, card_number, expiration_date, cvv, card_type) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['account_id'],
        $data['card_number'],
        $data['expiration_date'],
        $data['cvv'],
        isset($data['card_type']) ? $data['card_type'] : 'debit'
    ]);

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 