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

if (!$data || !isset($data['client_id'])) {
    echo json_encode(['error' => 'ID-ul clientului este obligatoriu']);
    exit;
}

$client_id = intval($data['client_id']);

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obține destinatarii salvați pentru clientul curent
    $stmt = $conn->prepare("
        SELECT 
            sr.id,
            sr.recipient_phone,
            sr.recipient_name,
            sr.recipient_bank,
            sr.created_at,
            -- Informații suplimentare din baza de date
            c.first_name,
            c.last_name,
            a.currency,
            b.name as current_bank_name
                 FROM saved_recipients sr
         LEFT JOIN clients c ON c.phone = sr.recipient_phone
         LEFT JOIN accounts a ON c.id = a.client_id
         LEFT JOIN banks b ON a.bank_id = b.id
        WHERE sr.client_id = ?
        ORDER BY sr.created_at DESC
        LIMIT 5
    ");
    
    $stmt->execute([$client_id]);
    $savedRecipients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatează destinatarii pentru frontend
    $formattedRecipients = array_map(function($recipient) {
        $name = $recipient['recipient_name'] ?: ($recipient['first_name'] . ' ' . $recipient['last_name']);
        $bank = $recipient['recipient_bank'] ?: $recipient['current_bank_name'];
        $currency = $recipient['currency'] ?: 'N/A';
        $date = date('d.m.Y', strtotime($recipient['created_at']));
        
        return [
            'id' => $recipient['id'],
            'phone' => $recipient['recipient_phone'],
            'name' => $name,
            'bank' => $bank,
            'currency' => $currency,
            'date_saved' => $date,
            'created_at' => $recipient['created_at']
        ];
    }, $savedRecipients);
    
    echo json_encode([
        'success' => true,
        'recipients' => $formattedRecipients,
        'count' => count($formattedRecipients)
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
