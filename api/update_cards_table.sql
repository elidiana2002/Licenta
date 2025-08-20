-- Script de actualizare pentru tabela cards
-- Adaugă coloanele lipsă: bank_id, iban, currency

USE banca;

-- Verifică dacă coloana bank_id există, dacă nu, o adaugă
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS bank_id INT AFTER card_type;

-- Verifică dacă coloana iban există, dacă nu, o adaugă  
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS iban VARCHAR(34) AFTER bank_id;

-- Verifică dacă coloana currency există, dacă nu, o adaugă
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS currency ENUM('RON', 'EUR', 'USD') DEFAULT 'RON' AFTER iban;

-- Adaugă foreign key constraint pentru bank_id
ALTER TABLE cards 
ADD CONSTRAINT fk_cards_bank 
FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL;

-- Actualizează datele existente (dacă există)
-- Setează bank_id = 1 (Banca Transilvania) pentru cardurile existente
UPDATE cards SET bank_id = 1 WHERE bank_id IS NULL;

-- Setează currency = 'RON' pentru cardurile existente
UPDATE cards SET currency = 'RON' WHERE currency IS NULL;

-- Elimină coloana bank_name dacă există
ALTER TABLE cards DROP COLUMN IF EXISTS bank_name;

-- Afișează structura actualizată
DESCRIBE cards;

-- Afișează datele actualizate
SELECT * FROM cards;
