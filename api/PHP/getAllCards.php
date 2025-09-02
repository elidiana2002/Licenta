<?php
// Dezactivează afișarea erorilor pentru a nu strica JSON-ul
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');

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

    $stmt = $conn->prepare("
        SELECT 
            c.id,
            c.card_number,
            c.card_type,
            c.status,
            c.expiration_date as expiry_date,
            c.cvv
        FROM cards c
        ORDER BY c.id DESC
    ");
    
    $stmt->execute();
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'cards' => $cards
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la încărcarea cardurilor: ' . $e->getMessage()
    ]);
}
?>
