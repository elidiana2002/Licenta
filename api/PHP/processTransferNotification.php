<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Cache-Control, Pragma');
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
    echo json_encode(['error' => 'Date lipsă pentru procesarea notificării']);
    exit;
}

$transaction_id = intval($data['transaction_id']);
$action = $data['action']; // 'accept' sau 'reject'
$client_id = intval($data['client_id'] ?? 0);

if (!in_array($action, ['accept', 'reject', 'cancel'])) {
    echo json_encode(['error' => 'Acțiune invalidă. Opțiuni: accept, reject, cancel']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Începe tranzacția
    $conn->beginTransaction();
    
    // Verifică că tranzacția există și este în status pending
    $stmt = $conn->prepare("
        SELECT t.*, 
               a1.balance as from_balance, a1.currency as from_currency,
               a2.balance as to_balance, a2.currency as to_currency,
               a1.client_id as from_client_id, a2.client_id as to_client_id
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
    
    // Verifică că clientul care face acțiunea este destinatarul
    if ($client_id > 0 && $transaction['to_client_id'] != $client_id) {
        throw new Exception('Nu poți procesa această notificare');
    }
    
    if ($action === 'accept') {
        // Acceptă transferul - actualizează balance-urile
        $amount = floatval($transaction['amount']);
        
        // Scade din account-ul sursă
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['account_id']]);
        
        // Adaugă în account-ul destinație
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['destination_account_id']]);
        
        // Actualizează status-ul tranzacției
        $stmt = $conn->prepare("UPDATE transactions SET status = 'accepted' WHERE id = ?");
        $stmt->execute([$transaction_id]);
        
        // Înregistrează în istoric
        $stmt = $conn->prepare("
            INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
            VALUES (?, ?, 'transfer_accepted', ?, ?, NOW(), 'client')
        ");
        $stmt->execute([$transaction['to_client_id'], $transaction['destination_account_id'], $transaction['to_balance'], $transaction['to_balance'] + $amount]);
        
        $message = 'Transfer acceptat cu succes!';
        
    } elseif ($action === 'reject') {
        // Respinge transferul - returnează banii
        $amount = floatval($transaction['amount']);
        
        // Adaugă înapoi în account-ul sursă
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['account_id']]);
        
        // Actualizează status-ul tranzacției
        $stmt = $conn->prepare("UPDATE transactions SET status = 'rejected' WHERE id = ?");
        $stmt->execute([$transaction_id]);
        
        // Înregistrează în istoric
        $stmt = $conn->prepare("
            INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
            VALUES (?, ?, 'transfer_rejected', ?, ?, NOW(), 'client')
        ");
        $stmt->execute([$transaction['from_client_id'], $transaction['account_id'], $transaction['from_balance'], $transaction['from_balance'] + $amount]);
        
        $message = 'Transfer respins și banii returnați!';
        
    } elseif ($action === 'cancel') {
        // Anulează tranzacția - returnează banii în account-ul sursă
        $amount = floatval($transaction['amount']);
        
        // Adaugă înapoi în account-ul sursă
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['account_id']]);
        
        // Actualizează status-ul tranzacției
        $stmt = $conn->prepare("UPDATE transactions SET status = 'cancelled' WHERE id = ?");
        $stmt->execute([$transaction_id]);
        
        // Înregistrează în istoric
        $stmt = $conn->prepare("
            INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
            VALUES (?, ?, 'transfer_cancelled', ?, ?, NOW(), 'client')
        ");
        $stmt->execute([$transaction['from_client_id'], $transaction['account_id'], $transaction['from_balance'], $transaction['from_balance'] + $amount]);
        
        $message = 'Tranzacția a fost anulată cu succes!';
    }
    
    // Confirmă tranzacția
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'transaction_id' => $transaction_id,
        'action' => $action,
        'status' => $action === 'accept' ? 'accepted' : ($action === 'reject' ? 'rejected' : 'cancelled')
    ]);
    
} catch(PDOException $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    echo json_encode(['error' => $e->getMessage()]);
}
?>
