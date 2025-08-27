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

if (!$data || !isset($data['from_account_id']) || !isset($data['amount']) || !isset($data['client_id'])) {
    echo json_encode(['error' => 'Date lipsă pentru transfer']);
    exit;
}

$from_account_id = intval($data['from_account_id']);
$amount = floatval($data['amount']);
$client_id = intval($data['client_id']);
$transfer_type = $data['transfer_type'] ?? 'normal';

if ($amount <= 0) {
    echo json_encode(['error' => 'Suma trebuie să fie pozitivă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Începe tranzacția
    $conn->beginTransaction();
    
    // Verifică balance-ul account-ului sursă
    $stmt = $conn->prepare("SELECT balance, currency FROM accounts WHERE id = ?");
    $stmt->execute([$from_account_id]);
    $from_account = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$from_account) {
        throw new Exception('Account-ul sursă nu a fost găsit');
    }
    
    if ($from_account['balance'] < $amount) {
        throw new Exception('Balance insuficient pentru transfer');
    }
    
    $currency = $from_account['currency'];
    $to_account_id = null;
    
         // Determină account-ul destinație în funcție de tipul transferului
     if ($transfer_type === 'phone') {
         // Transfer prin numărul de telefon - identificator unic
         $recipient_phone = $data['to_phone'] ?? '';
         
         if (empty($recipient_phone)) {
             throw new Exception('Numărul de telefon al destinatarului este obligatoriu pentru transfer prin telefon');
         }
         
         // Validează formatul numărului de telefon (simplu)
         if (strlen($recipient_phone) < 10 || strlen($recipient_phone) > 15) {
             throw new Exception('Format număr de telefon invalid');
         }
         
         // Găsește account-ul destinatarului după numărul de telefon
         $stmt = $conn->prepare("
             SELECT a.id, a.currency, a.balance, c.phone, c.first_name, c.last_name, b.name as bank_name
             FROM accounts a 
             INNER JOIN clients c ON a.client_id = c.id 
             INNER JOIN banks b ON a.bank_id = b.id
             WHERE c.phone = ? 
             AND a.id != ?
         ");
         $stmt->execute([$recipient_phone, $from_account_id]);
         $to_account = $stmt->fetch(PDO::FETCH_ASSOC);
         
         if (!$to_account) {
             throw new Exception("Nu s-a găsit un account pentru destinatarul cu numărul de telefon: $recipient_phone");
         }
         
         $to_account_id = $to_account['id'];
         
         // Verifică dacă monedele se potrivesc între accounturi
         if ($from_account['currency'] !== $to_account['currency']) {
             throw new Exception('Monedele nu se potrivesc între accounturi');
         }
         

        
    } elseif ($transfer_type === 'iban') {
        // Transfer prin IBAN
        $to_iban = $data['to_iban'] ?? '';
        
        if (empty($to_iban)) {
            throw new Exception('IBAN-ul destinatarului este obligatoriu pentru transfer prin IBAN');
        }
        
        // Validează formatul IBAN (simplu)
        if (strlen($to_iban) < 10 || strlen($to_iban) > 34) {
            throw new Exception('Format IBAN invalid');
        }
        
        // Găsește account-ul destinatarului după IBAN
        $stmt = $conn->prepare("
            SELECT a.id, a.currency, a.balance, a.client_id,
                   c.first_name, c.last_name, b.name as bank_name
            FROM accounts a 
            INNER JOIN clients c ON a.client_id = c.id 
            INNER JOIN banks b ON a.bank_id = b.id
            WHERE a.iban = ? 
            AND a.id != ?
        ");
        $stmt->execute([$to_iban, $from_account_id]);
        $to_account = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$to_account) {
            throw new Exception("Nu s-a găsit un account cu IBAN-ul: $to_iban");
        }
        
        $to_account_id = $to_account['id'];
        
        // Verifică dacă monedele se potrivesc între accounturi
        if ($from_account['currency'] !== $to_account['currency']) {
            throw new Exception('Monedele nu se potrivesc între accounturi');
        }
        
    } elseif (isset($data['to_account_id'])) {
        // Transfer normal între accounturi
        $to_account_id = intval($data['to_account_id']);
        
        // Verifică account-ul destinație
        $stmt = $conn->prepare("SELECT id, currency, balance FROM accounts WHERE id = ?");
        $stmt->execute([$to_account_id]);
        $to_account = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$to_account) {
            throw new Exception('Account-ul destinație nu a fost găsit');
        }
        
        // Verifică dacă monedele se potrivesc între accounturi
        if ($from_account['currency'] !== $to_account['currency']) {
            throw new Exception('Monedele nu se potrivesc între accounturi');
        }
        
         } else {
         throw new Exception('Tip de transfer invalid. Opțiuni: phone, iban, normal');
     }
    
    // Verifică dacă este transfer intern (de la tine la tine)
    $is_internal_transfer = ($from_account_id === $to_account_id);
    
    // Obține account_id direct (nu mai avem nevoie de card_id)
    $account_id = $from_account_id;
    
    // Verifică că account_id este valid
    if ($account_id <= 0) {
        throw new Exception('account_id invalid: ' . $account_id);
    }
    
    // Actualizează balance-urile
    $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
    $stmt->execute([$amount, $from_account_id]);
    
    if (!$is_internal_transfer) {
        $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
        $stmt->execute([$amount, $to_account_id]);
    }
    
    // Obține balance-ul actualizat pentru account-ul sursă
    $stmt = $conn->prepare("SELECT balance FROM accounts WHERE id = ?");
    $stmt->execute([$from_account_id]);
    $updated_balance = $stmt->fetch(PDO::FETCH_ASSOC)['balance'];
    
    // Înregistrează transferul în istoric
    $stmt = $conn->prepare("INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) VALUES (?, ?, 'transfer_out', ?, ?, NOW(), 'system')");
    $stmt->execute([$client_id, $from_account_id, $from_account['balance'], $updated_balance]);
    
    if (!$is_internal_transfer) {
        $stmt = $conn->prepare("INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by) VALUES (?, ?, 'transfer_in', ?, ?, NOW(), 'system')");
        $stmt->execute([$client_id, $to_account_id, $to_account['balance'], $to_account['balance'] + $amount]);
    }
    
    // Obține destination_account_id direct (nu mai avem nevoie de destination_card_id)
    $destination_account_id = $to_account_id;
    
    // Verifică că destination_account_id este valid
    if ($destination_account_id <= 0) {
        throw new Exception('destination_account_id invalid: ' . $destination_account_id);
    }
    
    $description = $is_internal_transfer 
        ? "Transfer intern în account #$from_account_id" 
        : "Transfer de la account #$from_account_id către account #$to_account_id";
        
    // Folosește balance-ul actualizat
    $balance_after = $updated_balance;
    
    // Debug: afișează valorile găsite
    error_log("Transfer debug - from_account_id: $from_account_id, to_account_id: $to_account_id");
    error_log("Transfer debug - account_id: $account_id, destination_account_id: $destination_account_id");
    
    // Verificare finală înainte de INSERT
    if ($account_id <= 0 || $destination_account_id <= 0) {
        throw new Exception("Valori invalide pentru account_id: $account_id, destination_account_id: $destination_account_id");
    }
    
    // Verifică că account-urile există în baza de date
    $stmt = $conn->prepare("SELECT COUNT(*) FROM accounts WHERE id IN (?, ?)");
    $stmt->execute([$account_id, $destination_account_id]);
    $accounts_count = $stmt->fetchColumn();
    
    if ($accounts_count !== 2) {
        throw new Exception("Unul sau ambele account-uri nu există în baza de date");
    }
    
         // Salvează tranzacția la nivel de accounturi cu status pending
     $stmt = $conn->prepare("
         INSERT INTO transactions (
             account_id, 
             destination_account_id, 
             amount, 
             currency, 
             status, 
             transaction_type, 
             method, 
             category, 
             description, 
             balance_after, 
             created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ");
     $stmt->execute([
         $account_id,           // 1. account_id
         $destination_account_id, // 2. destination_account_id
         $amount,            // 3. amount
         $currency,          // 4. currency
         'pending',          // 5. status - PENDING în loc de completed
         'transfer',         // 6. transaction_type
         'IBAN',            // 7. method
         'other',            // 8. category
         $description,       // 9. description
         $balance_after      // 10. balance_after
     ]);
    
    // Confirmă tranzacția
    $conn->commit();
    
         // Mesaj de succes în funcție de tipul transferului
     if ($is_internal_transfer) {
         $success_message = 'Transfer intern realizat cu succes!';
     } elseif ($transfer_type === 'phone') {
         $recipient_name = $to_account['first_name'] . ' ' . $to_account['last_name'];
         $bank_name = $to_account['bank_name'];
         $success_message = "Transfer prin telefon către $recipient_name ($bank_name) în așteptare de aprobare!";
     } elseif ($transfer_type === 'iban') {
         $recipient_name = $to_account['first_name'] . ' ' . $to_account['last_name'];
         $bank_name = $to_account['bank_name'];
         $success_message = "Transfer prin IBAN către $recipient_name ($bank_name) în așteptare de aprobare!";
     } else {
         $success_message = 'Transfer în așteptare de aprobare!';
     }
    
    echo json_encode([
        'success' => true,
        'message' => $success_message,
        'amount' => $amount,
        'currency' => $currency,
        'transfer_type' => $transfer_type,
        'is_internal' => $is_internal_transfer
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
