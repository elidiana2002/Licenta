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

// Funcții helper pentru iconițe (compatibile cu PHP 7.4+)
function getTypeIcon($transaction_type) {
    switch($transaction_type) {
        case 'payment': return '💳';
        case 'withdrawal': return '🏧';
        case 'deposit': return '💰';
        case 'transfer': return '💸';
        default: return '📊';
    }
}

function getMethodIcon($method) {
    switch($method) {
        case 'POS': return '🏪';
        case 'ATM': return '🏧';
        case 'Online': return '🌐';
        case 'IBAN': return '🏦';
        default: return '📱';
    }
}

$data = json_decode(file_get_contents('php://input'), true);

// Debug: logăm ce primește backend-ul
$debug_file = __DIR__ . "/debug.log";
file_put_contents($debug_file, "=== " . date('Y-m-d H:i:s') . " ===\n", FILE_APPEND);
file_put_contents($debug_file, "Raw input: " . file_get_contents('php://input') . "\n", FILE_APPEND);
file_put_contents($debug_file, "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);

if (!$data || !isset($data['client_id'])) {
    echo json_encode(['error' => 'Client ID lipsă', 'received_data' => $data]);
    exit;
}

$client_id = intval($data['client_id']);
$limit = isset($data['limit']) ? intval($data['limit']) : 50;
$offset = isset($data['offset']) ? intval($data['offset']) : 0;

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obține toate tranzacțiile pentru client cu detalii complete
    $stmt = $conn->prepare("
        SELECT 
            t.id,
            t.account_id,
            t.destination_account_id,
            t.amount,
            t.currency,
            t.status,
            t.transaction_type,
            t.method,
            t.category,
            t.description,
            t.balance_after,
            t.created_at,
            -- Informații despre accountul sursă
            CONCAT(c1.first_name, ' ', c1.last_name) as source_client_name,
            a1.currency as source_currency,
            -- Informații despre accountul destinație (dacă există)
            CONCAT(c2.first_name, ' ', c2.last_name) as destination_client_name,
            a2.currency as destination_currency,
            -- Informații despre banca sursă
            b1.name as source_bank_name,
            -- Informații despre banca destinație (dacă există)
            b2.name as destination_bank_name
        FROM transactions t
        -- Join cu accountul sursă
        INNER JOIN accounts a1 ON t.account_id = a1.id
        INNER JOIN clients c1 ON a1.client_id = c1.id
        INNER JOIN banks b1 ON a1.bank_id = b1.id
        -- Join cu accountul destinație (dacă există)
        LEFT JOIN accounts a2 ON t.destination_account_id = a2.id
        LEFT JOIN clients c2 ON a2.client_id = c2.id
        LEFT JOIN banks b2 ON a2.bank_id = b2.id
        WHERE (a1.client_id = ? OR a2.client_id = ?)
        ORDER BY t.created_at DESC
        LIMIT $limit OFFSET $offset
    ");
    
    $stmt->execute([$client_id, $client_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatează datele pentru frontend
    foreach ($transactions as &$transaction) {
        // Formatează data
        $transaction['created_at'] = date('Y-m-d H:i:s', strtotime($transaction['created_at']));
        
        // Formatează suma cu 2 zecimale
        $transaction['amount_formatted'] = number_format($transaction['amount'], 2);
        
        // Formatează balance-ul după tranzacție
        if ($transaction['balance_after'] !== null) {
            $transaction['balance_after_formatted'] = number_format($transaction['balance_after'], 2);
        }
        
        // Adaugă iconițe pentru tipul de tranzacție
        $transaction['type_icon'] = getTypeIcon($transaction['transaction_type']);
        
        // Adaugă iconițe pentru metoda de plată
        $transaction['method_icon'] = getMethodIcon($transaction['method']);
        
        // Debug: logăm informațiile pentru debugging
        $debug_file = __DIR__ . "/debug.log";
        file_put_contents($debug_file, "Transaction ID: {$transaction['id']}, account_id: {$transaction['account_id']}, destination_account_id: {$transaction['destination_account_id']}, client_id: $client_id\n", FILE_APPEND);
        
        // Debug: verifică dacă client_id corespunde cu account_id sau destination_account_id
        // Trebuie să verificăm dacă client_id corespunde cu client_id din account-uri, nu cu account_id
        $is_expeditor = false;
        $is_destinatar = false;
        
        // Debug: logăm datele brute
        file_put_contents($debug_file, "Transaction ID {$transaction['id']}: account_id={$transaction['account_id']}, destination_account_id={$transaction['destination_account_id']}, client_id=$client_id\n", FILE_APPEND);
        
        // Verifică dacă ești expeditorul (client_id din account-ul sursă)
        if ($transaction['account_id']) {
            // Obține client_id pentru account-ul sursă
            $stmt_client = $conn->prepare("SELECT client_id FROM accounts WHERE id = ?");
            $stmt_client->execute([$transaction['account_id']]);
            $source_client = $stmt_client->fetch(PDO::FETCH_ASSOC);
            file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Source account query result: " . print_r($source_client, true) . "\n", FILE_APPEND);
            if ($source_client && $source_client['client_id'] == $client_id) {
                $is_expeditor = true;
                file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Client $client_id este expeditorul (account_id: {$transaction['account_id']})\n", FILE_APPEND);
            }
        }
        
        // Verifică dacă ești destinatarul (client_id din account-ul destinație)
        if ($transaction['destination_account_id']) {
            // Obține client_id pentru account-ul destinație
            $stmt_client = $conn->prepare("SELECT client_id FROM accounts WHERE id = ?");
            $stmt_client->execute([$transaction['destination_account_id']]);
            $dest_client = $stmt_client->fetch(PDO::FETCH_ASSOC);
            file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Destination account query result: " . print_r($dest_client, true) . "\n", FILE_APPEND);
            if ($dest_client && $dest_client['client_id'] == $client_id) {
                $is_destinatar = true;
                file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Client $client_id este destinatarul (destination_account_id: {$transaction['destination_account_id']})\n", FILE_APPEND);
            }
        }
        
        file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Is expeditor: " . ($is_expeditor ? 'YES' : 'NO') . ", Is destinatar: " . ($is_destinatar ? 'YES' : 'NO') . "\n", FILE_APPEND);
        
        // Determină dacă tranzacția este de primire sau trimitere
        if ($is_expeditor && !$is_destinatar) {
            // Ești doar expeditorul - trimiti bani
            $transaction['transaction_direction'] = 'outgoing';
            $transaction['other_party'] = $transaction['destination_client_name'] ?? 'Client necunoscut';
            file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Direction: OUTGOING (trimiti bani)\n", FILE_APPEND);
        } elseif ($is_destinatar && !$is_expeditor) {
            // Ești doar destinatarul - primești bani
            $transaction['transaction_direction'] = 'incoming';
            $transaction['other_party'] = $transaction['source_client_name'] ?? 'Client necunoscut';
            file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Direction: INCOMING (primești bani)\n", FILE_APPEND);
        } elseif ($is_expeditor && $is_destinatar) {
            // Ești atât expeditor, cât și destinatar (transfer intern)
            $transaction['transaction_direction'] = 'internal';
            $transaction['other_party'] = 'Transfer intern';
            file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Direction: INTERNAL (transfer intern)\n", FILE_APPEND);
        } else {
            // Nu ești nici expeditor, nici destinatar
            $transaction['transaction_direction'] = 'unknown';
            $transaction['other_party'] = 'Client necunoscut';
            file_put_contents($debug_file, "Transaction ID {$transaction['id']}: Direction: UNKNOWN (nu ești implicat)\n", FILE_APPEND);
        }
        
        // Debug: logăm direcția finală
        file_put_contents($debug_file, "Transaction ID {$transaction['id']}: FINAL DIRECTION = {$transaction['transaction_direction']}\n", FILE_APPEND);
        
        // Formatează statusul pentru afișare
        if ($transaction['status'] === 'completed' || $transaction['status'] === 'accepted') {
            $transaction['status_display'] = 'Aceptat';
        } elseif ($transaction['status'] === 'pending') {
            $transaction['status_display'] = 'În așteptare';
        } elseif ($transaction['status'] === 'rejected') {
            $transaction['status_display'] = 'Respins';
        } elseif ($transaction['status'] === 'returned') {
            $transaction['status_display'] = 'Returnat';
        } elseif ($transaction['status'] === 'cancelled') {
            $transaction['status_display'] = 'Anulat';
        } else {
            $transaction['status_display'] = $transaction['status'];
        }
    }
    
    // Obține numărul total de tranzacții pentru paginare
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total
        FROM transactions t
        INNER JOIN accounts a1 ON t.account_id = a1.id
        LEFT JOIN accounts a2 ON t.destination_account_id = a2.id
        WHERE (a1.client_id = ? OR a2.client_id = ?)
    ");
    $stmt->execute([$client_id, $client_id]);
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'success' => true,
        'transactions' => $transactions,
        'total' => intval($total),
        'limit' => $limit,
        'offset' => $offset,
        'has_more' => ($offset + $limit) < $total
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['error' => 'Eroare de bază de date: ' . $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
