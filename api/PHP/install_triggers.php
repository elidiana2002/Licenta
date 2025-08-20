<?php
/**
 * Script pentru instalarea trigger-elor în baza de date
 * Rulează acest script o singură dată pentru a configura automatizarea
 */

header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Activează event scheduler-ul MySQL
    $pdo->exec("SET GLOBAL event_scheduler = ON");
    
    // Creează trigger-ul pentru inserare
    $pdo->exec("
        CREATE TRIGGER IF NOT EXISTS before_card_insert 
        BEFORE INSERT ON cards
        FOR EACH ROW
        BEGIN
            IF NEW.expiration_date < CURDATE() THEN
                SET NEW.status = 'expired';
            ELSE
                SET NEW.status = 'active';
            END IF;
        END
    ");
    
    // Creează event-ul pentru actualizarea zilnică
    $pdo->exec("
        CREATE EVENT IF NOT EXISTS update_expired_cards
        ON SCHEDULE EVERY 1 DAY
        STARTS CURRENT_TIMESTAMP
        DO
        BEGIN
            UPDATE cards 
            SET status = 'expired' 
            WHERE expiration_date < CURDATE() 
            AND status = 'active';
        END
    ");
    
    echo json_encode([
        'success' => true,
        'message' => 'Trigger-ele au fost instalate cu succes!',
        'triggers_created' => [
            'before_card_insert - verifică data expirării la inserare',
            'update_expired_cards - actualizează statusul zilnic'
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la instalarea trigger-elor: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
