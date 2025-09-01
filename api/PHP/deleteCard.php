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

if (!$data || !isset($data['id'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifică dacă există cardul
    $stmt = $conn->prepare("SELECT id FROM cards WHERE id = ?");
    $stmt->execute([$data['id']]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Cardul nu există!']);
        exit;
    }

    // Șterge cardul
    $stmt = $conn->prepare("DELETE FROM cards WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 