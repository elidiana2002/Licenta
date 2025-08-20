-- Creare baza de date dacă nu există
CREATE DATABASE IF NOT EXISTS banca;
USE banca;

-- Creare tabel clients (combinat cu users)
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    CNP VARCHAR(13),
    address TEXT,
    phone VARCHAR(20),
    role ENUM('admin', 'user', 'manager') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Inserare banci de test cu UPDATE dacă există
INSERT INTO banks (id, name) VALUES
(1, 'Banca Transilvania'),
(2, 'BCR (Banca Comercială Română)'),
(3, 'BRD – Groupe Société Générale'),
(4, 'CEC Bank'),
(5, 'Raiffeisen Bank'),
(6, 'ING Bank România'),
(7, 'UniCredit Bank'),
(8, 'OTP Bank'),
(9, 'Alpha Bank România'),
(10, 'ProCredit Bank')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name);

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

CREATE TABLE cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  card_number VARCHAR(19) UNIQUE NOT NULL,
  expiration_date DATE NOT NULL,
  cvv VARCHAR(4),
  status ENUM('active', 'blocked', 'expired') DEFAULT 'active',
  card_type ENUM('debit', 'credit', 'virtual') DEFAULT 'debit',
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bank_id INT,
  iban VARCHAR(34),
  currency ENUM('RON', 'EUR', 'USD') DEFAULT 'RON',
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('accepted', 'rejected', 'returned', 'pending') DEFAULT 'pending',
  transaction_type ENUM('payment', 'withdrawal', 'deposit', 'transfer'),
  category ENUM('shopping', 'utilities', 'salary', 'other') DEFAULT 'other',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE TABLE history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  account_id INT,
  field_changed VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR(50),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
