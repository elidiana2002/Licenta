-- Script de corectare pentru tabela cards (compatibil MySQL)
-- Corectează structura și datele tabelei cards

USE banca;

-- Afișează structura actuală
DESCRIBE cards;

-- 1. Adaugă coloana bank_id (doar dacă nu există)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'cards' 
    AND column_name = 'bank_id' 
    AND table_schema = 'banca'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE cards ADD COLUMN bank_id INT AFTER card_type',
    'SELECT "Coloana bank_id există deja" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Adaugă coloana iban (doar dacă nu există)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'cards' 
    AND column_name = 'iban' 
    AND table_schema = 'banca'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE cards ADD COLUMN iban VARCHAR(34) AFTER bank_id',
    'SELECT "Coloana iban există deja" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Adaugă coloana currency (doar dacă nu există)
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_name = 'cards' 
    AND column_name = 'currency' 
    AND table_schema = 'banca'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE cards ADD COLUMN currency ENUM(\'RON\', \'EUR\', \'USD\') DEFAULT \'RON\' AFTER iban',
    'SELECT "Coloana currency există deja" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Afișează structura după adăugarea coloanelor
DESCRIBE cards;

-- 4. Actualizează datele existente
-- Setează bank_id = 1 (Banca Transilvania) pentru cardurile existente
UPDATE cards SET bank_id = 1 WHERE bank_id IS NULL;

-- Setează currency = 'RON' pentru cardurile existente
UPDATE cards SET currency = 'RON' WHERE currency IS NULL;

-- 5. Elimină coloana bank_name (dacă există)
ALTER TABLE cards DROP COLUMN bank_name;

-- 6. Adaugă foreign key constraint pentru bank_id
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

-- Afișează structura finală
DESCRIBE cards;

-- Afișează datele actualizate
SELECT * FROM cards;
