<?php
// Debug: să vedem dacă scriptul rulează
error_log('=== getBanks.php START ===');

// Afișează erorile PHP
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header('Content-Type: application/json');

// Debug: să vedem dacă headers sunt setate
error_log('Headers set successfully');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obține toate băncile
    $stmt = $conn->prepare("SELECT id, name FROM banks ORDER BY name");
    $stmt->execute();
    $banks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: să vedem ce bănci am găsit
    error_log('Found banks: ' . print_r($banks, true));
    
    echo json_encode([
        'success' => true,
        'banks' => $banks
    ]);
    
    // Debug: să vedem dacă răspunsul a fost trimis
    error_log('Response sent successfully');
    
} catch(PDOException $e) {
    error_log('PDO Exception: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Debug: să vedem dacă scriptul se termină normal
error_log('=== getBanks.php END ===');
?>
