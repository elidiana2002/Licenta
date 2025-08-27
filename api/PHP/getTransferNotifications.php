<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control, Pragma');
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
    echo json_encode(['error' => 'ID-ul clientului este obligatoriu']);
    exit;
}

$client_id = intval($data['client_id']);

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obține transferurile în așteptare pentru clientul curent
    $stmt = $conn->prepare("
        SELECT 
            t.id,
            t.amount,
            t.currency,
            t.status,
            t.transaction_type,
            t.method,
            t.description,
            t.created_at,
            -- Informații despre account-ul sursă
            a1.iban as from_iban,
            c1.first_name as from_first_name,
            c1.last_name as from_last_name,
            b1.name as from_bank_name,
            -- Informații despre account-ul destinație (clientul curent)
            a2.iban as to_iban,
            c2.first_name as to_first_name,
            c2.last_name as to_last_name,
            b2.name as to_bank_name
        FROM transactions t
        INNER JOIN accounts a1 ON t.account_id = a1.id
        INNER JOIN accounts a2 ON t.destination_account_id = a2.id
        INNER JOIN clients c1 ON a1.client_id = c1.id
        INNER JOIN clients c2 ON a2.client_id = c2.id
        INNER JOIN banks b1 ON a1.bank_id = b1.id
        INNER JOIN banks b2 ON a2.bank_id = b2.id
        WHERE t.status = 'pending'
        AND a2.client_id = ?  -- Doar transferurile către clientul curent
        ORDER BY t.created_at DESC
    ");
    
    $stmt->execute([$client_id]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatează notificările pentru frontend
    $formattedNotifications = array_map(function($notification) {
        $senderName = $notification['from_first_name'] . ' ' . $notification['from_last_name'];
        $senderBank = $notification['from_bank_name'];
        $amount = number_format($notification['amount'], 2);
        $currency = $notification['currency'];
        $date = date('d.m.Y H:i', strtotime($notification['created_at']));
        
        return [
            'id' => $notification['id'],
            'title' => "Transfer de la $senderName",
            'message' => "Ai primit $amount $currency de la $senderName ($senderBank)",
            'amount' => $notification['amount'],
            'currency' => $currency,
            'sender_name' => $senderName,
            'sender_bank' => $senderBank,
            'sender_iban' => $notification['from_iban'],
            'date' => $date,
            'created_at' => $notification['created_at'],
            'status' => $notification['status'],
            'transaction_type' => $notification['transaction_type'],
            'method' => $notification['method']
        ];
    }, $notifications);
    
    echo json_encode([
        'success' => true,
        'notifications' => $formattedNotifications,
        'count' => count($formattedNotifications)
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
