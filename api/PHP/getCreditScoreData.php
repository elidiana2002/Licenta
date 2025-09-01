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

if (!$data || !isset($data['client_id'])) {
    echo json_encode(['error' => 'ID-ul clientului este obligatoriu']);
    exit;
}

$client_id = intval($data['client_id']);

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obține datele financiare pentru calculul credit score
    // Pentru moment, vom folosi datele din account-uri ca aproximare
    
    // 1. Venit lunar - aproximat din balance-ul total al account-urilor
    $stmt = $conn->prepare("
        SELECT SUM(balance) as total_balance
        FROM accounts 
        WHERE client_id = ?
    ");
    $stmt->execute([$client_id]);
    $balance_data = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_balance = $balance_data['total_balance'] ?? 0;
    
    // Aproximăm venitul lunar ca 10% din balance-ul total (exemplu)
    $monthly_income = $total_balance * 0.1;
    
    // 2. Cheltuieli lunare - aproximat ca 60% din venitul lunar
    $monthly_expenses = $monthly_income * 0.6;
    
    // 3. Datorii totale - aproximat ca 20% din balance-ul total
    $total_debts = $total_balance * 0.2;
    
    // Verifică dacă avem date suficiente
    if ($total_balance <= 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Nu există date financiare suficiente pentru calculul automat'
        ]);
        exit;
    }
    
    // Returnează datele calculate
    echo json_encode([
        'success' => true,
        'income' => round($monthly_income, 2),
        'expenses' => round($monthly_expenses, 2),
        'debts' => round($total_debts, 2),
        'total_balance' => round($total_balance, 2),
        'message' => 'Datele au fost calculate automat din informațiile financiare disponibile'
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
