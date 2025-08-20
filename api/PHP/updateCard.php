<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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

// Validare date necesare
if (!$data || !isset($data['id'])) {
    echo json_encode(['error' => 'Date lipsă']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verifică dacă există cardul
    $stmt = $conn->prepare("SELECT id FROM cards WHERE id = ?");
    $stmt->execute([$data['id']]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Cardul nu există!']);
        exit;
    }

    // Construiește query dinamic doar cu câmpurile permise
    $fields = [];
    $values = [];
    if (isset($data['expiration_date'])) {
        $fields[] = 'expiration_date = ?';
        $values[] = $data['expiration_date'];
    }
    if (isset($data['cvv'])) {
        $fields[] = 'cvv = ?';
        $values[] = $data['cvv'];
    }
    if (isset($data['card_type'])) {
        $fields[] = 'card_type = ?';
        $values[] = $data['card_type'];
    }
    if (isset($data['status'])) {
        $fields[] = 'status = ?';
        $values[] = $data['status'];
    }
    if (empty($fields)) {
        echo json_encode(['error' => 'Nicio modificare specificată!']);
        exit;
    }
    $values[] = $data['id'];
    $sql = 'UPDATE cards SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->execute($values);

    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 