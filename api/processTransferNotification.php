<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control, Pragma, Authorization');
header('Access-Control-Max-Age: 86400');
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

if (!$data || !isset($data['transaction_id']) || !isset($data['action'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

$transaction_id = intval($data['transaction_id']);
$action = $data['action']; // 'accept', 'reject', 'return'

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $conn->beginTransaction();
    
    // Obține detaliile tranzacției
    $stmt = $conn->prepare("
        SELECT 
            t.*,
            a1.balance as source_balance,
            a2.balance as destination_balance,
            a1.client_id as source_client_id,
            a2.client_id as destination_client_id
        FROM transactions t
        INNER JOIN accounts a1 ON t.account_id = a1.id
        INNER JOIN accounts a2 ON t.destination_account_id = a2.id
        WHERE t.id = ? AND t.status = 'pending'
    ");
    
    $stmt->execute([$transaction_id]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$transaction) {
        throw new Exception('Tranzacția nu a fost găsită sau nu este în așteptare');
    }
    
    if ($action === 'accept') {
        // Acceptă transferul
        $new_status = 'accepted';
        
        // Actualizează soldurile
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$transaction['amount'], $transaction['account_id']]);
        
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$transaction['amount'], $transaction['destination_account_id']]);
        
        // Actualizează statusul tranzacției
        $stmt = $conn->prepare("UPDATE transactions SET status = ?, balance_after = ? WHERE id = ?");
        $stmt->execute([$new_status, $transaction['source_balance'] - $transaction['amount'], $transaction_id]);
        
    } elseif ($action === 'reject') {
        // Respinge transferul
        $new_status = 'rejected';
        
        // Actualizează statusul tranzacției
        $stmt = $conn->prepare("UPDATE transactions SET status = ? WHERE id = ?");
        $stmt->execute([$new_status, $transaction_id]);
        
    } elseif ($action === 'return') {
        // Returnează banii (doar dacă transferul a fost acceptat anterior)
        if ($transaction['status'] !== 'accepted') {
            throw new Exception('Nu se pot returna banii pentru o tranzacție neacceptată');
        }
        
        $new_status = 'returned';
        
        // Returnează banii
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$transaction['amount'], $transaction['account_id']]);
        
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$transaction['amount'], $transaction['destination_account_id']]);
        
        // Actualizează statusul tranzacției
        $stmt = $conn->prepare("UPDATE transactions SET status = ? WHERE id = ?");
        $stmt->execute([$new_status, $transaction_id]);
        
    } else {
        throw new Exception('Acțiune invalidă');
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Tranzacția a fost procesată cu succes',
        'new_status' => $new_status
    ]);
    
} catch(PDOException $e) {
    if (isset($conn)) $conn->rollBack();
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    if (isset($conn)) $conn->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}
?>
