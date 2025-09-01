<?php

header('Content-Type: application/json');

// Configurare conexiune baza de date
$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obține toți clienții din tabela clients
    $stmt = $conn->prepare("SELECT id, first_name, last_name, email, CNP, address, phone, role, created_at FROM clients ORDER BY created_at DESC");
    $stmt->execute();
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($clients) {
        echo json_encode([
            'success' => true,
            'users' => $clients
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Nu s-au găsit utilizatori'
        ]);
    }

} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 