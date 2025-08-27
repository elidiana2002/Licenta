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

if (!$data || !isset($data['client_id']) || !isset($data['recipient_phone'])) {
    echo json_encode(['error' => 'Date lipsă pentru salvarea destinatarului']);
    exit;
}

$client_id = intval($data['client_id']);
$recipient_phone = $data['recipient_phone'];
$recipient_name = $data['recipient_name'] ?? '';
$recipient_bank = $data['recipient_bank'] ?? '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
         // Verifică dacă destinatarul există în baza de date
     $stmt = $conn->prepare("
         SELECT c.id, c.first_name, c.last_name, c.phone, b.name as bank_name
         FROM clients c
         INNER JOIN accounts a ON c.id = a.client_id
         INNER JOIN banks b ON a.bank_id = b.id
         WHERE c.phone = ?
         LIMIT 1
     ");
    $stmt->execute([$recipient_phone]);
    $recipient = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$recipient) {
        echo json_encode(['error' => 'Destinatarul nu a fost găsit în sistem']);
        exit;
    }
    
    // Verifică dacă destinatarul este deja salvat pentru acest client
    $stmt = $conn->prepare("
        SELECT id FROM saved_recipients 
        WHERE client_id = ? AND recipient_phone = ?
    ");
    $stmt->execute([$client_id, $recipient_phone]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        echo json_encode(['error' => 'Destinatarul este deja salvat în lista ta']);
        exit;
    }
    
    // Salvează destinatarul
    $stmt = $conn->prepare("
        INSERT INTO saved_recipients (
            client_id, 
            recipient_phone, 
            recipient_name, 
            recipient_bank, 
            created_at
        ) VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $client_id,
        $recipient_phone,
        $recipient_name ?: ($recipient['first_name'] . ' ' . $recipient['last_name']),
        $recipient_bank ?: $recipient['bank_name']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Destinatar salvat cu succes!',
        'recipient' => [
            'phone' => $recipient_phone,
            'name' => $recipient['first_name'] . ' ' . $recipient['last_name'],
            'bank' => $recipient['bank_name']
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
