<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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

// Verifică dacă este o cerere POST
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
    // Găsește conturile clientului
    $stmt = $pdo->prepare("SELECT id, iban, currency, balance, account_type FROM accounts WHERE client_id = ?");
    $stmt->execute([$client_id]);
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($accounts) {
        echo json_encode(['success' => true, 'accounts' => $accounts]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Nu s-au găsit conturi pentru acest client']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Eroare la interogarea bazei de date: ' . $e->getMessage()]);
}
?>
