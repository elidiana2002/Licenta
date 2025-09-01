<?php

header('Content-Type: application/json');

// Previne cache-ul browser-ului
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Debug: să vedem dacă scriptul rulează
error_log('=== getCardsByClient.php START ===');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

$data = json_decode(file_get_contents('php://input'), true);

// Debug: să vedem exact ce primește
error_log('Received data: ' . print_r($data, true));

if (!$data || !isset($data['client_id'])) {
    error_log('Missing client_id in request');
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Debug: să vedem ce client_id primim
    error_log('getCardsByClient.php - client_id: ' . $data['client_id']);

    // Obține toate cardurile pentru client cu informațiile din accounts și banks
    $stmt = $conn->prepare("
        SELECT 
            c.id, 
            c.account_id, 
            c.card_number, 
            c.expiration_date, 
            c.cvv, 
            c.status, 
            c.card_type, 
            c.issued_at,
            a.bank_id,
            a.iban,
            a.currency,
            a.balance,
            b.name as bank_name
        FROM cards c
        INNER JOIN accounts a ON c.account_id = a.id
        INNER JOIN banks b ON a.bank_id = b.id
        WHERE a.client_id = ?
    ");
    $stmt->execute([$data['client_id']]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug: să vedem câte carduri am găsit
    error_log('Found ' . count($cards) . ' cards for client_id: ' . $data['client_id']);

    // Pentru fiecare card, găsește toate accounturile asociate
    foreach ($cards as &$card) {
        // Debug: să vedem ce card procesăm
        error_log('Processing card ID: ' . $card['id'] . ' with account_id: ' . $card['account_id']);
        
        // Găsește accounturile care au acest card_id
        $stmt = $conn->prepare("
            SELECT 
                a.id,
                a.iban,
                a.balance,
                a.currency,
                b.name as bank_name,
                a.created_at
            FROM accounts a
            INNER JOIN banks b ON a.bank_id = b.id
            WHERE a.card_id = ?
        ");
        $stmt->execute([$card['id']]);
        $card['accounts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug: să vedem câte accounturi am găsit pentru acest card
        error_log("Card {$card['id']} - found " . count($card['accounts']) . " accounts");
        
        // Debug: să vedem exact ce date avem pentru fiecare account
        foreach ($card['accounts'] as $account) {
            error_log("Account {$account['id']} - balance: '{$account['balance']}' (type: " . gettype($account['balance']) . ")");
        }
        
        // Dacă nu s-au găsit accounturi, creează unul default cu datele din card
        if (empty($card['accounts'])) {
            error_log("Card {$card['id']} - no accounts found, creating default");
            $card['accounts'] = [[
                'id' => $card['account_id'],
                'iban' => $card['iban'],
                'balance' => $card['balance'] ?? 0.00,
                'currency' => $card['currency'],
                'bank_name' => $card['bank_name'],
                'created_at' => $card['issued_at']
            ]];
        }
        
        // Debug: să vedem ce balance-uri avem
        error_log("Card {$card['id']} - accounts: " . print_r($card['accounts'], true));
    }
    
    // Găsește toate accounturile pentru client care nu sunt asociate cu carduri
    $stmt = $conn->prepare("
        SELECT 
            a.id,
            a.iban,
            a.balance,
            a.currency,
            b.name as bank_name,
            a.created_at
        FROM accounts a
        INNER JOIN banks b ON a.bank_id = b.id
        WHERE a.client_id = ? AND a.card_id IS NULL
    ");
    $stmt->execute([$data['client_id']]);
    $orphan_accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: să vedem câte accounturi orfane am găsit
    error_log('Found ' . count($orphan_accounts) . ' orphan accounts');
    
    // Adaugă accounturile orfane ca un card virtual
    if (!empty($orphan_accounts)) {
        error_log('Creating virtual card for orphan accounts');
        $virtual_card = [
            'id' => 'virtual_' . time(),
            'account_id' => null,
            'card_number' => 'VIRTUAL_ACCOUNT',
            'expiration_date' => 'N/A',
            'cvv' => 'N/A',
            'status' => 'active',
            'card_type' => 'virtual',
            'issued_at' => date('Y-m-d H:i:s'),
            'bank_id' => $orphan_accounts[0]['bank_id'],
            'iban' => 'N/A',
            'currency' => 'N/A',
            'balance' => null,
            'bank_name' => $orphan_accounts[0]['bank_name'],
            'accounts' => $orphan_accounts
        ];
        $cards[] = $virtual_card;
    }

    // Debug: să vedem rezultatul final
    error_log('Final result - ' . count($cards) . ' cards total');
    error_log('Final cards data: ' . print_r($cards, true));

    echo json_encode(['success' => true, 'cards' => $cards]);
    
    // Debug: să vedem dacă răspunsul a fost trimis
    error_log('Response sent successfully');
    
} catch(PDOException $e) {
    error_log('PDO Exception in getCardsByClient.php: ' . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
} catch(Exception $e) {
    error_log('General Exception in getCardsByClient.php: ' . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

// Debug: să vedem dacă scriptul se termină normal
error_log('=== getCardsByClient.php END ===');
?> 