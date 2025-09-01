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

if (!$data || !isset($data['account_id'])) {
    echo json_encode(['error' => 'Account ID lipsă']);
    exit;
}

$account_id = intval($data['account_id']);

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Selectează toate accounturile asociate cu cardul
    $stmt = $conn->prepare("
        SELECT 
            a.id,
            a.iban,
            a.balance,
            a.currency,
            a.created_at,
            b.name as bank_name
        FROM accounts a
        INNER JOIN banks b ON a.bank_id = b.id
        WHERE a.card_id = (
            SELECT c.id FROM cards c WHERE c.account_id = ?
        ) OR a.id = ?
    ");
    $stmt->execute([$account_id, $account_id]);
    
    if ($stmt->rowCount() == 0) {
        echo json_encode(['error' => 'Nu s-au găsit account-uri pentru acest card!']);
        exit;
    }

    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatează data creării pentru fiecare account
    foreach ($accounts as &$account) {
        $account['created_at'] = date('Y-m-d H:i:s', strtotime($account['created_at']));
    }

    echo json_encode([
        'success' => true,
        'accounts' => $accounts
    ]);

} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
