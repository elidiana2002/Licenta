<?php
// Dezactivează afișarea erorilor pentru a nu strica JSON-ul
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'banca';
$username = 'root';
$password = '';

try {
    // Creează directorul pentru backup-uri dacă nu există
    $backupDir = __DIR__ . '/backups/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }

    // Generează numele fișierului de backup
    $backupFile = 'backup_banca_' . date('Y-m-d_H-i-s') . '.sql';
    $backupPath = $backupDir . $backupFile;

    // Încearcă mai întâi cu mysqldump
    $command = "mysqldump --host={$host} --user={$username} --password={$password} {$dbname} > {$backupPath} 2>&1";
    
    $output = [];
    $returnCode = 0;
    exec($command, $output, $returnCode);

    // Dacă mysqldump nu funcționează, creează backup manual
    if ($returnCode !== 0 || !file_exists($backupPath)) {
        // Creează backup manual prin PHP
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $backupContent = "-- Backup Baza de Date Banca\n";
        $backupContent .= "-- Generat la: " . date('Y-m-d H:i:s') . "\n\n";
        $backupContent .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
        $backupContent .= "START TRANSACTION;\n";
        $backupContent .= "SET time_zone = \"+00:00\";\n\n";
        
        // Obține toate tabelele
        $tables = ['clients', 'banks', 'accounts', 'cards', 'transactions', 'history'];
        
        foreach ($tables as $table) {
            try {
                // Obține structura tabelului
                $stmt = $conn->query("SHOW CREATE TABLE `{$table}`");
                $createTable = $stmt->fetch(PDO::FETCH_ASSOC);
                $backupContent .= "DROP TABLE IF EXISTS `{$table}`;\n";
                $backupContent .= $createTable['Create Table'] . ";\n\n";
                
                // Obține datele
                $stmt = $conn->query("SELECT * FROM `{$table}`");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (!empty($rows)) {
                    $columns = array_keys($rows[0]);
                    $backupContent .= "INSERT INTO `{$table}` (`" . implode('`, `', $columns) . "`) VALUES\n";
                    
                    $values = [];
                    foreach ($rows as $row) {
                        $rowValues = [];
                        foreach ($row as $value) {
                            if ($value === null) {
                                $rowValues[] = 'NULL';
                            } else {
                                $rowValues[] = "'" . addslashes($value) . "'";
                            }
                        }
                        $values[] = "(" . implode(', ', $rowValues) . ")";
                    }
                    
                    $backupContent .= implode(",\n", $values) . ";\n\n";
                }
            } catch (Exception $e) {
                // Ignoră tabelele care nu există
                continue;
            }
        }
        
        $backupContent .= "COMMIT;\n";
        
        // Scrie fișierul
        file_put_contents($backupPath, $backupContent);
    }

    if (file_exists($backupPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'Backup creat cu succes',
            'backupFile' => $backupFile,
            'backupPath' => $backupPath,
            'fileSize' => filesize($backupPath)
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Eroare la crearea backup-ului: Nu s-a putut crea fișierul'
        ]);
    }

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Eroare la crearea backup-ului: ' . $e->getMessage()
    ]);
}
?>
