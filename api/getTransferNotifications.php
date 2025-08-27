<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control, Pragma, Authorization');
header('Access-Control-Max-Age: 86400');
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
    echo json_encode(['error' => 'Client ID lipsă']);
    exit;
}

$client_id = intval($data['client_id']);

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obține notificările de transfer (tranzacții în așteptare unde clientul primește bani)
    $stmt = $conn->prepare("
        SELECT 
            t.id,
            t.amount,
            t.currency,
            t.description,
            t.created_at,
            CONCAT(c1.first_name, ' ', c1.last_name) as sender_name,
            a1.iban as sender_iban,
            b1.name as sender_bank
        FROM transactions t
        INNER JOIN accounts a1 ON t.account_id = a1.id
        INNER JOIN clients c1 ON a1.client_id = c1.id
        INNER JOIN banks b1 ON a1.bank_id = b1.id
        WHERE t.destination_account_id IN (
            SELECT id FROM accounts WHERE client_id = ?
        )
        AND t.status = 'pending'
        AND t.transaction_type = 'transfer'
        ORDER BY t.created_at DESC
    ");
    
    $stmt->execute([$client_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatează datele
    foreach ($notifications as &$notification) {
        $notification['created_at'] = date('d.m.Y H:i', strtotime($notification['created_at']));
        $notification['amount_formatted'] = number_format($notification['amount'], 2);
    }
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'count' => count($notifications)
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
