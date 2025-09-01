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

if (!$data || !isset($data['email'])) {
    echo json_encode(['error' => 'Email lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Caută clientul direct în tabela clients (care conține toate informațiile)
    $stmt = $conn->prepare("SELECT id, first_name, last_name, email, address, phone, role FROM clients WHERE email = ?");
    $stmt->execute([$data['email']]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($client) {
        // Obține istoricul modificărilor pentru client din tabela 'history'
        $stmt2 = $conn->prepare("SELECT id, field_changed, old_value, new_value, changed_at, account_id, changed_by FROM history WHERE client_id = ? ORDER BY changed_at DESC");
        $stmt2->execute([$client['id']]);
        $istoric = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'client' => $client, 'istoric' => $istoric]);
    } else {
        echo json_encode(['error' => 'Clientul nu a fost găsit!']);
    }
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
