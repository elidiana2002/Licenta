-- Script pentru popularea tabelelor cu date de test
-- Rulează acest script după ce ai rulat database.sql pentru structură

USE banca;

-- 1. Populează tabelul clients
INSERT INTO clients (first_name, last_name, email, password_hash, CNP, address, phone, role) VALUES
('SEFU', 'MARE', 'admin@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890120', '1', '0770440009', 'admin'),
('Ion', 'Popescu', 'user@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890123', 'Strada Exemplu, Nr. 123, București', '0722123456', 'user'),
('Maria', 'Ionescu', 'manager@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890124', 'Strada Test, Nr. 456, Cluj', '0733123456', 'manager'),
('Alexandru', 'Vasilescu', 'alex@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890125', 'Strada Nouă, Nr. 789, Timișoara', '0744123456', 'user'),
('Elena', 'Dumitrescu', 'elena@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890126', 'Strada Veche, Nr. 321, Iași', '0755123456', 'user');

-- 2. Populează tabelul banks (dacă nu există deja)
INSERT IGNORE INTO banks (id, name) VALUES
(1, 'Banca Transilvania'),
(2, 'BCR (Banca Comercială Română)'),
(3, 'BRD – Groupe Société Générale'),
(4, 'CEC Bank'),
(5, 'Raiffeisen Bank'),
(6, 'ING Bank România'),
(7, 'UniCredit Bank'),
(8, 'OTP Bank'),
(9, 'Alpha Bank România'),
(10, 'ProCredit Bank');

-- 3. Populează tabelul accounts
INSERT INTO accounts (client_id, bank_id, iban, currency, balance, account_type) VALUES
(1, 1, 'RO49AAAA1B31007593840000', 'RON', 10000.00, 'current'),
(2, 2, 'RO49AAAA1B31007593840001', 'RON', 2500.00, 'current'),
(2, 1, 'RO49AAAA1B31007593840002', 'EUR', 1500.00, 'savings'),
(3, 3, 'RO49AAAA1B31007593840003', 'RON', 5000.00, 'business'),
(4, 1, 'RO49AAAA1B31007593840004', 'RON', 800.00, 'current'),
(5, 4, 'RO49AAAA1B31007593840005', 'USD', 2000.00, 'savings');

-- 4. Populează tabelul cards
INSERT INTO cards (account_id, card_number, expiration_date, cvv, card_type, iban, currency) VALUES
(1, '1234567890123456', '2026-12-01', '123', 'debit', 'RO49AAAA1B31007593840000', 'RON'),
(2, '2345678901234567', '2027-06-01', '456', 'credit', 'RO49AAAA1B31007593840001', 'RON'),
(3, '3456789012345678', '2026-09-01', '789', 'debit', 'RO49AAAA1B31007593840002', 'EUR'),
(4, '4567890123456789', '2027-03-01', '012', 'virtual', 'RO49AAAA1B31007593840003', 'RON'),
(5, '5678901234567890', '2026-11-01', '345', 'debit', 'RO49AAAA1B31007593840004', 'RON');

-- 5. Populează tabelul transactions (corectat să folosească account_id și să aibă transaction_direction)
INSERT INTO transactions (account_id, amount, status, transaction_type, category, description, method) VALUES
(1, 150.50, 'completed', 'payment', 'shopping', 'Plata la supermarket', 'POS'),
(1, 75.25, 'completed', 'payment', 'utilities', 'Factură energie electrică', 'Online'),
(2, 200.00, 'completed', 'withdrawal', 'other', 'Retragere numerar ATM', 'ATM'),
(3, 45.80, 'completed', 'payment', 'shopping', 'Plata la farmacie', 'POS'),
(4, 1200.00, 'completed', 'transfer', 'salary', 'Transfer salariu', 'IBAN'),
(5, 89.99, 'pending', 'payment', 'shopping', 'Plata online', 'Online'),
(2, 300.00, 'completed', 'deposit', 'other', 'Depunere numerar', 'ATM'),
(3, 25.50, 'rejected', 'payment', 'shopping', 'Plata respinsă - fonduri insuficiente', 'POS');

-- 6. Populează tabelul history
INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_by) VALUES
(1, 1, 'balance', '5000.00', '10000.00', 'system'),
(2, 2, 'phone', '0722123456', '0722123457', 'admin'),
(3, 3, 'account_type', 'current', 'business', 'manager'),
(4, 4, 'address', 'Strada Nouă, Nr. 789, Timișoara', 'Strada Nouă, Nr. 790, Timișoara', 'user'),
(5, 5, 'currency', 'RON', 'USD', 'system');

-- 7. Verificare finală - afișează numărul de înregistrări din fiecare tabel
SELECT 'clients' as tabel, COUNT(*) as numar_inregistrari FROM clients
UNION ALL
SELECT 'banks' as tabel, COUNT(*) as numar_inregistrari FROM banks
UNION ALL
SELECT 'accounts' as tabel, COUNT(*) as numar_inregistrari FROM accounts
UNION ALL
SELECT 'cards' as tabel, COUNT(*) as numar_inregistrari FROM cards
UNION ALL
SELECT 'transactions' as tabel, COUNT(*) as numar_inregistrari FROM transactions
UNION ALL
SELECT 'history' as tabel, COUNT(*) as numar_inregistrari FROM history;

-- Afișează utilizatorii creați pentru testare
SELECT 
    CONCAT(first_name, ' ', last_name) as nume_complet,
    email,
    role,
    'admin123' as parola
FROM clients 
WHERE role = 'admin'
UNION ALL
SELECT 
    CONCAT(first_name, ' ', last_name) as nume_complet,
    email,
    role,
    'user123' as parola
FROM clients 
WHERE role IN ('user', 'manager');
