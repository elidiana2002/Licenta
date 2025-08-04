-- Creare baza de date dacă nu există
CREATE DATABASE IF NOT EXISTS banca;
USE banca;

-- Creare tabel users dacă nu există
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'manager') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserare utilizatori de test (doar dacă nu există deja)
INSERT IGNORE INTO users (email, password, role) VALUES
('admin@test.com', 'admin123', 'admin'),
('user@test.com', 'user123', 'user'),
('manager@test.com', 'manager123', 'manager');

-- Adăugare câmp role dacă nu există
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('admin', 'user', 'manager') NOT NULL DEFAULT 'user';

-- Actualizare roluri pentru utilizatorii existenți
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE users SET role = 'user' WHERE email = 'user@test.com';
UPDATE users SET role = 'manager' WHERE email = 'manager@test.com'; 

CREATE TABLE banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
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
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
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
