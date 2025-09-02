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

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Update cardul
    $stmt = $conn->prepare("
        UPDATE cards 
        SET 
            card_number = ?,
            card_type = ?,
            status = ?,
            expiration_date = ?,
            cvv = ?
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['card_number'],
        $data['card_type'],
        $data['status'],
        $data['expiry_date'],
        $data['cvv'],
        $data['id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Card actualizat cu succes'
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la actualizarea cardului: ' . $e->getMessage()
    ]);
}
?>