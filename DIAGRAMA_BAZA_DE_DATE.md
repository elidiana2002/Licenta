# DIAGRAMA BAZEI DE DATE - APLICAȚIA DE ANALIZĂ A CLIENȚILOR BANCARI

## 1. DIAGRAMA ENTITATE-RELATIE (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BANCA DATABASE                                    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    1:N    ┌─────────────────┐    1:N    ┌─────────────────┐
│    CLIENTS      │──────────►│    ACCOUNTS     │──────────►│     CARDS       │
│                 │           │                 │           │                 │
│ • id (PK)       │           │ • id (PK)       │           │ • id (PK)       │
│ • first_name    │           │ • client_id (FK)│           │ • account_id (FK)│
│ • last_name     │           │ • bank_id (FK)  │           │ • card_number   │
│ • email (UNIQUE)│           │ • iban (UNIQUE) │           │ • expiration_date│
│ • password_hash │           │ • currency      │           │ • cvv           │
│ • CNP           │           │ • balance       │           │ • status        │
│ • address       │           │ • account_type  │           │ • card_type     │
│ • phone         │           │ • created_at    │           │ • issued_at     │
│ • role          │           └─────────────────┘           └─────────────────┘
│ • created_at    │                    │
└─────────────────┘                    │
         │                             │
         │ 1:N                         │ 1:N
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│SAVED_RECIPIENTS │           │  TRANSACTIONS   │
│                 │           │                 │
│ • id (PK)       │           │ • id (PK)       │
│ • client_id (FK)│           │ • account_id (FK)│
│ • recipient_phone│          │ • dest_account_id│
│ • recipient_name│           │ • amount        │
│ • recipient_bank│           │ • currency      │
│ • created_at    │           │ • status        │
└─────────────────┘           │ • transaction_type│
                              │ • method        │
                              │ • category      │
                              │ • description   │
                              │ • created_at    │
                              │ • source_balance_after│
                              │ • dest_balance_after│
                              └─────────────────┘
                                       │
                                       │ 1:N
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    HISTORY      │
                              │                 │
                              │ • id (PK)       │
                              │ • client_id (FK)│
                              │ • account_id (FK)│
                              │ • field_changed │
                              │ • old_value     │
                              │ • new_value     │
                              │ • changed_at    │
                              │ • changed_by    │
                              └─────────────────┘

┌─────────────────┐    1:N
│     BANKS       │──────────┐
│                 │          │
│ • id (PK)       │          │
│ • name          │          │
└─────────────────┘          │
                             │
                             ▼
                    ┌─────────────────┐
                    │    ACCOUNTS     │
                    │ (bank_id FK)    │
                    └─────────────────┘
```

## 2. RELAȚIILE DINTRE ENTITĂȚI

### 2.1 Relații principale
- **CLIENTS → ACCOUNTS**: Un client poate avea mai multe conturi (1:N)
- **ACCOUNTS → CARDS**: Un cont poate avea mai multe carduri (1:N)
- **ACCOUNTS → TRANSACTIONS**: Un cont poate avea mai multe tranzacții (1:N)
- **CLIENTS → SAVED_RECIPIENTS**: Un client poate avea mai mulți destinatari salvați (1:N)
- **CLIENTS → HISTORY**: Un client poate avea mai multe înregistrări în istoric (1:N)
- **BANKS → ACCOUNTS**: O bancă poate avea mai multe conturi (1:N)

### 2.2 Relații secundare
- **TRANSACTIONS → ACCOUNTS**: O tranzacție poate avea un cont destinație (N:1)
- **HISTORY → ACCOUNTS**: Istoricul poate fi asociat cu un cont specific (N:1)

## 3. CHEILE ȘI CONSTRÂNGERILE

### 3.1 Chei primare (Primary Keys)
- `clients.id`
- `accounts.id`
- `cards.id`
- `transactions.id`
- `history.id`
- `saved_recipients.id`
- `banks.id`

### 3.2 Chei străine (Foreign Keys)
- `accounts.client_id` → `clients.id`
- `accounts.bank_id` → `banks.id`
- `cards.account_id` → `accounts.id`
- `transactions.account_id` → `accounts.id`
- `transactions.destination_account_id` → `accounts.id`
- `history.client_id` → `clients.id`
- `history.account_id` → `accounts.id`
- `saved_recipients.client_id` → `clients.id`

### 3.3 Constrângeri unice (Unique Constraints)
- `clients.email` - Email-ul trebuie să fie unic
- `accounts.iban` - IBAN-ul trebuie să fie unic
- `cards.card_number` - Numărul de card trebuie să fie unic

## 4. TIPURILE DE DATE ȘI CONSTRÂNGERILE

### 4.1 Tabelul CLIENTS
```sql
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    CNP VARCHAR(20),
    address VARCHAR(255),
    phone VARCHAR(20),
    role ENUM('admin', 'user', 'manager') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constrângeri**:
- `first_name`, `last_name`, `email`, `password_hash` sunt NOT NULL
- `email` este UNIQUE
- `role` poate fi doar 'admin', 'user' sau 'manager'
- `CNP` poate fi NULL (opțional)

### 4.2 Tabelul ACCOUNTS
```sql
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    bank_id INT NOT NULL,
    iban VARCHAR(34) UNIQUE NOT NULL,
    currency ENUM('RON', 'EUR', 'USD') DEFAULT 'RON',
    balance DECIMAL(15,2) DEFAULT 0.00,
    account_type ENUM('current', 'savings', 'business') DEFAULT 'current',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
);
```

**Constrângeri**:
- `client_id`, `bank_id`, `iban` sunt NOT NULL
- `iban` este UNIQUE
- `currency` poate fi doar 'RON', 'EUR' sau 'USD'
- `account_type` poate fi doar 'current', 'savings' sau 'business'
- `balance` este DECIMAL(15,2) cu valoarea implicită 0.00
- CASCADE DELETE pentru `client_id` și `bank_id`

### 4.3 Tabelul TRANSACTIONS
```sql
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    destination_account_id INT,
    amount DECIMAL(15,2) NOT NULL,
    currency ENUM('RON', 'EUR', 'USD') DEFAULT 'RON',
    status ENUM('pending', 'rejected', 'accepted', 'returned', 'cancelled') DEFAULT 'pending',
    transaction_type ENUM('payment', 'withdrawal', 'deposit', 'transfer') DEFAULT 'transfer',
    method ENUM('POS', 'ATM', 'Online', 'IBAN') DEFAULT 'Online',
    category ENUM('shopping', 'utilities', 'salary', 'other') DEFAULT 'other',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_balance_after DECIMAL(15,2),
    destination_balance_after DECIMAL(15,2),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_account_id) REFERENCES accounts(id) ON DELETE SET NULL
);
```

**Constrângeri**:
- `account_id` și `amount` sunt NOT NULL
- `destination_account_id` poate fi NULL (pentru tranzacții fără destinație)
- `status` poate fi doar valorile din ENUM
- `transaction_type` poate fi doar valorile din ENUM
- `method` poate fi doar valorile din ENUM
- `category` poate fi doar valorile din ENUM
- CASCADE DELETE pentru `account_id`
- SET NULL pentru `destination_account_id`

## 5. INDEXURILE PENTRU PERFORMANȚĂ

### 5.1 Indexuri primare
- Toate cheile primare sunt indexate automat

### 5.2 Indexuri secundare recomandate
```sql
-- Pentru căutări rapide după email
CREATE INDEX idx_clients_email ON clients(email);

-- Pentru căutări după client
CREATE INDEX idx_accounts_client ON accounts(client_id);

-- Pentru căutări după bancă
CREATE INDEX idx_accounts_bank ON accounts(bank_id);

-- Pentru căutări după cont
CREATE INDEX idx_transactions_account ON transactions(account_id);

-- Pentru căutări după dată
CREATE INDEX idx_transactions_date ON transactions(created_at);

-- Pentru căutări după status
CREATE INDEX idx_transactions_status ON transactions(status);

-- Pentru căutări după client în istoric
CREATE INDEX idx_history_client ON history(client_id);

-- Pentru căutări după cont în istoric
CREATE INDEX idx_history_account ON history(account_id);
```

## 6. TRIGGERE ȘI AUTOMATIZĂRI

### 6.1 Trigger pentru actualizarea automată a soldurilor
```sql
DELIMITER //
CREATE TRIGGER update_balance_after_transaction
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    -- Actualizează soldul contului sursă
    UPDATE accounts 
    SET balance = balance - NEW.amount 
    WHERE id = NEW.account_id;
    
    -- Actualizează soldul contului destinație (dacă există)
    IF NEW.destination_account_id IS NOT NULL THEN
        UPDATE accounts 
        SET balance = balance + NEW.amount 
        WHERE id = NEW.destination_account_id;
    END IF;
END//
DELIMITER ;
```

### 6.2 Trigger pentru înregistrarea în istoric
```sql
DELIMITER //
CREATE TRIGGER log_balance_change
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF OLD.balance != NEW.balance THEN
        INSERT INTO history (client_id, account_id, field_changed, old_value, new_value, changed_at, changed_by)
        VALUES (NEW.client_id, NEW.id, 'balance', OLD.balance, NEW.balance, NOW(), 'system');
    END IF;
END//
DELIMITER ;
```

## 7. EXEMPLE DE QUERY-URI TIPICE

### 7.1 Obținerea tuturor conturilor unui client
```sql
SELECT a.*, b.name as bank_name
FROM accounts a
JOIN banks b ON a.bank_id = b.id
WHERE a.client_id = ?;
```

### 7.2 Calculul soldului total al unui client
```sql
SELECT SUM(balance) as total_balance
FROM accounts
WHERE client_id = ?;
```

### 7.3 Obținerea tranzacțiilor pentru calculul credit score
```sql
SELECT t.*, a.iban as account_iban, da.iban as destination_account_iban
FROM transactions t
JOIN accounts a ON t.account_id = a.id
LEFT JOIN accounts da ON t.destination_account_id = da.id
WHERE a.client_id = ?
ORDER BY t.created_at DESC;
```

### 7.4 Găsirea destinatarului după numărul de telefon
```sql
SELECT a.id, a.iban, c.first_name, c.last_name, b.name as bank_name
FROM accounts a
JOIN clients c ON a.client_id = c.id
JOIN banks b ON a.bank_id = b.id
WHERE c.phone = ? AND a.id != ?;
```

### 7.5 Calculul veniturilor și cheltuielilor pentru credit score
```sql
-- Calculul veniturilor din solduri pozitive
SELECT SUM(balance) as total_income
FROM accounts 
WHERE client_id = ? AND balance > 0;

-- Calculul datoriilor din solduri negative
SELECT SUM(ABS(balance)) as total_debts
FROM accounts 
WHERE client_id = ? AND balance < 0;

-- Calculul cheltuielilor din tranzacții
SELECT SUM(amount) as total_expenses
FROM transactions t
JOIN accounts a ON t.account_id = a.id
WHERE a.client_id = ? 
AND t.transaction_type = 'transfer' 
AND t.amount > 0;
```

### 7.6 Query pentru rapoarte administrative
```sql
-- Statistici generale pentru admin
SELECT 
    (SELECT COUNT(*) FROM clients) as total_users,
    (SELECT COUNT(*) FROM accounts) as total_accounts,
    (SELECT COUNT(*) FROM transactions) as total_transactions,
    (SELECT COUNT(*) FROM cards) as total_cards,
    (SELECT SUM(balance) FROM accounts) as total_balance;

-- Top 10 utilizatori cu cele mai mari solduri
SELECT 
    c.first_name, 
    c.last_name, 
    c.email,
    SUM(a.balance) as total_balance
FROM clients c
JOIN accounts a ON c.id = a.client_id
GROUP BY c.id, c.first_name, c.last_name, c.email
ORDER BY total_balance DESC
LIMIT 10;

-- Tranzacții recente cu detalii complete
SELECT 
    t.id,
    t.amount,
    t.status,
    t.created_at,
    c1.first_name as from_client,
    c2.first_name as to_client,
    b1.name as from_bank,
    b2.name as to_bank
FROM transactions t
JOIN accounts a1 ON t.account_id = a1.id
JOIN accounts a2 ON t.destination_account_id = a2.id
JOIN clients c1 ON a1.client_id = c1.id
JOIN clients c2 ON a2.client_id = c2.id
JOIN banks b1 ON a1.bank_id = b1.id
JOIN banks b2 ON a2.bank_id = b2.id
ORDER BY t.created_at DESC
LIMIT 50;
```

## 8. CONSIDERAȚII DE SECURITATE
```sql
SELECT t.*, a.iban as account_iban, da.iban as destination_account_iban
FROM transactions t
JOIN accounts a ON t.account_id = a.id
LEFT JOIN accounts da ON t.destination_account_id = da.id
WHERE a.client_id = ?
ORDER BY t.created_at DESC;
```

### 7.4 Găsirea destinatarului după numărul de telefon
```sql
SELECT a.id, a.iban, c.first_name, c.last_name, b.name as bank_name
FROM accounts a
JOIN clients c ON a.client_id = c.id
JOIN banks b ON a.bank_id = b.id
WHERE c.phone = ? AND a.id != ?;
```

## 8. CONSIDERAȚII DE SECURITATE

### 8.1 Protecția datelor sensibile
- Parolele sunt hash-uite cu bcrypt
- CNP-ul este opțional și poate fi criptat
- Numerele de card sunt stocate fără criptare (pentru simplitate în prototip)

### 8.2 Constrângeri de integritate
- CASCADE DELETE pentru a menține consistența datelor
- SET NULL pentru referințele opționale
- Constrângeri UNIQUE pentru identificatori unici

### 8.3 Backup și recuperare
- Backup automat al bazei de date
- Export în format JSON pentru portabilitate
- Istoricul modificărilor pentru audit

Această diagramă oferă o imagine completă asupra structurii bazei de date a aplicației de analiză a clienților bancari, incluzând toate entitățile, relațiile, constrângerile și optimizările necesare pentru funcționarea eficientă a sistemului.
