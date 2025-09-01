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

if (!$data || !isset($data['account_id']) || !isset($data['balance'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

$account_id = intval($data['account_id']);
$balance = floatval($data['balance']);

if ($balance < 0) {
    echo json_encode(['error' => 'Balance-ul nu poate fi negativ']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifică dacă account-ul există
    $stmt = $conn->prepare("SELECT id, balance, client_id FROM accounts WHERE id = ?");
    $stmt->execute([$account_id]);
    if ($stmt->rowCount() == 0) {
        echo json_encode(['error' => 'Account-ul nu există!']);
        exit;
    }

    $account_data = $stmt->fetch(PDO::FETCH_ASSOC);
    $old_balance = $account_data['balance'];
    $client_id = $account_data['client_id'];

    // Actualizează balance-ul
    $stmt = $conn->prepare("UPDATE accounts SET balance = ? WHERE id = ?");
    $stmt->execute([$balance, $account_id]);

    // Logăm modificarea
    $stmt = $conn->prepare("INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_by) VALUES ((SELECT client_id FROM accounts WHERE id = ?), ?, 'balance_updated', ?, ?, 'user')");
    $stmt->execute([$account_id, $account_id, $old_balance, $balance]);

    echo json_encode([
        'success' => true,
        'message' => 'Balance-ul a fost actualizat cu succes!',
        'old_balance' => $old_balance,
        'new_balance' => $balance,
        'client_id' => $client_id
    ]);

} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
