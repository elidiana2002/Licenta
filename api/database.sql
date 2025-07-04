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