<?php
header('Content-Type: application/json');

// Răspunde la preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Conectare la baza de date
$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Eroare de conectare la baza de date: ' . $e->getMessage()]);
    exit;
}

// Acceptă doar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metoda HTTP nu este permisă']);
    exit;
}

// Obține datele din request
$input = json_decode(file_get_contents('php://input'), true);
$client_id = $input['client_id'] ?? null;

if (!$client_id) {
    echo json_encode(['success' => false, 'error' => 'ID-ul clientului este obligatoriu']);
    exit;
}

try {
    // Obține toate accounturile clientului cu balance-urile
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.iban,
            a.balance,
            a.currency,
            a.account_type,
            a.card_id,
            b.name as bank_name
        FROM accounts a
        LEFT JOIN banks b ON a.bank_id = b.id
        WHERE a.client_id = ?
        ORDER BY a.id ASC
    ");
    
    $stmt->execute([$client_id]);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculează balance-ul total
    $total_balance = 0;
    foreach ($accounts as $account) {
        $total_balance += floatval($account['balance']);
    }
    
    echo json_encode([
        'success' => true,
        'accounts' => $accounts,
        'total_balance' => $total_balance,
        'count' => count($accounts)
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Eroare la interogarea bazei de date: ' . $e->getMessage()]);
}
?>
