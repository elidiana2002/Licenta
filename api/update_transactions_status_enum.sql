-- Actualizare enum pentru coloana status din tabelul transactions
-- Adăugăm noile status-uri: accepted, returned, cancelled

USE banca;

-- Metoda 1: ALTER TABLE cu MODIFY COLUMN (recomandată pentru MySQL 8.0+)
ALTER TABLE transactions 
MODIFY COLUMN status ENUM('pending', 'rejected', 'accepted', 'returned', 'cancelled') DEFAULT 'pending';

-- Metoda 2: Dacă metoda 1 nu funcționează, folosim ADD/DROP COLUMN
-- Pasul 1: Adăugăm o coloană temporară
-- ALTER TABLE transactions ADD COLUMN status_new ENUM('completed', 'pending', 'rejected', 'accepted', 'returned', 'cancelled') DEFAULT 'pending';

-- Pasul 2: Copiem datele existente
-- UPDATE transactions SET status_new = 
--   CASE 
--     WHEN status = 'completed' THEN 'completed'
--     WHEN status = 'pending' THEN 'pending'
--     WHEN status = 'rejected' THEN 'rejected'
--     ELSE 'pending'
--   END;

-- Pasul 3: Ștergem coloana veche și redenumim cea nouă
-- ALTER TABLE transactions DROP COLUMN status;
-- ALTER TABLE transactions CHANGE status_new status ENUM('completed', 'pending', 'rejected', 'accepted', 'returned', 'cancelled') DEFAULT 'pending';

-- Verificare
DESCRIBE transactions;
SELECT DISTINCT status FROM transactions;
