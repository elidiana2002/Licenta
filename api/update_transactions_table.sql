-- Script pentru actualizarea tabelei transactions
-- Adaugă câmpul pentru balance-ul contului destinație

USE banca;

-- Adaugă câmpul destination_balance_after pentru a stoca balance-ul contului destinație
ALTER TABLE transactions 
ADD COLUMN destination_balance_after DECIMAL(15,2) NULL 
COMMENT 'Balance-ul contului destinație după tranzacție';

-- Adaugă câmpul source_balance_after pentru a stoca balance-ul contului sursă (opțional, pentru claritate)
ALTER TABLE transactions 
ADD COLUMN source_balance_after DECIMAL(15,2) NULL 
COMMENT 'Balance-ul contului sursă după tranzacție';

-- Actualizează câmpul existent balance_after să fie source_balance_after
UPDATE transactions 
SET source_balance_after = balance_after 
WHERE balance_after IS NOT NULL;

-- Șterge câmpul vechi balance_after după migrarea datelor
ALTER TABLE transactions 
DROP COLUMN balance_after;

-- Verifică structura tabelei actualizate
DESCRIBE transactions;
