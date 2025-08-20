-- Script de actualizare pentru tabela cards (compatibil MySQL)
-- Adaugă coloanele lipsă: bank_id, iban, currency

USE banca;

-- Afișează structura actuală a tabelei
DESCRIBE cards;

-- Adaugă coloana bank_id (dacă nu există, va da eroare care poate fi ignorată)
ALTER TABLE cards ADD COLUMN bank_id INT AFTER card_type;

-- Adaugă coloana iban (dacă nu există, va da eroare care poate fi ignorată)
ALTER TABLE cards ADD COLUMN iban VARCHAR(34) AFTER bank_id;

-- Adaugă coloana currency (dacă nu există, va da eroare care poate fi ignorată)
ALTER TABLE cards ADD COLUMN currency ENUM('RON', 'EUR', 'USD') DEFAULT 'RON' AFTER iban;

-- Afișează structura după adăugarea coloanelor
DESCRIBE cards;

-- Adaugă foreign key constraint pentru bank_id (dacă nu există)
-- Verifică dacă constraint-ul există deja
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_cards_bank' 
    AND table_name = 'cards' 
    AND table_schema = 'banca'
);

-- Dacă constraint-ul nu există, îl adaugă
SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE cards ADD CONSTRAINT fk_cards_bank FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL',
    'SELECT "Foreign key constraint fk_cards_bank există deja" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizează datele existente (dacă există)
-- Setează bank_id = 1 (Banca Transilvania) pentru cardurile existente
UPDATE cards SET bank_id = 1 WHERE bank_id IS NULL;

-- Setează currency = 'RON' pentru cardurile existente
UPDATE cards SET currency = 'RON' WHERE currency IS NULL;

-- Afișează structura finală
DESCRIBE cards;

-- Afișează datele actualizate
SELECT * FROM cards;
