# SPECIFICAȚII TEHNICE - APLICAȚIA DE ANALIZĂ A CLIENȚILOR BANCARI

## 1. ARHITECTURA SISTEMULUI

### 1.1 Arhitectura generală
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
│   TypeScript    │    │   Express       │    │   phpMyAdmin    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   API PHP       │    │   File System   │
│   (Operațiuni   │    │   (Backups)     │
│   complexe)     │    │                 │
└─────────────────┘    └─────────────────┘
```

### 1.2 Componente principale
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express + MySQL2
- **API PHP**: Pentru operațiuni complexe cu baza de date
- **Baza de date**: MySQL cu 7 tabele principale
- **Autentificare**: JWT + localStorage

## 2. STRUCTURA BAZEI DE DATE

### 2.1 Diagrama ERD
```
clients (1) ──── (N) accounts (1) ──── (N) cards
    │                    │
    │                    │
    │                    ▼
    │              transactions
    │                    │
    │                    │
    ▼                    ▼
saved_recipients    history
    │
    │
    ▼
banks (1) ──── (N) accounts
```

### 2.2 Tabele principale

#### Tabelul `clients`
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

#### Tabelul `accounts`
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

#### Tabelul `transactions`
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

## 3. ALGORITMUL DE CALCUL AL SCORULUI DE CREDIT

### 3.1 Formula principală
```typescript
scor = venit_lunar - cheltuieli_lunare - (datorii_totale × 2)
```

### 3.2 Componentele calculului

#### Venitul lunar
- **Sursa**: Solduri pozitive din conturile bancare
- **Calcul**: Suma tuturor soldurilor pozitive
- **Perioada**: Configurabilă (1 lună, 3 luni, 6 luni, 1 an, toate)

#### Cheltuielile lunare
- **Sursa**: Tranzacții cu direcția "outgoing"
- **Calcul**: Suma tranzacțiilor de cheltuieli
- **Perioada**: Aceeași ca venitul

#### Datoriile totale
- **Sursa**: Solduri negative din conturile bancare
- **Calcul**: Suma valorilor absolute ale soldurilor negative
- **Factor de multiplicare**: 2 (pentru a accentua impactul datoriilor)

### 3.3 Implementarea în cod
```typescript
// Implementarea completă a algoritmului de credit score
export class CreditScoreCalculator {
    static calculateScore(income: number, expenses: number, debts: number): number {
        return income - expenses - (debts * 2);
    }

    static analyzeRiskFactors(income: number, expenses: number, debts: number) {
        const debtToIncomeRatio = income > 0 ? (debts / income) * 100 : 0;
        const expenseToIncomeRatio = income > 0 ? (expenses / income) * 100 : 0;
        
        return {
            debtToIncomeRatio,
            expenseToIncomeRatio,
            isHighRisk: debtToIncomeRatio > 50 || expenseToIncomeRatio > 80,
            riskLevel: this.getRiskLevel(debtToIncomeRatio, expenseToIncomeRatio)
        };
    }

    static getRiskLevel(debtRatio: number, expenseRatio: number): 'low' | 'medium' | 'high' | 'critical' {
        if (debtRatio > 80 || expenseRatio > 90) return 'critical';
        if (debtRatio > 50 || expenseRatio > 70) return 'high';
        if (debtRatio > 30 || expenseRatio > 50) return 'medium';
        return 'low';
    }

    static generateRecommendations(score: number, riskFactors: any): string[] {
        const recommendations = [];
        
        if (score >= 1000) {
            recommendations.push("🎉 Excelent! Menține această situație financiară stabilă");
            recommendations.push("💡 Continuă să economisești regulat");
        } else if (score >= 500) {
            recommendations.push("👍 Bun! Poți îmbunătăți scorul prin economii suplimentare");
            recommendations.push("📊 Monitorizează cheltuielile lunare");
        } else if (score >= 0) {
            recommendations.push("⚠️ Acceptabil, dar necesită atenție");
            recommendations.push("💸 Redu cheltuielile și plătește datoriile");
        } else {
            recommendations.push("🚨 Situație critică - acțiuni imediate necesare");
            recommendations.push("📞 Consultează un specialist financiar");
        }

        if (riskFactors.debtToIncomeRatio > 50) {
            recommendations.push("⚠️ Datoriile reprezintă peste 50% din venituri");
        }
        
        if (riskFactors.expenseToIncomeRatio > 80) {
            recommendations.push("⚠️ Cheltuielile reprezintă peste 80% din venituri");
        }

        return recommendations;
    }
}
```

## 4. API-URI ȘI ENDPOINT-URI

### 4.1 API-uri Node.js (Express)
```javascript
// Autentificare
POST /api/auth/login
POST /api/auth/register

// Conturi bancare
GET /api/accounts/:clientId
POST /api/accounts/create
PUT /api/accounts/:id

// Tranzacții
GET /api/transactions/:clientId
POST /api/transactions/transfer
PUT /api/transactions/:id/status
```

### 4.2 API-uri PHP
```php
// Gestionarea utilizatorilor
POST /api/getUsers.php
POST /api/registerUser.php
POST /api/loginUser.php
POST /api/updateClientProfile.php

// Gestionarea conturilor
POST /api/getAccountsByClient.php
POST /api/getAccountBalances.php
POST /api/createNewAccount.php

// Gestionarea tranzacțiilor
POST /api/transferBetweenAccounts.php
POST /api/getTransactions.php
POST /api/getAllTransactions.php

// Calculul scorului de credit
POST /api/getCreditScoreData.php

// Administrare
POST /api/getAllCards.php
POST /api/updateCard.php
POST /api/backupDatabase.php
```

## 5. SECURITATE ȘI AUTENTIFICARE

### 5.1 Criptarea parolelor
```javascript
const bcrypt = require('bcrypt');

// Criptarea parolei la înregistrare
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verificarea parolei la login
const isValidPassword = await bcrypt.compare(password, hashedPassword);
```

### 5.2 Validarea input-urilor
```typescript
// Validarea email-ului
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = emailRegex.test(email);

// Validarea CNP-ului
const cnpRegex = /^[0-9]{13}$/;
const isValidCNP = cnpRegex.test(cnp);

// Validarea sumelor
const isValidAmount = amount > 0 && amount <= 999999.99;
```

### 5.3 Protecția rutelor
```typescript
// Middleware pentru verificarea autentificării
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token de autentificare lipsă' });
    }
    // Verificarea token-ului JWT
    next();
};

// Middleware pentru verificarea rolului de admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acces interzis' });
    }
    next();
};
```

## 6. INTERFAȚA UTILIZATOR

### 6.1 Structura componentelor React
```
src/
├── components/
│   ├── AuthForm.tsx
│   ├── AuthLayout.tsx
│   ├── LoginForm.tsx
│   ├── Navbar.tsx
│   └── RegisterForm.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── CreditScorePage.tsx
│   ├── ClientHistoryPage.tsx
│   ├── AdminPage.tsx
│   ├── CarduriPage.tsx
│   ├── ProfilePage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── services/
│   ├── authService.ts
│   └── server.js
└── App.tsx
```

### 6.2 Rutele aplicației
```typescript
// App.tsx - Configurarea rutelor cu protecție
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthService } from './services/authService';

function App() {
    return (
        <div className="app-container">
            <Router>
                <div className="navbar-wrapper">
                    <Navbar />
                </div>
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route 
                            path="/scor" 
                            element={
                                <ProtectedRoute>
                                    <CreditScorePage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/istoric" 
                            element={
                                <ProtectedRoute>
                                    <ClientHistoryPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/carduri" 
                            element={
                                <ProtectedRoute>
                                    <CarduriPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/account" 
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin" 
                            element={
                                <AdminRoute>
                                    <AdminPage />
                                </AdminRoute>
                            } 
                        />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

// Componenta pentru protecția rutelor
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return AuthService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// Componenta pentru rutele de admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    return AuthService.hasRole('admin') ? children : <Navigate to="/" />;
};
```

### 6.3 Exemple de componente React
```typescript
// CreditScorePage.tsx - Componenta principală pentru calculul scorului
import React, { useState, useEffect } from 'react';
import { CreditScoreCalculator } from '../services/creditScoreService';

const CreditScorePage: React.FC = () => {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [debts, setDebts] = useState('');
    const [score, setScore] = useState<number | null>(null);
    const [recommendations, setRecommendations] = useState<string[]>([]);

    const calculateScore = () => {
        const incomeVal = parseFloat(income) || 0;
        const expensesVal = parseFloat(expenses) || 0;
        const debtsVal = parseFloat(debts) || 0;
        
        const calculatedScore = CreditScoreCalculator.calculateScore(incomeVal, expensesVal, debtsVal);
        const riskFactors = CreditScoreCalculator.analyzeRiskFactors(incomeVal, expensesVal, debtsVal);
        const recs = CreditScoreCalculator.generateRecommendations(calculatedScore, riskFactors);
        
        setScore(calculatedScore);
        setRecommendations(recs);
    };

    return (
        <div className="page-container">
            <div className="card">
                <h2>Calculează-ți Scorul de Credit</h2>
                
                <form onSubmit={(e) => { e.preventDefault(); calculateScore(); }}>
                    <input
                        type="number"
                        placeholder="Venit lunar"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Cheltuieli lunare"
                        value={expenses}
                        onChange={(e) => setExpenses(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Datorii totale"
                        value={debts}
                        onChange={(e) => setDebts(e.target.value)}
                    />
                    <button type="submit">Calculează</button>
                </form>

                {score !== null && (
                    <div className="score-result">
                        <h3>Scorul tău: {score}</h3>
                        <div className="recommendations">
                            {recommendations.map((rec, index) => (
                                <div key={index} className="recommendation">
                                    {rec}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
```

## 7. CONFIGURAREA MEDIULUI DE DEZVOLTARE

### 7.1 Dependențe Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.5.1",
    "axios": "^1.8.4",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.2",
    "vite": "^6.3.1",
    "eslint": "^9.22.0"
  }
}
```

### 7.2 Dependențe Backend (package.json)
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mysql2": "^3.14.0",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 7.3 Configurarea bazei de date
```javascript
// server/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'banca'
});

module.exports = db;
```

## 8. TESTAREA ȘI VALIDAREA

### 8.1 Teste unitare pentru algoritmul de credit score
```typescript
describe('Credit Score Calculation', () => {
    test('should calculate correct score for positive scenario', () => {
        const income = 5000;
        const expenses = 3000;
        const debts = 1000;
        const expectedScore = 5000 - 3000 - (1000 * 2) = 0;
        expect(calculateCreditScore(income, expenses, debts)).toBe(expectedScore);
    });

    test('should handle high debt scenario', () => {
        const income = 3000;
        const expenses = 2000;
        const debts = 2000;
        const expectedScore = 3000 - 2000 - (2000 * 2) = -3000;
        expect(calculateCreditScore(income, expenses, debts)).toBe(expectedScore);
    });
});
```

### 8.2 Teste de integrare pentru API-uri
```typescript
describe('Transfer API', () => {
    test('should transfer money between accounts', async () => {
        const transferData = {
            from_account_id: 1,
            to_account_id: 2,
            amount: 100,
            client_id: 1
        };
        
        const response = await request(app)
            .post('/api/transferBetweenAccounts.php')
            .send(transferData);
            
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
```

## 9. DEPLOYMENT ȘI CONFIGURARE

### 9.1 Configurarea serverului de dezvoltare
```bash
# Frontend
cd Licenta
npm install
npm run dev

# Backend
cd Licenta/server
npm install
npm run dev

# Baza de date
# Configurare MySQL cu phpMyAdmin
# Import script-ul database.sql
```

### 9.2 Variabile de mediu
```env
# .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=banca
PORT=3001
JWT_SECRET=your-secret-key
```

## 10. MONITORIZARE ȘI LOGGING

### 10.1 Logging pentru operațiuni critice
```javascript
// Logging pentru transferuri
console.log(`Transfer: ${amount} RON from account ${fromAccount} to ${toAccount}`);

// Logging pentru erori
console.error('Database connection failed:', error.stack);

// Logging pentru autentificare
console.log(`User ${email} logged in successfully`);
```

### 10.2 Monitorizarea performanței
```javascript
// Măsurarea timpului de răspuns
const startTime = Date.now();
// ... operațiune ...
const endTime = Date.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

## 11. BACKUP ȘI RECUPERARE

### 11.1 Backup automat al bazei de date
```php
// backupDatabase.php
$backupFile = 'backups/backup_' . date('Y-m-d_H-i-s') . '.sql';
$command = "mysqldump --user={$username} --password={$password} --host={$host} {$database} > {$backupFile}";
exec($command);
```

### 11.2 Exportul datelor în format JSON
```javascript
// Exportul datelor pentru backup
const exportData = {
    users: users,
    accounts: accounts,
    transactions: transactions,
    cards: cards,
    exportDate: new Date().toISOString()
};

const dataStr = JSON.stringify(exportData, null, 2);
// Salvarea în fișier
```

## 12. OPTIMIZĂRI ȘI PERFORMANȚĂ

### 12.1 Optimizarea bazei de date
```sql
-- Indexuri pentru căutări rapide
CREATE INDEX idx_client_email ON clients(email);
CREATE INDEX idx_account_client ON accounts(client_id);
CREATE INDEX idx_transaction_account ON transactions(account_id);
CREATE INDEX idx_transaction_date ON transactions(created_at);
```

### 12.2 Caching pentru date frecvent accesate
```javascript
// Cache pentru solduri
const balanceCache = new Map();

const getAccountBalance = async (accountId) => {
    if (balanceCache.has(accountId)) {
        return balanceCache.get(accountId);
    }
    
    const balance = await fetchBalanceFromDB(accountId);
    balanceCache.set(accountId, balance);
    return balance;
};
```

Această documentație tehnică oferă o imagine completă asupra implementării aplicației de analiză a clienților bancari, incluzând toate aspectele tehnice necesare pentru înțelegerea și dezvoltarea ulterioară a sistemului.
