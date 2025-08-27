-- Script pentru crearea tabelei saved_recipients
USE banca;

-- Creează tabela pentru destinatarii salvați
CREATE TABLE IF NOT EXISTS saved_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    recipient_phone VARCHAR(15) NOT NULL,
    recipient_name VARCHAR(100),
    recipient_bank VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_recipient (client_id, recipient_phone)
);

-- Adaugă index pentru căutare rapidă
CREATE INDEX idx_client_phone ON saved_recipients(client_id, recipient_phone);

-- Verifică structura tabelei
DESCRIBE saved_recipients;

-- Afișează toate tabelele din baza de date
SHOW TABLES;

-- Verifică dacă tabela clients are coloana phone_number
DESCRIBE clients;

-- Elimină coloana phone_number dacă există (folosim doar phone)
ALTER TABLE clients DROP COLUMN IF EXISTS phone_number;

-- Verifică structura actualizată
DESCRIBE clients;
