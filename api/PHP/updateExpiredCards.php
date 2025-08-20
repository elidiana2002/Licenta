<?php
/**
 * Script pentru actualizarea automată a statusului cardurilor expirate
 * Poate fi rulat ca cron job zilnic sau la cerere
 */

header('Content-Type: application/json');

// Conectare la baza de date
$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Actualizează statusul cardurilor expirate
    $stmt = $pdo->prepare("
        UPDATE cards 
        SET status = 'expired' 
        WHERE expiration_date < CURDATE() 
        AND status = 'active'
    ");
    
    $stmt->execute();
    $affectedRows = $stmt->rowCount();
    
    // Returnează rezultatul
    echo json_encode([
        'success' => true,
        'message' => "Actualizare completă. $affectedRows carduri au fost marcate ca expirate.",
        'affected_rows' => $affectedRows,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la actualizarea statusului: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
