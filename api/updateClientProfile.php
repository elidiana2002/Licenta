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

if (!$data || !isset($data['id'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Update doar câmpurile permise (fără role)
    $stmt = $conn->prepare("UPDATE clients SET first_name=?, last_name=?, email=?, address=?, phone=? WHERE id=?");
    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['address'],
        $data['phone'],
        $data['id']
    ]);

    // Update parola dacă a fost trimisă și nu e goală
    if (!empty($data['password'])) {
        $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt2 = $conn->prepare("UPDATE clients SET password_hash=? WHERE id=?");
        $stmt2->execute([$password_hash, $data['id']]);
    }

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>