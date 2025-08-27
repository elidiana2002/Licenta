-- Script pentru adăugarea constrângerii UNIQUE la coloana phone
USE banca;

-- Adaugă constrângerea UNIQUE pentru coloana phone
ALTER TABLE clients ADD UNIQUE KEY unique_phone (phone);

-- Verifică că constrângerea a fost adăugată
SHOW INDEX FROM clients WHERE Key_name = 'unique_phone';
