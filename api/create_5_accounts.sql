-- Script pentru crearea a 5 accounturi noi
-- Toate accounturile au balance 20 RON, bank_id 1, client_id 1
-- Cardurile asociate: 4, 14, 15, 16, 17

INSERT INTO accounts (iban, balance, currency, bank_id, client_id, card_id, created_at) VALUES
('RO49AAAA1B31007593840000', 20.00, 'RON', 1, 1, 4, NOW()),
('RO49AAAA1B31007593840001', 20.00, 'RON', 1, 1, 14, NOW()),
('RO49AAAA1B31007593840002', 20.00, 'RON', 1, 1, 15, NOW()),
('RO49AAAA1B31007593840003', 20.00, 'RON', 1, 1, 16, NOW()),
('RO49AAAA1B31007593840004', 20.00, 'RON', 1, 1, 17, NOW());

-- Verificare că accounturile au fost create
SELECT 
    a.id,
    a.iban,
    a.balance,
    a.currency,
    a.bank_id,
    a.client_id,
    a.card_id,
    c.card_number
FROM accounts a
LEFT JOIN cards c ON a.card_id = c.id
WHERE a.iban IN (
    'RO49AAAA1B31007593840000',
    'RO49AAAA1B31007593840001',
    'RO49AAAA1B31007593840002',
    'RO49AAAA1B31007593840003',
    'RO49AAAA1B31007593840004'
)
ORDER BY a.card_id;
