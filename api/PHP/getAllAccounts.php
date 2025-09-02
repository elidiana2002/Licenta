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
            a.id,
            a.iban,
            a.balance,
            a.account_type,
            b.name as bank_name
        FROM accounts a
        LEFT JOIN banks b ON a.bank_id = b.id
        ORDER BY a.id DESC
    ");
    
    $stmt->execute();
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'accounts' => $accounts
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la încărcarea conturilor: ' . $e->getMessage()
    ]);
}
?>
