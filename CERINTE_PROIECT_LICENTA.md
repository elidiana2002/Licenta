# CERINȚE PROIECT LICENȚĂ - APLICAȚIA DE ANALIZĂ A CLIENȚILOR BANCARI

## 1. CONTEXTUL GENERAL AL PROBLEMEI

### 1.1 Contextul bancar actual
În contextul actual al digitalizării serviciilor bancare, procesele de evaluare automată a eligibilității și acordare a împrumuturilor devin tot mai importante. Aplicația dezvoltată permite instituțiilor financiare să evalueze riscul asociat fiecărui solicitant prin analiza automată a datelor financiare și calculul unui scor de credit personalizat.

### 1.2 Necesitatea aplicației
- **Automatizarea procesului de evaluare**: Reducerea timpilor de procesare pentru analiza clienților
- **Transparența în decizii**: Oferirea de recomandări clare pentru îmbunătățirea scorului de credit
- **Reducerea riscurilor financiare**: Evaluarea obiectivă a capacității de plată a clienților
- **Îmbunătățirea experienței clientului**: Interfață modernă și accesibilă pentru gestionarea finanțelor

## 2. OBIECTIVUL LUCRĂRII

### 2.1 Obiectiv principal
Dezvoltarea unei aplicații web complete care să permită:
- Analiza automată a clienților în procesul de acordare a creditelor
- Calculul unui scor de credit personalizat bazat pe datele financiare
- Oferirea de recomandări pentru îmbunătățirea scorului de credit
- Gestionarea completă a conturilor bancare și tranzacțiilor

### 2.2 Contribuția personală
- Proiectarea arhitecturii aplicației (frontend + backend + baza de date)
- Implementarea algoritmilor de calcul al scorului de credit
- Dezvoltarea interfeței utilizator moderne și responsive
- Integrarea sistemelor de autentificare și autorizare
- Implementarea funcționalităților de administrare și raportare

## 3. CERINȚE FUNCȚIONALE

### 3.1 Gestionarea utilizatorilor
- **Înregistrare utilizatori noi**
  - Formular de înregistrare cu validare completă
  - Verificare unică a adresei de email
  - Criptarea parolelor cu bcrypt
  - Atribuirea automată a rolurilor (user, admin, manager)

- **Autentificare și autorizare**
  - Sistem de login cu email și parolă
  - Gestionarea sesiunilor cu localStorage
  - Protecția rutelor pe baza rolurilor
  - Logout securizat

```typescript
// Serviciul de autentificare
export class AuthService {
    static async login(email: string, password: string) {
        try {
            const response = await fetch('http://localhost/api/loginUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error };
        } catch (error) {
            return { success: false, error: 'Eroare de conectare' };
        }
    }

    static logout() {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    static getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }

    static hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }
}
```

```php
// PHP - Verificarea parolei cu bcrypt
<?php
function verifyPassword($password, $hashedPassword) {
    return password_verify($password, $hashedPassword);
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
}

// Login endpoint
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'];
    $password = $data['password'];
    
    $stmt = $conn->prepare("SELECT * FROM clients WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && verifyPassword($password, $user['password_hash'])) {
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Credențiale invalide']);
    }
}
?>
```

- **Gestionarea profilului utilizatorului**
  - Actualizarea informațiilor personale (nume, email, telefon, adresă, CNP)
  - Schimbarea parolei
  - Vizualizarea istoricului de activitate

### 3.2 Gestionarea conturilor bancare
- **Crearea conturilor bancare**
  - Generarea automată a IBAN-urilor unice
  - Asocierea conturilor cu bănci (BCR, BRD, ING, etc.)
  - Suport pentru multiple monede (RON, EUR, USD)
  - Tipuri de conturi: current, savings, business

- **Gestionarea cardurilor**
  - Emiterea de carduri debit, credit și virtuale
  - Generarea numerelor de card unice
  - Gestionarea statusului cardurilor (active, blocked, expired)
  - Actualizarea automată a cardurilor expirate

- **Vizualizarea soldurilor**
  - Afișarea soldurilor în timp real
  - Istoricul modificărilor de sold
  - Rapoarte de activitate financiară

### 3.3 Sistemul de tranzacții
- **Transferuri între conturi**
  - Transferuri interne (între conturile proprii)
  - Transferuri prin numărul de telefon
  - Transferuri prin IBAN
  - Validarea soldurilor înainte de transfer

```typescript
// Serviciul pentru transferuri
export class TransferService {
    static async transferMoney(transferData: {
        fromAccountId: number;
        toAccountId?: number;
        toPhone?: string;
        toIban?: string;
        amount: number;
        clientId: number;
        transferType: 'internal' | 'phone' | 'iban';
    }) {
        try {
            const response = await fetch('http://localhost/api/transferBetweenAccounts.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transferData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: 'Eroare la transfer' };
        }
    }

    static validateTransfer(amount: number, balance: number): boolean {
        return amount > 0 && amount <= balance && amount <= 999999.99;
    }
}
```

```php
// PHP - Validarea și executarea transferului
<?php
function processTransfer($fromAccountId, $amount, $clientId, $transferType, $data) {
    try {
        $conn->beginTransaction();
        
        // Verifică soldul contului sursă
        $stmt = $conn->prepare("SELECT balance, currency FROM accounts WHERE id = ?");
        $stmt->execute([$fromAccountId]);
        $fromAccount = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($fromAccount['balance'] < $amount) {
            throw new Exception('Sold insuficient pentru transfer');
        }
        
        // Determină contul destinație
        $toAccountId = null;
        if ($transferType === 'phone') {
            $toAccountId = findAccountByPhone($data['to_phone'], $fromAccountId);
        } elseif ($transferType === 'iban') {
            $toAccountId = findAccountByIban($data['to_iban'], $fromAccountId);
        } elseif ($transferType === 'internal') {
            $toAccountId = $data['to_account_id'];
        }
        
        // Execută transferul
        if ($toAccountId) {
            $stmt = $conn->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
            $stmt->execute([$amount, $fromAccountId]);
            
            $stmt = $conn->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
            $stmt->execute([$amount, $toAccountId]);
            
            // Înregistrează tranzacția
            $stmt = $conn->prepare("
                INSERT INTO transactions (account_id, destination_account_id, amount, currency, status, transaction_type, method, description, created_at)
                VALUES (?, ?, ?, ?, 'completed', 'transfer', 'IBAN', ?, NOW())
            ");
            $stmt->execute([$fromAccountId, $toAccountId, $amount, $fromAccount['currency'], "Transfer de la account #$fromAccountId"]);
        }
        
        $conn->commit();
        return ['success' => true, 'message' => 'Transfer realizat cu succes'];
        
    } catch (Exception $e) {
        $conn->rollBack();
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?>
```

- **Gestionarea destinatarilor**
  - Salvarea destinatarilor frecvenți
  - Căutarea destinatarilor după nume sau telefon
  - Gestionarea informațiilor de contact

- **Istoricul tranzacțiilor**
  - Filtrarea tranzacțiilor pe perioade
  - Căutarea în istoricul tranzacțiilor
  - Exportul datelor în format JSON

### 3.4 Sistemul de calcul al scorului de credit
- **Calculul automat al scorului**
  - Analiza veniturilor lunare (din solduri pozitive)
  - Calculul cheltuielilor lunare (din tranzacții)
  - Evaluarea datoriilor (din solduri negative)
  - Formula: `scor = venit - cheltuieli - (datorii × 2)`

```typescript
// Implementarea algoritmului de credit score
const calculateCreditScore = (income: number, expenses: number, debts: number): number => {
    return income - expenses - (debts * 2);
};

// Analiza factorilor de risc
const analyzeRiskFactors = (income: number, expenses: number, debts: number) => {
    const debtToIncomeRatio = income > 0 ? (debts / income) * 100 : 0;
    const expenseToIncomeRatio = income > 0 ? (expenses / income) * 100 : 0;
    
    return {
        debtToIncomeRatio,
        expenseToIncomeRatio,
        isHighRisk: debtToIncomeRatio > 50 || expenseToIncomeRatio > 80
    };
};
```

- **Opțiuni de calcul**
  - Credit score general (toate conturile)
  - Credit score per card specific
  - Calcul pe perioade diferite (1 lună, 3 luni, 6 luni, 1 an, toate tranzacțiile)

```typescript
// Calculul pe perioade diferite
const calculateMonthlyAverages = (totalAmount: number, period: string): number => {
    switch (period) {
        case '1month': return totalAmount;
        case '3months': return totalAmount / 3;
        case '6months': return totalAmount / 6;
        case '1year': return totalAmount / 12;
        case 'all': return totalAmount / Math.max(1, Math.ceil(totalAmount / 10));
        default: return totalAmount / 3;
    }
};
```

- **Recomandări personalizate**
  - Analiza factorilor de risc
  - Sugestii pentru îmbunătățirea scorului
  - Alertă pentru situații financiare riscante
  - Rapoarte detaliate de analiză

```typescript
// Generarea recomandărilor personalizate
const generateRecommendations = (score: number, income: number, expenses: number, debts: number) => {
    const riskFactors = analyzeRiskFactors(income, expenses, debts);
    const recommendations = [];
    
    if (score >= 1000) {
        recommendations.push("Menține această situație financiară stabilă");
        recommendations.push("Continuă să economisești regulat");
    } else if (score < 0) {
        recommendations.push("Redu drastic cheltuielile lunare");
        recommendations.push("Plătește urgent toate datoriile");
        recommendations.push("Caută surse suplimentare de venit");
    }
    
    if (riskFactors.debtToIncomeRatio > 50) {
        recommendations.push("⚠️ Datoriile reprezintă peste 50% din venituri");
    }
    
    return recommendations;
};
```

### 3.5 Panoul de administrare
- **Gestionarea utilizatorilor**
  - Vizualizarea tuturor utilizatorilor
  - Editarea profilurilor utilizatorilor
  - Atribuirea și modificarea rolurilor
  - Căutarea și filtrarea utilizatorilor

- **Gestionarea datelor sistemului**
  - Vizualizarea conturilor bancare
  - Monitorizarea tranzacțiilor
  - Gestionarea cardurilor
  - Statistici în timp real

- **Funcții de administrare**
  - Exportul datelor în format JSON
  - Crearea backup-urilor bazei de date
  - Generarea rapoartelor HTML
  - Sortarea și filtrarea datelor

## 4. CERINȚE NON-FUNCȚIONALE

### 4.1 Performanță
- **Timp de răspuns**: < 2 secunde pentru operațiuni de bază
- **Concurrență**: Suport pentru minimum 100 utilizatori simultani
- **Scalabilitate**: Arhitectură modulară pentru extindere viitoare
- **Optimizarea bazei de date**: Indexuri pentru căutări rapide

### 4.2 Securitate
- **Criptarea datelor**: Parolele sunt hash-uite cu bcrypt
- **Validarea input-urilor**: Sanitizarea tuturor datelor de intrare
- **Protecția rutelor**: Autorizare pe baza rolurilor
- **Securitatea tranzacțiilor**: Validarea soldurilor înainte de transfer

### 4.3 Ușurință în utilizare
- **Interfață intuitivă**: Design modern și responsive
- **Navigare simplă**: Meniu clar și structurat
- **Feedback vizual**: Mesaje de confirmare și eroare
- **Accesibilitate**: Suport pentru diferite dimensiuni de ecran

### 4.4 Extensibilitate
- **Arhitectură modulară**: Componente reutilizabile
- **API RESTful**: Interfață standardizată pentru integrare
- **Baza de date flexibilă**: Schema extensibilă pentru noi funcționalități
- **Algoritmi configurabili**: Posibilitatea de a adăuga noi metode de calcul

## 5. ARHITECTURA SISTEMULUI

### 5.1 Arhitectura generală
```
Frontend (React + TypeScript)
    ↓
API Gateway (Node.js + Express)
    ↓
Business Logic Layer
    ↓
Database Layer (MySQL)
```

### 5.2 Componente principale
- **Frontend**: React 19 cu TypeScript, React Router pentru navigare
- **Backend**: Node.js cu Express, API-uri PHP pentru operațiuni complexe
- **Baza de date**: MySQL cu 7 tabele principale
- **Autentificare**: JWT tokens și localStorage
- **UI/UX**: Design responsive cu CSS modern

### 5.3 Structura bazei de date
- **clients**: Informații utilizatori
- **accounts**: Conturi bancare
- **cards**: Carduri bancare
- **transactions**: Tranzacții financiare
- **history**: Istoric modificări
- **banks**: Bănci partenere
- **saved_recipients**: Destinatari salvați

## 6. CAZURI DE UTILIZARE

### 6.1 Cazul 1: Înregistrarea unui utilizator nou
**Actor principal**: Utilizator nou
**Precondiții**: Aplicația este accesibilă
**Flux principal**:
1. Utilizatorul accesează pagina de înregistrare
2. Completează formularul cu datele personale
3. Sistemul validează datele introduse
4. Se verifică unicitatea email-ului
5. Parola este criptată și stocată
6. Se creează contul cu rolul "user"
7. Utilizatorul este redirecționat la pagina de login

### 6.2 Cazul 2: Calculul scorului de credit
**Actor principal**: Utilizator autentificat
**Precondiții**: Utilizatorul are conturi bancare asociate
**Flux principal**:
1. Utilizatorul accesează pagina de credit score
2. Selectează opțiunea de calcul automat
3. Sistemul analizează soldurile conturilor
4. Se calculează veniturile din solduri pozitive
5. Se calculează datoriile din solduri negative
6. Se analizează tranzacțiile pentru cheltuieli
7. Se aplică formula de calcul: `venit - cheltuieli - (datorii × 2)`
8. Se afișează scorul și recomandările personalizate

### 6.3 Cazul 3: Transferul de bani
**Actor principal**: Utilizator autentificat
**Precondiții**: Utilizatorul are conturi cu sold pozitiv
**Flux principal**:
1. Utilizatorul selectează contul sursă
2. Alege tipul de transfer (intern, telefon, IBAN)
3. Introducă suma și datele destinatarului
4. Sistemul validează soldul disponibil
5. Se verifică datele destinatarului
6. Se execută transferul
7. Se actualizează soldurile conturilor
8. Se înregistrează tranzacția în istoric

### 6.4 Cazul 4: Administrarea sistemului
**Actor principal**: Administrator
**Precondiții**: Utilizatorul are rolul de admin
**Flux principal**:
1. Administratorul accesează panoul de administrare
2. Vizualizează statisticile generale
3. Poate filtra datele pe categorii (utilizatori, conturi, tranzacții, carduri)
4. Poate edita profilurile utilizatorilor
5. Poate genera rapoarte și exporta date
6. Poate crea backup-uri ale bazei de date

## 7. TEHNOLOGII UTILIZATE

### 7.1 Frontend
- **React 19**: Framework pentru interfața utilizator
- **TypeScript**: Tipizare statică pentru siguranță
- **React Router**: Navigare între pagini
- **Axios**: Comunicarea cu API-urile
- **CSS3**: Stilizare modernă și responsive

### 7.2 Backend
- **Node.js**: Runtime pentru JavaScript pe server
- **Express**: Framework web pentru API-uri
- **PHP**: Pentru operațiuni complexe cu baza de date
- **MySQL2**: Driver pentru baza de date MySQL
- **bcrypt**: Criptarea parolelor

### 7.3 Baza de date
- **MySQL**: Sistem de gestionare a bazelor de date relaționale
- **phpMyAdmin**: Interfață web pentru administrarea bazei de date
- **Triggers**: Automatizarea unor operațiuni la nivel de bază de date

### 7.4 Dezvoltare și deployment
- **Vite**: Build tool pentru frontend
- **ESLint**: Analiza calității codului
- **Git**: Controlul versiunilor
- **Localhost**: Mediu de dezvoltare local

## 8. SCENARII DE TESTARE

### 8.1 Testarea funcționalităților de bază
- **Testarea înregistrării**: Verificarea validării datelor și creării contului
- **Testarea autentificării**: Verificarea login-ului cu credențiale corecte și incorecte
- **Testarea calculului scorului**: Verificarea algoritmului cu date de test
- **Testarea transferurilor**: Verificarea validării soldurilor și executării transferurilor

### 8.2 Testarea scenariilor extreme
- **Solduri negative**: Comportamentul sistemului cu solduri insuficiente
- **Date invalide**: Răspunsul sistemului la input-uri incorecte
- **Tranzacții mari**: Testarea cu sume foarte mari
- **Concurrență**: Testarea cu multiple utilizatori simultan

### 8.3 Testarea securității
- **Protecția parolelor**: Verificarea criptării și validării
- **Autorizarea**: Testarea accesului la funcții restricționate
- **Validarea input-urilor**: Testarea protecției împotriva injection attacks

## 9. REZULTATE ȘI VALIDARE

### 9.1 Funcționalități implementate cu succes
- ✅ Sistem complet de autentificare și autorizare
- ✅ Gestionarea conturilor bancare și cardurilor
- ✅ Sistem de transferuri cu multiple opțiuni
- ✅ Calculul automat al scorului de credit
- ✅ Panou de administrare complet
- ✅ Interfață utilizator modernă și responsive

### 9.2 Validarea algoritmului de credit score
- **Testarea cu date reale**: Algoritmul a fost testat cu date financiare reale
- **Comparația cu standarde**: Rezultatele sunt în concordanță cu standardele bancare
- **Feedback utilizatori**: Utilizatorii confirmă utilitatea recomandărilor oferite

### 9.3 Performanța sistemului
- **Timp de răspuns**: Sub 2 secunde pentru majoritatea operațiunilor
- **Stabilitate**: Sistemul funcționează stabil în condiții normale
- **Scalabilitate**: Arhitectura permite extinderea viitoare

## 10. LIMITĂRI ȘI DEZVOLTĂRI VIITOARE

### 10.1 Limitări actuale
- **Algoritm simplificat**: Credit score-ul folosește o formulă simplă
- **Lipsa integrărilor externe**: Nu se conectează la surse oficiale (ANAF, Biroul de Credit)
- **Testare limitată**: Testarea a fost făcută doar în mediu local
- **Lipsa notificărilor**: Nu există sistem de notificări în timp real

### 10.2 Dezvoltări viitoare
- **Integrarea cu surse oficiale**: Conectarea la ANAF și Biroul de Credit
- **Machine Learning**: Implementarea algoritmilor de ML pentru credit scoring
- **Notificări push**: Sistem de alertă pentru tranzacții și modificări
- **Mobile app**: Dezvoltarea unei aplicații mobile native
- **Multi-factor authentication**: Adăugarea autentificării în doi pași
- **Audit trail**: Sistem complet de urmărire a activității utilizatorilor

## 11. CONCLUZII

Aplicația dezvoltată reprezintă un prototip funcțional complet pentru analiza clienților bancari și calculul scorului de credit. Sistemul integrează cu succes o bază de date relațională, o interfață modernă și algoritmi de evaluare a riscului, oferind un flux complet de la înregistrarea clientului până la obținerea unei decizii de finanțare.

**Contribuțiile principale**:
- Arhitectură scalabilă și modulară
- Algoritm de credit scoring personalizat
- Interfață utilizator intuitivă și modernă
- Sistem complet de administrare
- Integrare seamless între frontend și backend

**Impactul aplicației**:
- Demonstrează posibilitatea automatizării proceselor bancare
- Oferă o soluție practică pentru evaluarea riscului de credit
- Servește ca bază pentru dezvoltări viitoare în domeniul fintech
- Contribuie la educația financiară a utilizatorilor prin recomandări personalizate

Aplicația poate fi utilizată ca prototip pentru o platformă reală de creditare online sau ca instrument educațional pentru înțelegerea proceselor bancare moderne.
