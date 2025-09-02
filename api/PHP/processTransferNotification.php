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

if (!$data || !isset($data['transaction_id']) || !isset($data['action'])) {
    echo json_encode(['error' => 'Date lipsă pentru procesarea notificării']);
    exit;
}

$transaction_id = intval($data['transaction_id']);
$action = $data['action']; // 'accept' sau 'reject'
$client_id = intval($data['client_id'] ?? 0);

if (!in_array($action, ['accept', 'reject', 'cancel', 'return'])) {
    echo json_encode(['error' => 'Acțiune invalidă. Opțiuni: accept, reject, cancel, return']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Începe tranzacția
    $conn->beginTransaction();
    
    // Verifică că tranzacția există și este în status pending sau accepted (pentru return)
    $stmt = $conn->prepare("
        SELECT t.*, 
               a1.balance as from_balance, a1.currency as from_currency,
               a2.balance as to_balance, a2.currency as to_currency,
               a1.client_id as from_client_id, a2.client_id as to_client_id
        FROM transactions t
        INNER JOIN accounts a1 ON t.account_id = a1.id
        INNER JOIN accounts a2 ON t.destination_account_id = a2.id
        WHERE t.id = ? AND (t.status = 'pending' OR (t.status = 'accepted' AND ? = 'return'))
    ");
    $stmt->execute([$transaction_id, $action]);
    $transaction = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$transaction) {
        if ($action === 'return') {
            throw new Exception('Tranzacția nu a fost găsită sau nu este acceptată');
        } else {
            throw new Exception('Tranzacția nu a fost găsită sau nu este în așteptare');
        }
    }
    
    // Verifică că clientul care face acțiunea este destinatarul
    if ($client_id > 0 && $transaction['to_client_id'] != $client_id) {
        throw new Exception('Nu poți procesa această notificare');
    }
    
    if ($action === 'accept') {
        // Acceptă transferul - actualizează balance-urile
        $amount = floatval($transaction['amount']);
        
        // Pentru tranzacții pending, banii nu au fost scăzuți încă din account-ul sursă
        // Pentru tranzacții completed, banii au fost deja scăzuți
        if ($transaction['status'] === 'pending') {
            // Scade din account-ul sursă (primul transfer efectiv)
            $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
            $stmt->execute([$amount, $transaction['account_id']]);
        }
        // Pentru tranzacții completed, nu se face nimic (banii au fost deja scăzuți)
        
        // Adaugă în account-ul destinație
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['destination_account_id']]);
        
        // Obține balance-urile actualizate
        $stmt = $conn->prepare("SELECT balance FROM accounts WHERE id = ?");
        $stmt->execute([$transaction['account_id']]);
        $new_source_balance = $stmt->fetchColumn();
        
        $stmt = $conn->prepare("SELECT balance FROM accounts WHERE id = ?");
        $stmt->execute([$transaction['destination_account_id']]);
        $new_destination_balance = $stmt->fetchColumn();
        
        // Actualizează status-ul tranzacției și balance-urile
        $stmt = $conn->prepare("UPDATE transactions SET status = 'accepted', source_balance_after = ?, destination_balance_after = ? WHERE id = ?");
        $stmt->execute([$new_source_balance, $new_destination_balance, $transaction_id]);
        
        // Înregistrează în istoric - modificări reale de balance
        $stmt = $conn->prepare("
            INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
            VALUES (?, ?, 'transfer_accepted', ?, ?, NOW(), 'client')
        ");
        $stmt->execute([$transaction['to_client_id'], $transaction['destination_account_id'], $transaction['to_balance'], $transaction['to_balance'] + $amount]);
        
        // Înregistrează și scăderea din account-ul sursă dacă era pending
        if ($transaction['status'] === 'pending') {
            $stmt = $conn->prepare("
                INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
                VALUES (?, ?, 'transfer_accepted_source', ?, ?, NOW(), 'client')
            ");
            $stmt->execute([$transaction['from_client_id'], $transaction['account_id'], $transaction['from_balance'], $transaction['from_balance'] - $amount]);
        }
        
        $message = 'Transfer acceptat cu succes!';
        
         } elseif ($action === 'reject') {
         // Respinge transferul - pentru tranzacții pending, nu returnează nimic 
         // deoarece banii nu au fost scăzuți încă
         $amount = floatval($transaction['amount']);
         
         // Nu este nevoie să returnezi banii pentru tranzacții pending
         // deoarece nu au fost scăzuți din account când s-a creat tranzacția
         
         // Actualizează status-ul tranzacției
         $stmt = $conn->prepare("UPDATE transactions SET status = 'rejected' WHERE id = ?");
         $stmt->execute([$transaction_id]);
         
         // Înregistrează în istoric - doar status-ul, nu modificări de balance
         $stmt = $conn->prepare("
             INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
             VALUES (?, ?, 'transfer_rejected', ?, ?, NOW(), 'client')
         ");
         $stmt->execute([$transaction['from_client_id'], $transaction['account_id'], 'pending', 'rejected']);
         
         $message = 'Transfer respins!';
        
         } elseif ($action === 'cancel') {
         // Anulează - pentru tranzacții pending, nu returnează nimic
         // deoarece banii nu au fost scăzuți încă
         $amount = floatval($transaction['amount']);
         
         // Nu este nevoie să returnezi banii pentru tranzacții pending
         // deoarece nu au fost scăzuți din account când s-a creat tranzacția
         
         // Actualizează status-ul tranzacției
         $stmt = $conn->prepare("UPDATE transactions SET status = 'cancelled' WHERE id = ?");
         $stmt->execute([$transaction_id]);
         
         // Înregistrează în istoric - doar status-ul, nu modificări de balance
         $stmt = $conn->prepare("
             INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
             VALUES (?, ?, 'transfer_cancelled', ?, ?, NOW(), 'client')
         ");
         $stmt->execute([$transaction['from_client_id'], $transaction['account_id'], 'pending', 'cancelled']);
         
         $message = 'Tranzacția a fost anulată!';
        
    } elseif ($action === 'return') {
        // Returnează banii - doar pentru tranzacții acceptate
        // Verifică că tranzacția este acceptată
        if ($transaction['status'] !== 'accepted') {
            throw new Exception('Poți returna banii doar pentru tranzacții acceptate');
        }
        
        $amount = floatval($transaction['amount']);
        
        // Returnează banii de la destinație la sursă
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['destination_account_id']]);
        
        // Adaugă înapoi în account-ul sursă
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$amount, $transaction['account_id']]);
        
        // Obține balance-urile actualizate după return
        $stmt = $conn->prepare("SELECT balance FROM accounts WHERE id = ?");
        $stmt->execute([$transaction['account_id']]);
        $new_source_balance = $stmt->fetchColumn();
        
        $stmt = $conn->prepare("SELECT balance FROM accounts WHERE id = ?");
        $stmt->execute([$transaction['destination_account_id']]);
        $new_destination_balance = $stmt->fetchColumn();
        
        // Actualizează status-ul tranzacției și balance-urile
        $stmt = $conn->prepare("UPDATE transactions SET status = 'returned', source_balance_after = ?, destination_balance_after = ? WHERE id = ?");
        $stmt->execute([$new_source_balance, $new_destination_balance, $transaction_id]);
        
                 // Înregistrează în istoric - modificări reale de balance
         $stmt = $conn->prepare("
             INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) 
             VALUES (?, ?, 'transfer_returned', ?, ?, NOW(), 'client')
         ");
         $stmt->execute([$transaction['to_client_id'], $transaction['destination_account_id'], $transaction['to_balance'], $transaction['to_balance'] - $amount]);
         
         $message = 'Banii au fost returnați cu succes!';
    }
    
    // Confirmă tranzacția
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'transaction_id' => $transaction_id,
        'action' => $action,
        'status' => $action === 'accept' ? 'accepted' : ($action === 'reject' ? 'rejected' : ($action === 'cancel' ? 'cancelled' : 'returned'))
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
