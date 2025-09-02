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
            t.id,
            t.description,
            t.amount,
            t.status,
            t.transaction_type,
            t.method,
            t.source_balance_after,
            t.destination_balance_after,
            t.created_at
        FROM transactions t
        ORDER BY t.created_at DESC
    ");
    
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'transactions' => $transactions
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la încărcarea tranzacțiilor: ' . $e->getMessage()
    ]);
}
?>
