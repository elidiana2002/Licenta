<?php
header('Content-Type: text/html; charset=utf-8');

echo "<h1>Test URL-uri API</h1>";

echo "<h2>Informații Server:</h2>";
echo "<p><strong>Document Root:</strong> " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</p>";
echo "<p><strong>Script Name:</strong> " . ($_SERVER['SCRIPT_NAME'] ?? 'Unknown') . "</p>";
echo "<p><strong>Request URI:</strong> " . ($_SERVER['REQUEST_URI'] ?? 'Unknown') . "</p>";
echo "<p><strong>HTTP Host:</strong> " . ($_SERVER['HTTP_HOST'] ?? 'Unknown') . "</p>";

echo "<h2>Teste URL-uri:</h2>";

$urls_to_test = [
    'http://localhost/api/PHP/loginUser.php',
    'http://localhost/licenta/api/PHP/loginUser.php',
    'http://localhost/api/PHP/getTransactions.php',
    'http://localhost/licenta/api/PHP/getTransactions.php'
];

foreach ($urls_to_test as $url) {
    echo "<h3>Test: $url</h3>";
    
    // Testează dacă fișierul există local
    $local_path = str_replace('http://localhost', $_SERVER['DOCUMENT_ROOT'], $url);
    $local_path = str_replace('http://localhost/licenta', $_SERVER['DOCUMENT_ROOT'] . '/licenta', $local_path);
    
    if (file_exists($local_path)) {
        echo "<p style='color: green;'>✅ Fișierul există local: $local_path</p>";
    } else {
        echo "<p style='color: red;'>❌ Fișierul NU există local: $local_path</p>";
    }
    
    // Testează dacă poți accesa URL-ul
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 5
        ]
    ]);
    
    $result = @file_get_contents($url, false, $context);
    if ($result !== false) {
        echo "<p style='color: green;'>✅ URL-ul este accesibil</p>";
        echo "<p><strong>Primii 100 de caractere:</strong> " . substr($result, 0, 100) . "...</p>";
    } else {
        echo "<p style='color: red;'>❌ URL-ul NU este accesibil</p>";
        $error = error_get_last();
        if ($error) {
            echo "<p><strong>Eroare:</strong> " . $error['message'] . "</p>";
        }
    }
    
    echo "<hr>";
}

echo "<h2>Test direct PHP:</h2>";
echo "<p>Dacă vezi această pagină, PHP funcționează!</p>";

echo "<h2>Test MySQL:</h2>";
try {
    $host = 'localhost';
    $dbname = 'banca';
    $username = 'root';
    $password = '';
    
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ Conexiune MySQL reușită!</p>";
    
    // Verifică dacă există utilizatori
    $stmt = $conn->query("SELECT COUNT(*) as total FROM clients");
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "<p>Total utilizatori: <strong>$total</strong></p>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Eroare MySQL: " . $e->getMessage() . "</p>";
}
?>
