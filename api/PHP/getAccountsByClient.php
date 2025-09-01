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

// Acceptă doar POST (OPTIONS e deja tratat)
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
    // Găsește cardurile clientului cu toate accounturile asociate (fără balance pentru securitate)
    $stmt = $pdo->prepare("SELECT 
            c.id as card_id,
            c.card_number,
            c.card_type,
            c.expiration_date,
            c.status,
            GROUP_CONCAT(a.iban ORDER BY a.iban SEPARATOR ', ') as account_ibans,
            COUNT(a.id) as accounts_count
        FROM cards c
        INNER JOIN accounts a ON c.account_id = a.id
        WHERE a.client_id = ?
        GROUP BY c.id, c.card_number, c.card_type, c.expiration_date, c.status
        ORDER BY c.id ASC");
    
    $stmt->execute([$client_id]);
    $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($cards) === 0) {
        // Verifică dacă clientul are accounturi
        $stmt2 = $pdo->prepare("SELECT COUNT(*) as account_count FROM accounts WHERE client_id = ?");
        $stmt2->execute([$client_id]);
        $accountCount = $stmt2->fetch(PDO::FETCH_ASSOC)['account_count'];
        
        if ($accountCount === 0) {
            echo json_encode([
                'success' => false, 
                'error' => 'Clientul nu are accounturi bancare',
                'cards' => [],
                'count' => 0
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'error' => 'Clientul are accounturi dar nu sunt asociate cu carduri',
                'cards' => [],
                'count' => 0
            ]);
        }
    } else {
        echo json_encode([
            'success' => true,
            'cards' => $cards,
            'count' => count($cards)
        ]);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Eroare la interogarea bazei de date: ' . $e->getMessage()]);
}
?>
