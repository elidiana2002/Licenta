<?php

header('Content-Type: application/json');

// Răspunde la preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ... restul codului ...
$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Verifică dacă email-ul există deja în clients
    $stmt = $conn->prepare("SELECT id FROM clients WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['error' => 'Email-ul există deja în baza de date!']);
        exit;
    }

    // 2. Verifică dacă CNP-ul există deja în clients
    $stmt = $conn->prepare("SELECT id FROM clients WHERE CNP = ?");
    $stmt->execute([$data['CNP']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['error' => 'CNP-ul există deja în baza de date!']);
        exit;
    }

    // Hash parola
    $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);

    // 3. Creează clientul cu toate informațiile
    $stmt = $conn->prepare("INSERT INTO clients (first_name, last_name, email, password_hash, CNP, address, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'user')");
    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $password_hash,
        $data['CNP'],
        $data['address'],
        $data['phone']
    ]);

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 