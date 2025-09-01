<?php
// Dezactivează afișarea erorilor în output
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Previne cache-ul browser-ului
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

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
    echo json_encode(['success' => false, 'error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obține toate cardurile pentru client
    $stmt = $conn->prepare("
        SELECT 
            c.id, 
            c.account_id, 
            c.card_number, 
            c.expiration_date, 
            c.cvv, 
            c.status, 
            c.card_type, 
            c.issued_at
        FROM cards c
        INNER JOIN accounts a ON c.account_id = a.id
        WHERE a.client_id = ?
        ORDER BY c.id
    ");
    $stmt->execute([$data['client_id']]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Pentru fiecare card, găsește toate accounturile asociate
    foreach ($cards as &$card) {
        // Adaugă proprietățile așteptate de ClientHistoryPage.tsx
        $card['card_id'] = $card['id'];
        
        // Găsește TOATE accounturile care au acest card_id (relație prin card_id)
        $stmt = $conn->prepare("
            SELECT 
                a.id,
                a.iban,
                a.balance,
                a.currency,
                a.bank_id,
                b.name as bank_name,
                a.created_at
            FROM accounts a
            INNER JOIN banks b ON a.bank_id = b.id
            WHERE a.card_id = ?
        ");
        $stmt->execute([$card['id']]);
        $card['accounts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug: afișează ce s-a găsit pentru fiecare card
        error_log("Card ID " . $card['id'] . " - Found " . count($card['accounts']) . " accounts");
        if (!empty($card['accounts'])) {
            error_log("Account IDs: " . implode(', ', array_column($card['accounts'], 'id')));
        }
        
        // Adaugă proprietățile așteptate
        $card['accounts_count'] = count($card['accounts']);
        $card['account_ibans'] = implode(', ', array_column($card['accounts'], 'iban'));
        
        // Dacă nu s-au găsit accounturi prin card_id, încearcă să găsești account-ul principal
        if (empty($card['accounts'])) {
            // Găsește account-ul principal al cardului
            $stmt = $conn->prepare("
                SELECT 
                    a.id,
                    a.iban,
                    a.balance,
                    a.currency,
                    a.bank_id,
                    b.name as bank_name,
                    a.created_at
                FROM accounts a
                INNER JOIN banks b ON a.bank_id = b.id
                WHERE a.id = ?
            ");
            $stmt->execute([$card['account_id']]);
            $main_account = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($main_account) {
                $card['accounts'] = [$main_account];
                $card['accounts_count'] = 1;
                $card['account_ibans'] = $main_account['iban'];
                
                // Adaugă proprietățile din account-ul principal
                $card['bank_id'] = $main_account['bank_id'] ?? null;
                $card['iban'] = $main_account['iban'];
                $card['currency'] = $main_account['currency'];
                $card['balance'] = $main_account['balance'];
                $card['bank_name'] = $main_account['bank_name'];
            }
        } else {
            // Dacă s-au găsit accounturi, folosește primul pentru proprietățile cardului
            $first_account = $card['accounts'][0];
            $card['bank_id'] = $first_account['bank_id'] ?? null;
            $card['iban'] = $first_account['iban'];
            $card['currency'] = $first_account['currency'];
            $card['balance'] = $first_account['balance'];
            $card['bank_name'] = $first_account['bank_name'];
        }
    }
    
    // Găsește toate accounturile pentru client care nu sunt asociate cu carduri
    // (doar dacă există accounturi orfane - ceea ce nu ar trebui să se întâmple în cazul normal)
    $stmt = $conn->prepare("
        SELECT 
            a.id,
            a.iban,
            a.balance,
            a.currency,
            a.bank_id,
            b.name as bank_name,
            a.created_at
        FROM accounts a
        INNER JOIN banks b ON a.bank_id = b.id
        WHERE a.client_id = ? AND a.card_id IS NULL
    ");
    $stmt->execute([$data['client_id']]);
    $orphan_accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Adaugă accounturile orfane ca un card virtual DOAR dacă există
    // În cazul normal, toate accounturile ar trebui să aibă carduri asociate
    if (!empty($orphan_accounts)) {
        error_log("WARNING: Found orphan accounts for client " . $data['client_id'] . ": " . print_r($orphan_accounts, true));
        
        // Găsește banca principală din accounturile orfane
        $main_bank_id = null;
        $main_bank_name = 'Unknown Bank';
        
        if (!empty($orphan_accounts)) {
            // Grupează accounturile pe bancă și găsește banca cu cele mai multe accounturi
            $bank_counts = [];
            foreach ($orphan_accounts as $account) {
                $bank_id = $account['bank_id'];
                if (!isset($bank_counts[$bank_id])) {
                    $bank_counts[$bank_id] = [
                        'count' => 0,
                        'name' => $account['bank_name']
                    ];
                }
                $bank_counts[$bank_id]['count']++;
            }
            
            // Găsește banca cu cele mai multe accounturi
            $max_count = 0;
            foreach ($bank_counts as $bank_id => $bank_info) {
                if ($bank_info['count'] > $max_count) {
                    $max_count = $bank_info['count'];
                    $main_bank_id = $bank_id;
                    $main_bank_name = $bank_info['name'];
                }
            }
        }
        
        $virtual_card = [
            'id' => 'virtual_' . time(),
            'card_id' => 'virtual_' . time(),
            'account_id' => null,
            'card_number' => 'VIRTUAL_ACCOUNT',
            'expiration_date' => 'N/A',
            'cvv' => 'N/A',
            'status' => 'active',
            'card_type' => 'virtual',
            'issued_at' => date('Y-m-d H:i:s'),
            'bank_id' => $main_bank_id,
            'iban' => 'N/A',
            'currency' => 'N/A',
            'balance' => null,
            'bank_name' => $main_bank_name,
            'accounts' => $orphan_accounts,
            'accounts_count' => count($orphan_accounts),
            'account_ibans' => implode(', ', array_column($orphan_accounts, 'iban'))
        ];
        $cards[] = $virtual_card;
    }

    echo json_encode(['success' => true, 'cards' => $cards]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?> 