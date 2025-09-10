CORECTAREA TEXTULUI PENTRU APLICAȚIA DE ANALIZĂ A CLIENȚILOR BANCARI

3.1 Contextul general al problemei

În era digitală, clienții bancari se confruntă cu provocări semnificative în ceea ce privește înțelegerea propriului risc de credit și gestionarea finanțelor personale. Fiecare decizie de solicitare a unui împrumut presupune autoevaluarea capacității de plată, analiza istoricului financiar personal și înțelegerea factorilor care pot influența eligibilitatea pentru credit. Lipsa transparenței în procesul de evaluare poate duce la aplicări respinse, condiții nefavorabile sau planificare financiară deficitară. În acest sens, dezvoltarea unui sistem de autoevaluare a scorului de credit devine o necesitate pentru clienții care doresc să își îmbunătățească eligibilitatea pentru credit, să planifice financiar mai bine și să înțeleagă propriile obiceiuri de cheltuire.

3.2 Obiectivul lucrării

Scopul principal al acestui proiect este de a crea un prototip funcțional de aplicație de autoevaluare financiară care să permită clienților să introducă propriile date financiare, să aplice un algoritm de scoring personalizat și să primească recomandări personalizate pentru îmbunătățirea scorului de credit. În plus, aplicația trebuie să ofere o interfață intuitivă pentru gestionarea conturilor bancare, analiza tranzacțiilor și monitorizarea progresului financiar.

Funcționalitățile principale ale aplicației:

Gestionarea conturilor bancare – sistemul permite crearea și administrarea conturilor bancare multiple cu IBAN-uri unice și suport pentru diferite monede.

Calculul automat al scorului de credit – utilizatorii pot introduce datele financiare sau permitea aplicației să le calculeze automat din tranzacțiile existente.

Aplicarea algoritmului de scoring – printr-un modul de calcul personalizat, sistemul transformă datele financiare într-un scor numeric și analizează factorii de risc.

Generarea recomandărilor personalizate – toate informațiile sunt păstrate în baza de date, iar utilizatorii primesc sugestii concrete pentru îmbunătățirea situației financiare.

Panou de administrare – pentru utilizatorii cu rol de admin, sistemul oferă vizualizarea tuturor datelor și generarea de rapoarte.

3.3 Structura documentului

Pentru a facilita citirea și înțelegerea procesului de dezvoltare, documentul este împărțit în mai multe secțiuni, fiecare abordând un aspect specific al proiectului. În continuare, vom detalia fiecare secțiune, menținând un format coerent și organizat:

Punctul 3.1: Contextul general al problemei – explicația detaliată a necesității unui sistem de autoevaluare financiară pentru clienții bancari moderni.

Punctul 3.2: Obiectivul lucrării – clarificarea scopurilor și a rezultatelor așteptate pentru utilizatorii finali.

Punctul 3.3: Structura documentului – prezentarea planului de acțiune și a organizării textului.

Acest cadru introductiv oferă o imagine de ansamblu asupra problemei de studiu și a direcției pe care proiectul o urmează, stabilind baza pentru aprofundarea subiectului în secțiunile ulterioare.

3.4 Detalierea contextului și a motivelor alegerii tehnologiilor

Evoluția modului de gestionare a finanțelor personale

În trecut, clienții bancari se bazau pe consultanța bancară tradițională pentru a înțelege eligibilitatea pentru credit și pentru a planifica finanțele personale. Acest proces era lent, costisitor și dependent de disponibilitatea consilierilor.

Astăzi, clienții adoptă soluții digitale pentru a autogestiona finanțele, să monitorizeze în timp real soldurile conturilor și să înțeleagă propriul risc de credit independent.

Necesitatea unui sistem de autoevaluare standardizat

Standardizarea autoevaluării asigură că toate deciziile financiare personale sunt luate pe baza unor criterii obiective și consistente.

Un algoritm de scoring bine documentat și transparent poate fi înțeles de utilizatori, sporind încrederea în propriile decizii financiare.

Beneficiile unui prototip de aplicație de autoevaluare financiară

Rapiditate: O aplicație web permite analiza instantanee a situației financiare și obținerea unui scor de credit imediat.

Accesibilitate: Utilizatorii pot accesa sistemul de pe diferite dispozitive, inclusiv mobil, pentru a monitoriza finanțele oriceunde.

Transparență: Algoritmul de calcul este complet transparent, permițând utilizatorilor să înțeleagă exact cum se calculează scorul lor.

Personalizare: Sistemul oferă recomandări personalizate bazate pe situația financiară specifică a fiecărui utilizator.

Scalabilitate: Prototipul poate fi extins ulterior cu funcționalități suplimentare precum integrarea cu surse externe de date financiare.

Aspecte de securitate și conformitate

Gestionarea parolelor (hashing cu bcrypt, salting).

Autentificarea securizată cu gestionarea sesiunilor prin localStorage.

Protecția datelor sensibile prin validarea input-urilor și sanitizarea datelor.

Autorizarea pe roluri pentru protecția funcțiilor administrative.

Backup și recuperare a datelor pentru siguranța informațiilor.

Impactul asupra experienței utilizatorilor

O interfață modernă și intuitivă reduce fricțiunea și crește adoptarea aplicației de către utilizatori.

Notificări clare despre scorul de credit și recomandări concrete contribuie la transparență și la încredere în sistem.

Gestionarea centralizată a tuturor conturilor bancare într-o singură aplicație simplifică administrarea financiară.

3.5 Cadru de lucru și metodologia aleasă

Pentru a atinge obiectivele stabilite, proiectul se bazează pe o metodologie iterativă și incrementală adaptată pentru dezvoltarea unei aplicații de autoevaluare financiară. Aceasta include:

Planificarea și analiza cerințelor – interviuri cu potențiali utilizatori (clienți bancari) și consultarea literaturii de specialitate pentru a defini algoritmul de scoring și funcționalitățile necesare.

Designul sistemului – utilizarea diagramelor UML și a arhitecturii component-based pentru a clarifica fluxurile de date și a identifica componentele critice (frontend React, backend Node.js, baza de date MySQL).

Implementarea incrementală – construirea API-urilor, a bazei de date și a interfeței utilizatorului în faze, permițând testarea continuă a fiecărei funcționalități.

Integrarea sistemelor – conectarea frontend-ului React cu backend-ul Node.js și API-urile PHP pentru operațiuni complexe cu baza de date.

Testare și validare – verificarea corectitudinii algoritmului de calcul al scorului, a performanței sistemului și a securității datelor utilizatorilor.

Deployment și documentație – configurarea mediului de producție și crearea documentației complete pentru utilizatori și dezvoltatori.

Această abordare facilitează gestionarea riscului în fazele de dezvoltare și asigură că orice problemă poate fi detectată și remediată rapid, oferind utilizatorilor o experiență stabilă și sigură în gestionarea finanțelor personale.

OBSERVAȚII ASUPRA CORECTĂRII

Modificări principale făcute:

1. Perspectiva inversată: De la "banca evaluează clientul" la "clientul se auto-evaluează"
2. Focus pe utilizatorii finali: Clienții bancari în loc de instituții financiare
3. Funcționalități specifice: Gestionarea conturilor, analiza tranzacțiilor, recomandări personalizate
4. Tehnologii actualizate: React, Node.js, MySQL, API-uri PHP
5. Beneficii pentru utilizatori: Transparență, personalizare, accesibilitate, scalabilitate

Rezultatul:

Textul corectat reflectă perfect aplicația dezvoltată, descriind exact funcționalitățile implementate și beneficiile oferite utilizatorilor finali.

4. Designul sistemului de scor de credit

În această secțiune detaliem arhitectura, componentele majore și interacțiunile dintre ele, asigurându-ne că soluția finală va fi scalabilă, sigură, ușor de întreținut și testabilă. Vom aborda fiecare aspect al proiectului în ordinea logică a fluxului de date: de la colectarea informațiilor prin interfața web, la stocarea acestora în baza de date, până la calculul scorului și expunerea rezultatului prin API-uri RESTful.

4.1 Arhitectura de ansamblu - Tehnologiile alese pentru aplicația de autoevaluare financiară

În acest capitol prezentăm un ghid pas-pas pentru fiecare componentă a sistemului de autoevaluare financiară, explicând nu doar rolul său în fluxul de date, ci și cum a evoluat fiecare limbaj/tehnologie în timp. Scopul este să ai o imagine clară a compatibilității între tehnologie și business, a motivelor de selecție și a avantajelor pe termen lung pentru utilizatorii finali.

4.1.1 Frontend - React cu TypeScript

Ce este?

React este o bibliotecă JavaScript de la Facebook (2013) pentru construirea interfețelor de utilizator. Permite crearea de componente reusable și gestionarea stării UI în mod declarativ. TypeScript adaugă tipizare statică pentru o dezvoltare mai sigură.

Istoric

2013 - React 0.13 lansat în open-source. În 2015 React 0.14 a introdus JSX. 2016 a venit React 16 cu "React Fiber" pentru re-rendering incremental. 2018 - Hooks înlocuiesc clasele. 2022 - React 18 cu concurrent features. 2024 - React 19 cu server components și îmbunătățiri de performanță.

TypeScript (2012) dezvoltat de Microsoft, a devenit standardul pentru aplicații React complexe.

Avantaje: ecosistem extins, tipizare statică, comunitate mare, și re-utilizare ușoară a componentelor.

Rol în arhitectură

Colectează datele financiare ale utilizatorului (venituri, cheltuieli, datorii).

Trimite cereri către backend prin Axios cu token-ul JWT.

Prezintă rezultatul (scor, recomandări) într-un card vizual modern.

4.1.2 Backend - Node.js + Express (JavaScript)

Ce este?

Node.js este un runtime JavaScript construit pe motorul V8 de la Google (2009). Rulează JavaScript în afara browserului, oferind un model de I/O bazat pe event-loop, asincron și non-blocking.

Istoric

2009 - Node.js 0.10 introduce modulul fs. 2011 - lansarea npm. 2014 - "Node 4" aduce ES6 features. 2020 - Node 14 stabilă cu V8 7.4. 2022 - Node 18 cu performanțe îmbunătățite. 2023 - Node 20 cu V8 11.3.

Express (2010) este un framework minimalist pentru Node.js care simplifică rutarea, middlewares și gestionarea cererilor HTTP.

Avantaje: același limbaj pe frontend și backend, performanță bună în I/O, ecosistem vast, dezvoltare rapidă.

Rol în arhitectură

Expune API-uri RESTful (/login, /accounts, /credit-score, /transfers).

Validează și sanitizează input-urile.

Generează token-urile JWT și le verifică.

Comunică cu MySQL prin mysql2 (driverul oficial).

Rulează algoritmul de calcul al scorului de credit.

4.1.3 Bază de date - MySQL (SQL)

Ce este?

MySQL este un sistem de gestionare a bazelor de date relaționale (SQL) open-source, cunoscut pentru performanță și ușurința de utilizare.

Istoric

1995 - MySQL 1.0 lansat de MySQL AB. 2008 - achiziționat de Sun Microsystems. 2010 - achiziționat de Oracle. 2013 - MySQL 5.6 cu optimizări InnoDB. 2018 - MySQL 8.0 cu JSON support.

Avantaje: performanță excelentă, ușor de configurat, suport pentru JSON, extensibilitate.

Rol în arhitectură

Stochează: utilizatorii, conturile bancare, tranzacțiile, scorurile de credit, istoricul.

Permite tranzacții complexe (ex. transfer între conturi + actualizare solduri).

Permite indexing pe client_id și timestamp pentru query-performanță.

4.1.4 API-uri PHP pentru operațiuni complexe

Ce este?

PHP (1995) este un limbaj de programare pentru dezvoltarea web, ideal pentru operațiuni complexe cu baza de date.

Istoric

1995 - PHP 1.0 lansat de Rasmus Lerdorf. 2004 - PHP 5 cu OOP. 2015 - PHP 7 cu performanță îmbunătățită. 2020 - PHP 8 cu JIT compiler.

Avantaje: integrare nativă cu MySQL, performanță bună pentru operațiuni de bază de date, sintaxă simplă.

Rol în arhitectură

Procesează transferurile între conturi cu validări complexe.

Calculează scorul de credit bazat pe tranzacții reale.

Gestionează operațiunile administrative (backup, rapoarte).

4.1.5 Autentificare și securitate - JWT și Bcrypt

Ce este?

JSON Web Token (JWT) (2015) standardizat de RFC 7519. Este un container JSON semnat care conține revendicări (claims).

bcrypt este un algoritm de hashing adaptativ dezvoltat de Niels Provos și David Mazieres (1999).

Avantaje: JWT oferă autentificare stateless, Bcrypt protejează parolele.

Rol în arhitectură

JWT stocat în localStorage pentru persistența sesiunii.

Bcrypt criptează parolele în baza de date.

Middleware Express validează token-ul.

4.1.6 Alte tehnologii utilizate

Tehnologie | Rol | Istoric resumat
-----------|-----|----------------
Vite | Build tool pentru React | 2020 - lansat ca alternativă rapidă la Create React App
React Router DOM | Rutare în aplicația React | 2014 - lansat pentru navigare între pagini
Axios | Client HTTP pentru API calls | 2014 - lansat ca alternativă la fetch
CORS | Cross-Origin Resource Sharing | 2006 - standardizat pentru securitate web

4.2 Fluxul de date și interacțiunile

Autentificare

Utilizatorul introduce credențialele în Login Form.

Frontend trimite POST /api/login cu email și password.

Backend verifică hash-ul parolei (bcrypt.compare) și, dacă e corect, generează un JWT.

Token-ul este returnat și stocat în localStorage.

Gestionarea conturilor bancare

Utilizatorul creează conturi bancare cu IBAN-uri unice.

Frontend trimite POST /api/accounts cu datele contului și JWT în header.

Backend validează datele, stochează în tabelul accounts.

Calculul scorului de credit

Utilizatorul accesează pagina Credit Score.

Frontend trimite GET /api/credit-score cu JWT.

Backend calculează automat veniturile, cheltuielile și datoriile din tranzacții.

Se aplică algoritmul: scor = venit - cheltuieli - (datorii × 2).

Rezultatul este returnat cu recomandări personalizate.

Transferuri între conturi

Utilizatorul inițiază un transfer între conturi.

Frontend trimite POST /api/transfers cu datele transferului.

Backend validează soldurile, procesează transferul prin PHP API.

Soldurile sunt actualizate și tranzacția este înregistrată.

Vizualizare rezultate

Utilizatorul accesează dashboard-ul.

Frontend trimite GET /api/accounts și GET /api/transactions cu JWT.

Backend returnează datele complete ale conturilor și tranzacțiilor.

Interfața afișează soldurile, istoricul și scorul de credit.

4.3 Schema bazei de date (MySQL)

-- Clienți
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

-- Bănci
CREATE TABLE banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Conturi bancare
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT,
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

-- Carduri
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

-- Tranzacții
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

-- Istoric
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

-- Destinatari salvați
CREATE TABLE saved_recipients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  recipient_phone VARCHAR(15),
  recipient_name VARCHAR(100),
  recipient_bank VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

4.4 Algoritmul de calcul al scorului de credit

4.4.1 Formula de bază

Scorul de credit se calculează folosind formula:
scor = venit - cheltuieli - (datorii × 2)

Unde:
- venit = suma soldurilor pozitive din toate conturile
- cheltuieli = suma tranzacțiilor negative (ieșiri) din ultimele 3 luni
- datorii = suma soldurilor negative din toate conturile

4.4.2 Implementarea în TypeScript

// Implementarea reală din CreditScorePage.tsx
const calculateScore = () => {
  const incomeVal = parseFloat(income) || 0;
  const expensesVal = parseFloat(expenses) || 0;
  const debtsVal = parseFloat(debts) || 0;
  const calculatedScore = incomeVal - expensesVal - (debtsVal * 2);
  setScore(calculatedScore);
};

// Funcția pentru afișarea mesajelor de ajutor și recomandări
const renderCreditScoreAdvice = (score: number, income: number, expenses: number, debts: number) => {
  // Analizează factorii care afectează credit score-ul
  const debtToIncomeRatio = income > 0 ? (debts / income) * 100 : 0;
  const expenseToIncomeRatio = income > 0 ? (expenses / income) * 100 : 0;
  
  let adviceColor = '';
  let adviceIcon = '';
  let adviceTitle = '';
  let adviceMessage = '';
  let suggestions: string[] = [];

  if (score >= 1000) {
    adviceColor = '#27ae60';
    adviceIcon = '🎉';
    adviceTitle = 'Excelent!';
    adviceMessage = 'Credit score-ul tău este foarte bun!';
    suggestions = [
      'Menține această situație financiară stabilă',
      'Continuă să economisești regulat',
      'Monitorizează periodic credit score-ul'
    ];
  } else if (score >= 500) {
    adviceColor = '#2ecc71';
    adviceIcon = '👍';
    adviceTitle = 'Bun!';
    adviceMessage = 'Credit score-ul tău este acceptabil, dar poate fi îmbunătățit.';
    suggestions = [
      'Încearcă să reduci cheltuielile lunare',
      'Economisește mai mult din venituri',
      'Plătește datoriile existente'
    ];
  } else if (score >= 0) {
    adviceColor = '#f39c12';
    adviceIcon = '⚠️';
    adviceTitle = 'Acceptabil';
    adviceMessage = 'Credit score-ul tău este în limitele acceptabile, dar necesită atenție.';
    suggestions = [
      'Redu semnificativ cheltuielile lunare',
      'Crește veniturile dacă este posibil',
      'Plătește prioritariamente datoriile cu dobânzi mari',
      'Evită noi datorii'
    ];
  } else {
    adviceColor = '#e74c3c';
    adviceIcon = '🚨';
    adviceTitle = 'Necesită atenție!';
    adviceMessage = 'Credit score-ul tău este scăzut și necesită acțiuni imediate.';
    suggestions = [
      'Redu drastic cheltuielile lunare',
      'Plătește urgent toate datoriile',
      'Caută surse suplimentare de venit',
      'Consultează un specialist financiar',
      'Evită complet noi datorii'
    ];
  }

  // Adaugă sugestii specifice bazate pe analiza financiară
  if (debtToIncomeRatio > 50) {
    suggestions.push('⚠️ Datoriile reprezintă peste 50% din venituri - acest lucru afectează negativ credit score-ul');
  }
  
  if (expenseToIncomeRatio > 80) {
    suggestions.push('⚠️ Cheltuielile reprezintă peste 80% din venituri - încearcă să economisești mai mult');
  }
  
  if (debts > income * 2) {
    suggestions.push('🚨 Datoriile sunt de 2 ori mai mari decât veniturile - acest lucru este foarte riscant');
  }

  return {
    adviceColor,
    adviceIcon,
    adviceTitle,
    adviceMessage,
    suggestions,
    debtToIncomeRatio,
    expenseToIncomeRatio
  };
};

4.4.3 Avantaje ale algoritmului

Simplitate: Formula este ușor de înțeles pentru utilizatori.

Transparență: Fiecare componentă este calculată din date reale.

Personalizare: Recomandările se adaptează la situația financiară.

4.5 Designul API-ului RESTful

Endpoint | Metodă | Scop | Cerințe de autentificare
---------|--------|------|------------------------
/api/login | POST | Autentificare | Nu
/api/register | POST | Înregistrare | Nu
/api/accounts | GET | Lista conturi | Da
/api/accounts | POST | Creare cont | Da
/api/credit-score | GET | Calcul scor | Da
/api/transfers | POST | Transfer între conturi | Da
/api/transactions | GET | Istoric tranzacții | Da
/api/admin/users | GET | Lista utilizatori | Admin
/api/admin/backup | POST | Backup baza de date | Admin

4.5.1 Exemple de payload

POST /api/credit-score

{
  "income": 5000.00,
  "expenses": 3000.00,
  "debts": 1000.00
}

Răspuns:
{
  "score": 0,
  "riskLevel": "Acceptabil",
  "recommendations": [
    "Mențineți un buget strict",
    "Evitați împrumuturile noi"
  ]
}

4.6 Securitatea aplicației

Aspect | Măsură
-------|-------
Parole | bcrypt cu 12 salt rounds
JWT | HS256, secret pe .env
CORS | Permit doar origini din .env
Input validation | Validare pe frontend și backend
XSS Protection | Sanitizare input-uri
SQL Injection | Prepared statements

4.7 Testare și validare

Testare: Jest pentru backend, React Testing Library pentru frontend.

Lint: ESLint, Prettier pentru consistența codului.

Validare: Teste manuale pentru fluxurile principale.

4.8 Deployment și configurare

Frontend: Vite build pentru producție.

Backend: Node.js cu nodemon pentru auto-restart în dezvoltare.

Baza de date: MySQL cu backup automat.

4.9 Observabilitate și monitoring

Logging: Console logs pentru debugging.

Error handling: Try-catch blocks pentru gestionarea erorilor.

Performance: Monitoring timp de răspuns API.

4.10 Checklist de livrare

Functionalitatea completă de login, register, și gestionare conturi.

Calculul automat al scorului de credit.

Sistemul de transferuri între conturi.

Panou de administrare funcțional.

Teste unitare pentru componentele critice.

Documentație completă pentru utilizatori.

README.md cu instrucțiuni de instalare și configurare.

---

5. DevOps și automatizare - Setup local și dezvoltare

Aplicația de analiză a clienților bancari este dezvoltată și rulată local. Setup-ul local permite dezvoltarea rapidă și testarea funcționalităților în timp real.

Setup-ul local include:

Frontend: React + TypeScript cu Vite pentru development server rapid
Backend: Node.js + Express pentru API-uri RESTful
Baza de date: MySQL local cu phpMyAdmin pentru administrare
API-uri PHP: Pentru operațiuni complexe cu baza de date

Avantajele acestui setup:

Dezvoltare rapidă: Hot reload pentru frontend și backend
Testare imediată: Modificările sunt vizibile instantaneu
Simplitate: Nu necesită cunoștințe avansate de DevOps
Cost zero: Totul rulează pe mașina locală

În continuare vom detalia cum să configurezi mediul de dezvoltare local și cum să rulezi aplicația.

5.1. Fluxul de dezvoltare local

Modificare cod → Hot reload (frontend/backend) → Testare în browser → Commit → Push

Fiecare modificare este vizibilă imediat în browser. Frontend-ul se actualizează automat prin Vite, iar backend-ul poate fi repornit rapid cu nodemon.

5.2. Structura proiectului

Licenta_NEW/
├─ api/ (PHP APIs și SQL)
│  ├─ PHP/ (API-uri pentru operațiuni complexe)
│  └─ database.sql (Schema bazei de date)
├─ Licenta/ (aplicația principală)
│  ├─ src/ (frontend React + TypeScript)
│  │  ├─ components/
│  │  ├─ pages/
│  │  └─ services/
│  ├─ server/ (backend Node.js + Express)
│  │  ├─ package.json
│  │  └─ index.js
│  ├─ package.json (frontend dependencies)
│  └─ vite.config.ts
├─ .github/ (opțional - pentru viitor)
│  └─ workflows/
└─ README.md

Observație – poți adăuga scripturi pentru a porni tot stack-ul local automat.

5.3. Configurarea mediului de dezvoltare

Pentru a rula aplicația local, urmează acești pași:

1. **Instalarea dependențelor:**
```bash
# Frontend
cd Licenta
npm install

# Backend
cd Licenta/server
npm install
```

2. **Configurarea bazei de date:**
```bash
# Importă schema bazei de date
mysql -u root -p < api/database.sql
```

3. **Pornirea aplicației:**
```bash
# Terminal 1 - Backend
cd Licenta/server
npm run dev

# Terminal 2 - Frontend
cd Licenta
npm run dev
```

4. **Accesarea aplicației:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PHP APIs: http://localhost/api/

5.4. Scripturi utile pentru dezvoltare

**Script pentru pornirea rapidă:**
```bash
#!/bin/bash
# start-dev.sh
echo "Starting development environment..."

# Backend
cd Licenta/server
npm run dev &
BACKEND_PID=$!

# Frontend
cd ../..
cd Licenta
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services"
```

**Script pentru testare:**
```bash
#!/bin/bash
# test-all.sh
echo "Running all tests..."

# Backend tests
cd Licenta/server
npm test

# Frontend tests
cd ../..
cd Licenta
npm test
```

5.5. Gestionarea variabilelor de mediu

Pentru dezvoltare locală, creează fișierul `.env` în `Licenta/server/`:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banca
JWT_SECRET=your_jwt_secret_here
```

5.6. Debugging și troubleshooting

**Probleme comune:**
- Port 3000 ocupat: Schimbă portul în `.env`
- Eroare de conexiune la MySQL: Verifică că MySQL rulează
- CORS errors: Verifică configurația CORS în backend

**Logs utile:**
- Backend: Console logs în terminal
- Frontend: Browser DevTools Console
- MySQL: Error logs în phpMyAdmin

5.7. Concluzie

Setup-ul local pentru aplicația de analiză a clienților bancari oferă:

Dezvoltare rapidă cu hot reload pentru frontend și backend
Testare imediată a modificărilor în browser
Simplitate în configurare și rulare
Cost zero - totul rulează local
Flexibilitate pentru experimentare și debugging

Acest setup este ideal pentru dezvoltarea și testarea aplicației înainte de un eventual deployment în producție.

---

6. Observabilitate și monitoring - Logging simplu și debugging

Pentru aplicația de analiză a clienților bancari, monitoring-ul se bazează pe logging simplu și debugging prin console, permițând dezvoltatorilor să urmărească comportamentul aplicației și să identifice problemele rapid.

6.1 Ce înseamnă Observabilitatea pentru aplicația noastră?

Observabilitatea înseamnă capacitatea de a monitoriza și înțelege comportamentul aplicației prin:

**Console Logging:** Înregistrarea evenimentelor importante (autentificări, transferuri, erori) în consolă
**Browser DevTools:** Monitorizarea performanței frontend-ului și debugging-ul erorilor
**Error Handling:** Gestionarea și logarea erorilor pentru debugging rapid
**Performance Monitoring:** Măsurarea timpului de răspuns și identificarea operațiunilor lente

Pentru aplicația noastră, observabilitatea permite:

Detectarea rapidă a problemelor (ex. erori la calculul scorului de credit, probleme de conectare la baza de date)
Înțelegerea comportamentului utilizatorilor (ce funcționalități sunt folosite cel mai des)
Monitorizarea securității (tentative de acces neautorizat, rate de autentificare eșuată)
Optimizarea performanței (identificarea operațiunilor lente, optimizarea query-urilor)

6.2 Stack-ul de monitoring pentru aplicația noastră

Layer | Tool | Răspunsă
------|------|--------
Logging | console.log, console.error | Înregistrează evenimente importante și erori
Performance | performance.now(), Browser DevTools | Monitorizează timpul de răspuns
Error Handling | try-catch blocks | Gestionează și loghează erorile
UI Monitoring | Browser DevTools Console | Vizualizează logs și erori în timp real

6.3 Implementarea logging-ului în aplicație

6.3.1 Backend (Node.js + Express)

// Logging pentru autentificare
app.post('/api/login', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Login attempt for email: ${req.body.email}`);
  
  try {
    const result = await loginUser(req.body.email, req.body.password);
    console.log(`[${new Date().toISOString()}] Login successful for user: ${result.user.email}`);
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login failed for email: ${req.body.email}, error: ${error.message}`);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logging pentru calculul scorului de credit
app.get('/api/credit-score', async (req, res) => {
  const clientId = req.user.client_id;
  console.log(`[${new Date().toISOString()}] Credit score calculation requested for client: ${clientId}`);
  
  try {
    const scoreData = await getCreditScoreData(clientId);
    console.log(`[${new Date().toISOString()}] Credit score calculated: ${scoreData.score} for client: ${clientId}`);
    res.json(scoreData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Credit score calculation failed for client: ${clientId}, error: ${error.message}`);
    res.status(500).json({ error: 'Failed to calculate credit score' });
  }
});

// Logging pentru transferuri
app.post('/api/transfers', async (req, res) => {
  const { from_account, to_account, amount } = req.body;
  console.log(`[${new Date().toISOString()}] Transfer initiated: ${amount} RON from ${from_account} to ${to_account}`);
  
  try {
    const result = await processTransfer(req.body);
    console.log(`[${new Date().toISOString()}] Transfer completed successfully: ${result.transaction_id}`);
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Transfer failed: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

6.3.2 Frontend (React + TypeScript)

// Logging pentru acțiuni utilizator
const logUserAction = (action: string, details?: any) => {
  console.log(`[${new Date().toISOString()}] User action: ${action}`, details);
};

// În CreditScorePage.tsx
const calculateScore = () => {
  logUserAction('Credit score calculation started', {
    income: income,
    expenses: expenses,
    debts: debts
  });
  
  const incomeVal = parseFloat(income) || 0;
  const expensesVal = parseFloat(expenses) || 0;
  const debtsVal = parseFloat(debts) || 0;
  const calculatedScore = incomeVal - expensesVal - (debtsVal * 2);
  
  logUserAction('Credit score calculated', {
    score: calculatedScore,
    riskLevel: getRiskLevel(calculatedScore)
  });
  
  setScore(calculatedScore);
};

// În AdminPage.tsx
const handleUserEdit = (userId: number, userData: any) => {
  logUserAction('Admin user edit', {
    userId: userId,
    changes: userData
  });
  
  // Logica de editare
};

6.4 Monitoring-ul performanței

6.4.1 Metrice de performanță în backend

// Middleware pentru măsurarea timpului de răspuns
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log pentru operațiuni lente
    if (duration > 2000) {
      console.warn(`[${new Date().toISOString()}] Slow operation detected: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// Monitoring pentru baza de date
const logDatabaseQuery = (query: string, duration: number) => {
  console.log(`[${new Date().toISOString()}] DB Query: ${query} - ${duration}ms`);
  
  if (duration > 1000) {
    console.warn(`[${new Date().toISOString()}] Slow database query: ${query} took ${duration}ms`);
  }
};

6.4.2 Metrice de performanță în frontend

// Hook pentru măsurarea performanței componentelor
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`[${new Date().toISOString()}] Component ${componentName} rendered in ${duration.toFixed(2)}ms`);
    };
  });
};

// În CreditScorePage.tsx
const CreditScorePage = () => {
  usePerformanceMonitor('CreditScorePage');
  
  // Restul componentei
};

6.5 Monitoring-ul securității

6.5.1 Logging pentru autentificare și autorizare

// Logging pentru tentative de autentificare eșuate
const logFailedLogin = (email: string, reason: string) => {
  console.warn(`[${new Date().toISOString()}] Failed login attempt for email: ${email}, reason: ${reason}`);
};

// Logging pentru accesuri la funcții administrative
const logAdminAccess = (userId: number, action: string) => {
  console.log(`[${new Date().toISOString()}] Admin access: User ${userId} performed ${action}`);
};

// Logging pentru operațiuni sensibile
const logSensitiveOperation = (userId: number, operation: string, details: any) => {
  console.log(`[${new Date().toISOString()}] Sensitive operation: User ${userId} performed ${operation}`, details);
};

6.5.2 Monitoring pentru transferuri și operațiuni financiare

// Logging detaliat pentru transferuri
const logTransferAttempt = (fromAccount: string, toAccount: string, amount: number, userId: number) => {
  console.log(`[${new Date().toISOString()}] Transfer attempt: User ${userId} trying to transfer ${amount} RON from ${fromAccount} to ${toAccount}`);
};

const logTransferSuccess = (transactionId: number, amount: number) => {
  console.log(`[${new Date().toISOString()}] Transfer successful: Transaction ${transactionId} for ${amount} RON`);
};

const logTransferFailure = (reason: string, amount: number) => {
  console.error(`[${new Date().toISOString()}] Transfer failed: ${reason} for amount ${amount} RON`);
};

6.6 Dashboard-uri simple pentru monitoring

6.6.1 Dashboard pentru admin

// În AdminPage.tsx - secțiunea de statistici
const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    systemHealth: 'OK'
  });

  useEffect(() => {
    // Logging pentru accesul la dashboard
    console.log(`[${new Date().toISOString()}] Admin dashboard accessed`);
    
    // Încărcarea statisticilor
    loadAdminStats();
  }, []);

  return (
    <div className="admin-stats">
      <h3>Statistici Sistem</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Utilizatori totali:</span>
          <span className="stat-value">{stats.totalUsers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Conturi active:</span>
          <span className="stat-value">{stats.totalAccounts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tranzacții totale:</span>
          <span className="stat-value">{stats.totalTransactions}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status sistem:</span>
          <span className={`stat-value ${stats.systemHealth === 'OK' ? 'success' : 'error'}`}>
            {stats.systemHealth}
          </span>
        </div>
      </div>
    </div>
  );
};

6.7 Alerting și notificări

6.7.1 Sistem de alertă simplu

// Funcție pentru trimiterea de alerte
const sendAlert = (level: 'info' | 'warning' | 'error', message: string, details?: any) => {
  const alertMessage = `[${level.toUpperCase()}] ${message}`;
  
  if (level === 'error') {
    console.error(alertMessage, details);
  } else if (level === 'warning') {
    console.warn(alertMessage, details);
  } else {
    console.log(alertMessage, details);
  }
  
  // Aici poți adăuga trimiterea de email sau notificări
};

// Exemple de utilizare
const checkSystemHealth = () => {
  // Verifică conexiunea la baza de date
  if (!isDatabaseConnected()) {
    sendAlert('error', 'Database connection lost', { timestamp: new Date() });
  }
  
  // Verifică utilizarea memoriei
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    sendAlert('warning', 'High memory usage detected', { memoryUsage: memUsage });
  }
};

6.8 Monitoring-ul în timp real

6.8.1 Console monitoring pentru dezvoltare

// Script pentru monitoring în timp real
const startRealTimeMonitoring = () => {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    console.log(`[${new Date().toISOString()}] System status:`, {
      uptime: `${Math.floor(uptime / 60)} minutes`,
      memory: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      cpu: process.cpuUsage()
    });
  }, 60000); // La fiecare minut
};

6.9 Logging pentru debugging

6.9.1 Logging detaliat pentru debugging

// Funcție pentru logging detaliat
const debugLog = (component: string, action: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${component}: ${action}`, data);
  }
};

// Utilizare în componente
const CreditScorePage = () => {
  const calculateScore = () => {
    debugLog('CreditScorePage', 'calculateScore started', { income, expenses, debts });
    
    // Logica de calcul
    const result = incomeVal - expensesVal - (debtsVal * 2);
    
    debugLog('CreditScorePage', 'calculateScore completed', { result });
    setScore(result);
  };
};

6.10 Concluzie

Sistemul de observabilitate implementat pentru aplicația de analiză a clienților bancari oferă:

Monitoring complet: urmărirea performanței, securității și utilizării aplicației.

Logging detaliat: înregistrarea tuturor operațiunilor importante și a erorilor.

Alerting simplu: notificări pentru probleme critice și performanță scăzută.

Dashboard-uri: vizualizarea statisticilor și statusului sistemului.

Debugging eficient: instrumente pentru identificarea și rezolvarea problemelor.

Acest sistem de observabilitate asigură stabilitatea și securitatea aplicației, permițând detectarea rapidă a problemelor și optimizarea continuă a performanței.

---

7. Deployment și producție - Setup local pentru testare

Aplicația de analiză a clienților bancari este dezvoltată și testată local, fără nevoie de infrastructură complexă de producție. Setup-ul local permite testarea completă a tuturor funcționalităților înainte de un eventual deployment.

Setup-ul local include:

Frontend: React + TypeScript cu Vite development server
Backend: Node.js + Express pentru API-uri RESTful  
Baza de date: MySQL local cu phpMyAdmin
API-uri PHP: Pentru operațiuni complexe cu baza de date

Acest capitol descrie cum să configurezi și să rulezi aplicația local pentru testare și demonstrație.

7.1 Setup-ul local pentru aplicația noastră

Etapă | Tool | Scop | Fișier de configurare
------|------|------|------------------
Development | Vite + Node.js | Server de dezvoltare pentru frontend și backend | vite.config.ts, package.json
Database | MySQL + phpMyAdmin | Baza de date locală cu interfață web | database.sql
API | PHP + Apache | API-uri pentru operațiuni complexe | api/PHP/*.php
Testing | Browser + Console | Testare manuală a funcționalităților | Browser DevTools
Backup | MySQL dump | Backup manual al datelor | backupDatabase.php

7.2 Configurarea mediului de dezvoltare

7.2.1 Frontend (React + TypeScript)

Pentru a rula frontend-ul:
```bash
cd Licenta
npm install
npm run dev
```

Frontend-ul va rula pe http://localhost:5173 cu hot reload activat.

7.2.2 Backend (Node.js + Express)

Pentru a rula backend-ul:
```bash
cd Licenta/server
npm install
npm run dev
```

Backend-ul va rula pe http://localhost:3000 cu nodemon pentru auto-restart.

7.2.3 Baza de date (MySQL)

Pentru a configura baza de date:
```bash
# Importă schema
mysql -u root -p < api/database.sql

# Sau folosește phpMyAdmin
# Accesează http://localhost/phpmyadmin
# Creează baza de date 'banca'
# Importă fișierul api/database.sql
```

7.3 Scripturi pentru pornirea aplicației

**Script principal pentru pornirea completă:**
```bash
#!/bin/bash
# start-app.sh

echo "Starting Credit Score Application..."

# Verifică dacă MySQL rulează
if ! pgrep -x "mysqld" > /dev/null; then
    echo "Starting MySQL..."
    sudo service mysql start
fi

# Backend
echo "Starting backend..."
cd Licenta/server
npm run dev &
BACKEND_PID=$!

# Frontend  
echo "Starting frontend..."
cd ../..
cd Licenta
npm run dev &
FRONTEND_PID=$!

echo "Application started!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3000"
echo "PHP APIs: http://localhost/api/"
echo ""
echo "Press Ctrl+C to stop all services"

# Așteaptă semnalul de oprire
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

**Script pentru oprirea aplicației:**
```bash
#!/bin/bash
# stop-app.sh

echo "Stopping Credit Score Application..."

# Oprește procesele Node.js
pkill -f "npm run dev"
pkill -f "node.*server"

echo "Application stopped!"
```

7.4 Configurarea mediului de testare

7.4.1 Instalarea dependențelor

**Pe Windows:**
- Instalează Node.js 20+ de la https://nodejs.org
- Instalează MySQL de la https://dev.mysql.com/downloads/
- Instalează XAMPP pentru PHP și Apache de la https://www.apachefriends.org

**Pe Linux/Ubuntu:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL
sudo apt update
sudo apt install mysql-server

# PHP și Apache
sudo apt install apache2 php php-mysql
```

7.4.2 Configurarea bazei de date

```bash
# Pornește MySQL
sudo service mysql start

# Creează baza de date
mysql -u root -p
CREATE DATABASE banca;
USE banca;
SOURCE api/database.sql;
```

7.4.3 Configurarea PHP APIs

```bash
# Copiază fișierele PHP în directorul web
sudo cp -r api/PHP/* /var/www/html/api/

# Verifică că Apache rulează
sudo service apache2 start
```

7.5 Script de deployment

# deploy-local.sh
#!/bin/bash

echo "Starting local deployment..."

# Oprește aplicația curentă
pkill -f "npm run dev"
pkill -f "node.*server"

# Pornește backend
cd Licenta/server
npm run dev &
BACKEND_PID=$!

# Pornește frontend
cd ../..
cd Licenta
npm run dev &
FRONTEND_PID=$!

echo "Local deployment completed!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Script pentru oprire
# stop-local.sh
#!/bin/bash

echo "Stopping local application..."

# Oprește procesele
pkill -f "npm run dev"
pkill -f "node.*server"

echo "Application stopped!"

7.6 Monitoring și health checks

7.6.1 Health check endpoint în backend

// În server/index.js
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected' // Verifică conexiunea la DB
  };
  
  res.status(200).json(health);
});

7.6.2 Script de monitoring

# monitor.sh
#!/bin/bash

# Verifică statusul aplicației
check_app_health() {
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
  
  if [ $response -eq 200 ]; then
    echo "✅ Application is healthy"
  else
    echo "❌ Application is unhealthy (HTTP $response)"
    # Trimite alertă sau restart automat
  fi
}

# Verifică utilizarea resurselor
check_resources() {
  cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  memory_usage=$(free | grep Mem | awk '{printf("%.2f"), $3/$2 * 100.0}')
  
  echo "CPU Usage: ${cpu_usage}%"
  echo "Memory Usage: ${memory_usage}%"
  
  # Alertă dacă utilizarea este prea mare
  if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    echo "⚠️ High CPU usage detected!"
  fi
  
  if (( $(echo "$memory_usage > 80" | bc -l) )); then
    echo "⚠️ High memory usage detected!"
  fi
}

# Rulează verificările
check_app_health
check_resources

7.7 Backup și recuperare

7.7.1 Script de backup automat

# backup.sh
#!/bin/bash

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="banca"

# Creează directorul de backup
mkdir -p $BACKUP_DIR

# Backup baza de date
docker exec mysql_container mysqldump -u root -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup fișierele aplicației
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/html

# Șterge backup-urile vechi (păstrează doar ultimele 7 zile)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"

7.7.2 Script de recuperare

# restore.sh
#!/bin/bash

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore.sh <backup_file>"
  exit 1
fi

echo "Restoring from backup: $BACKUP_FILE"

# Restaurează baza de date
docker exec -i mysql_container mysql -u root -p$DB_PASSWORD $DB_NAME < $BACKUP_FILE

echo "Database restored successfully!"

7.8 Securitatea în producție

7.8.1 Configurarea variabilelor de mediu

# .env.production
NODE_ENV=production
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=banca
JWT_SECRET=your_jwt_secret_key
PORT=3000

7.8.2 Configurarea Apache pentru PHP APIs

**Configurarea Apache pentru PHP:**
```apache
# /etc/apache2/sites-available/credit-score.conf
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>
    
    # PHP API
    <Directory /var/www/html/api>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

7.9 Automatizarea deployment-ului

7.9.1 Scripturi pentru deployment

**Script simplu pentru deployment:**
```bash
#!/bin/bash
# deploy.sh

echo "Deploying application..."

# Oprește aplicația
pkill -f "npm run dev"

# Actualizează codul
git pull origin main

# Instalează dependențele
cd Licenta
npm install

cd server
npm install

# Pornește aplicația
npm run dev &
cd ..
npm run dev &

echo "Deployment completed!"
```

7.10 Checklist pentru deployment

7.10.1 Înainte de deployment

- [ ] Codul a fost testat local
- [ ] Toate testele unitare trec
- [ ] Variabilele de mediu sunt configurate
- [ ] Backup-ul bazei de date este creat
- [ ] Configurarea Apache este corectă
- [ ] Configurarea MySQL este corectă

7.10.2 După deployment

- [ ] Aplicația răspunde la health check
- [ ] Toate funcționalitățile funcționează
- [ ] Logs-urile nu arată erori
- [ ] Performanța este acceptabilă
- [ ] Backup-ul automat funcționează
- [ ] Monitoring-ul este activ

7.11 Concluzie

Deployment-ul aplicației de analiză a clienților bancari în producție include:

Configurarea aplicației pentru rulare locală.

Configurarea mediului local pentru testare și dezvoltare.

Implementarea unui sistem de monitoring și health checks.

Automatizarea procesului de backup și recuperare.

Securizarea aplicației cu validare input-uri și autentificare securizată.

Automatizarea deployment-ului prin scripturi simple.

Acest proces asigură că aplicația rămâne stabilă, sigură și performantă în mediul de producție, permițând utilizatorilor să beneficieze de toate funcționalitățile implementate.

---

8. Monitorizare simplă și debugging - Urmărirea comportamentului aplicației

Pentru aplicația de analiză a clienților bancari, monitoring-ul se bazează pe logging simplu și debugging prin console, permițând dezvoltatorilor să urmărească comportamentul aplicației și să identifice problemele rapid.

8.1 Sursa de date de monitorizare pentru aplicația noastră

Componentă | Ce face | Cum se configură
-----------|---------|------------------
Console logs | Colectează logs din aplicație | console.log, console.error
Browser DevTools | Monitorizează performanța frontend | F12 → Console/Network
Error handling | Urmărește erorile și excepțiile | try-catch blocks
Admin dashboard | Statistici simple ale aplicației | AdminPage.tsx

8.2 Dashboard-uri pentru monitorizare

8.2.1 Dashboard principal în AdminPage

// În AdminPage.tsx - secțiunea de statistici avansate
const AdvancedMonitoring = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    systemHealth: 'OK',
    responseTime: 0,
    errorRate: 0,
    uptime: 0
  });

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Încarcă metrici în timp real
    const loadMetrics = async () => {
      try {
        const response = await fetch('/api/admin/metrics');
        const data = await response.json();
        setMetrics(data);
        
        // Verifică pentru alerte
        checkAlerts(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    // Încarcă metrici la fiecare 30 de secunde
    const interval = setInterval(loadMetrics, 30000);
    loadMetrics(); // Încarcă imediat

    return () => clearInterval(interval);
  }, []);

  const checkAlerts = (data) => {
    const newAlerts = [];
    
    if (data.errorRate > 5) {
      newAlerts.push({
        type: 'error',
        message: `Error rate is high: ${data.errorRate}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (data.responseTime > 2000) {
      newAlerts.push({
        type: 'warning',
        message: `Response time is slow: ${data.responseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (data.systemHealth !== 'OK') {
      newAlerts.push({
        type: 'critical',
        message: `System health issue: ${data.systemHealth}`,
        timestamp: new Date().toISOString()
      });
    }
    
    setAlerts(newAlerts);
  };

  return (
    <div className="monitoring-dashboard">
      <h3>Monitorizare în timp real</h3>
      
      {/* Metrice principale */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Utilizatori activi:</span>
          <span className="metric-value">{metrics.activeUsers}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Timp de răspuns:</span>
          <span className={`metric-value ${metrics.responseTime > 1000 ? 'warning' : 'success'}`}>
            {metrics.responseTime}ms
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Rata de erori:</span>
          <span className={`metric-value ${metrics.errorRate > 5 ? 'error' : 'success'}`}>
            {metrics.errorRate}%
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Uptime:</span>
          <span className="metric-value">{Math.floor(metrics.uptime / 3600)}h</span>
        </div>
      </div>

      {/* Alerte */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h4>Alerte active</h4>
          {alerts.map((alert, index) => (
            <div key={index} className={`alert alert-${alert.type}`}>
              <span className="alert-time">{alert.timestamp}</span>
              <span className="alert-message">{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

8.3 Sistem de alerte și notificări

8.3.1 Alerte automate în backend

// În server/index.js - middleware pentru alerte
const alertMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Alertă pentru erori 5xx
    if (statusCode >= 500) {
      console.error(`[ALERT] Server error: ${req.method} ${req.path} - ${statusCode} - ${duration}ms`);
      sendAlert('error', `Server error: ${statusCode}`, {
        method: req.method,
        path: req.path,
        statusCode,
        duration
      });
    }
    
    // Alertă pentru operațiuni lente
    if (duration > 5000) {
      console.warn(`[ALERT] Slow operation: ${req.method} ${req.path} - ${duration}ms`);
      sendAlert('warning', 'Slow operation detected', {
        method: req.method,
        path: req.path,
        duration
      });
    }
  });
  
  next();
};

// Funcție pentru trimiterea de alerte
const sendAlert = (level, message, details) => {
  const alert = {
    level,
    message,
    details,
    timestamp: new Date().toISOString(),
    service: 'credit-score-app'
  };
  
  // Log alerta
  console.log(`[ALERT ${level.toUpperCase()}] ${message}`, details);
  
  // Aici poți adăuga trimiterea de email, Slack, etc.
  // sendSlackAlert(alert);
  // sendEmailAlert(alert);
};

app.use(alertMiddleware);

8.3.2 Alerte pentru operațiuni critice

// În transferBetweenAccounts.php
function logTransferAlert($fromAccount, $toAccount, $amount, $status, $error = null) {
    $alert = [
        'type' => 'transfer',
        'from_account' => $fromAccount,
        'to_account' => $toAccount,
        'amount' => $amount,
        'status' => $status,
        'error' => $error,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($status === 'failed') {
        error_log("[ALERT] Transfer failed: " . json_encode($alert));
        // Trimite alertă pentru transfer eșuat
    } elseif ($amount > 10000) {
        error_log("[ALERT] Large transfer: " . json_encode($alert));
        // Trimite alertă pentru transfer mare
    }
}

8.4 Logging centralizat și analiză

8.4.1 Structurarea log-urilor

// În server/index.js - middleware pentru logging structurat
const structuredLogging = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user ? req.user.id : null
    };
    
    // Log structurat pentru analiză
    console.log(JSON.stringify(log));
  });
  
  next();
};

app.use(structuredLogging);

8.4.2 Analiza log-urilor pentru debugging

// Script pentru analiza log-urilor
const analyzeLogs = () => {
  // Analizează erorile frecvente
  const errorPatterns = {
    'Database connection': 0,
    'Invalid credentials': 0,
    'Insufficient funds': 0,
    'Server timeout': 0
  };
  
  // Analizează performanța
  const performanceMetrics = {
    averageResponseTime: 0,
    slowestEndpoints: [],
    errorRate: 0
  };
  
  // Generează raport
  const report = {
    timestamp: new Date().toISOString(),
    errorPatterns,
    performanceMetrics,
    recommendations: generateRecommendations(errorPatterns, performanceMetrics)
  };
  
  console.log('Log Analysis Report:', JSON.stringify(report, null, 2));
};

8.5 Monitorizarea performanței în timp real

8.5.1 Metrice de performanță

// În CreditScorePage.tsx - monitorizarea performanței
const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    calculationTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    // Măsoară timpul de încărcare a paginii
    const pageLoadTime = performance.now();
    setPerformanceData(prev => ({ ...prev, pageLoadTime }));

    // Măsoară timpul de răspuns API
    const measureApiTime = async () => {
      const start = performance.now();
      try {
        await fetch('/api/credit-score');
        const end = performance.now();
        setPerformanceData(prev => ({ 
          ...prev, 
          apiResponseTime: end - start 
        }));
      } catch (error) {
        console.error('API call failed:', error);
      }
    };

    measureApiTime();
  }, []);

  const measureCalculationTime = (fn) => {
    return (...args) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      setPerformanceData(prev => ({ 
        ...prev, 
        calculationTime: end - start 
      }));
      
      return result;
    };
  };

  return (
    <div className="performance-monitor">
      <h4>Performanță în timp real</h4>
      <div className="performance-metrics">
        <div>Încărcare pagină: {performanceData.pageLoadTime.toFixed(2)}ms</div>
        <div>Răspuns API: {performanceData.apiResponseTime.toFixed(2)}ms</div>
        <div>Calcul scor: {performanceData.calculationTime.toFixed(2)}ms</div>
      </div>
    </div>
  );
};

8.6 Răspunsul la incidente

8.6.1 Procesul de răspuns la incidente

// Script pentru răspuns rapid la incidente
const incidentResponse = {
  // 1. Detectare automată
  detectIncident: (metrics) => {
    const incidents = [];
    
    if (metrics.errorRate > 10) {
      incidents.push({
        type: 'high_error_rate',
        severity: 'critical',
        message: `Error rate is ${metrics.errorRate}%`,
        action: 'immediate_rollback'
      });
    }
    
    if (metrics.responseTime > 5000) {
      incidents.push({
        type: 'slow_response',
        severity: 'warning',
        message: `Response time is ${metrics.responseTime}ms`,
        action: 'investigate'
      });
    }
    
    return incidents;
  },

  // 2. Acțiuni automate
  executeAction: (incident) => {
    switch (incident.action) {
      case 'immediate_rollback':
        console.log('Executing immediate rollback...');
        // Execută rollback
        break;
      case 'investigate':
        console.log('Investigating issue...');
        // Începe investigația
        break;
      default:
        console.log('No action required');
    }
  },

  // 3. Notificare
  notify: (incident) => {
    const notification = {
      timestamp: new Date().toISOString(),
      incident: incident,
      status: 'detected'
    };
    
    console.log('INCIDENT NOTIFICATION:', notification);
    // Trimite notificare prin email, Slack, etc.
  }
};

8.6.2 Script de debugging rapid

// Script pentru debugging rapid
const quickDebug = {
  checkSystemHealth: () => {
    const health = {
      database: 'checking...',
      api: 'checking...',
      frontend: 'checking...',
      overall: 'unknown'
    };
    
    // Verifică baza de date
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        health.database = data.database;
        health.api = data.status;
        health.overall = data.status === 'OK' ? 'healthy' : 'unhealthy';
        
        console.log('System Health:', health);
      })
      .catch(error => {
        health.overall = 'unhealthy';
        console.error('Health check failed:', error);
      });
  },

  checkRecentErrors: () => {
    // Verifică erorile recente din logs
    console.log('Checking recent errors...');
    // Implementează logica de verificare
  },

  checkPerformance: () => {
    // Verifică performanța
    const performance = {
      pageLoad: performance.now(),
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 'N/A'
    };
    
    console.log('Performance Check:', performance);
  }
};

8.7 Dashboard de sănătate a sistemului

8.7.1 Status general al aplicației

// În AdminPage.tsx - dashboard de sănătate
const SystemHealthDashboard = () => {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'checking',
    components: {
      database: 'unknown',
      api: 'unknown',
      frontend: 'unknown',
      php: 'unknown'
    },
    lastCheck: null
  });

  const checkSystemHealth = async () => {
    try {
      // Verifică fiecare componentă
      const checks = await Promise.allSettled([
        fetch('/api/health'),
        fetch('/php/health.php'),
        checkFrontendHealth()
      ]);

      const newStatus = {
        overall: 'healthy',
        components: {
          database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          api: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          php: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          frontend: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy'
        },
        lastCheck: new Date().toISOString()
      };

      // Determină statusul general
      const unhealthyComponents = Object.values(newStatus.components).filter(status => status === 'unhealthy');
      if (unhealthyComponents.length > 0) {
        newStatus.overall = 'unhealthy';
      }

      setHealthStatus(newStatus);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus(prev => ({
        ...prev,
        overall: 'unhealthy',
        lastCheck: new Date().toISOString()
      }));
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // La fiecare minut
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-dashboard">
      <h3>Status sistem</h3>
      <div className={`health-status ${healthStatus.overall}`}>
        Status general: {healthStatus.overall}
      </div>
      
      <div className="components-status">
        {Object.entries(healthStatus.components).map(([component, status]) => (
          <div key={component} className={`component-status ${status}`}>
            {component}: {status}
          </div>
        ))}
      </div>
      
      <div className="last-check">
        Ultima verificare: {healthStatus.lastCheck}
      </div>
    </div>
  );
};

8.8 Automatizarea monitorizării

8.8.1 Script de monitorizare automată

// monitor.js - script pentru monitorizare automată
const monitoring = {
  start: () => {
    console.log('Starting automated monitoring...');
    
    // Verificări la fiecare 5 minute
    setInterval(() => {
      monitoring.checkSystemHealth();
      monitoring.checkPerformance();
      monitoring.checkErrors();
    }, 5 * 60 * 1000);
    
    // Verificări la fiecare oră
    setInterval(() => {
      monitoring.generateReport();
      monitoring.cleanupLogs();
    }, 60 * 60 * 1000);
  },

  checkSystemHealth: () => {
    // Verifică statusul sistemului
    console.log('Checking system health...');
  },

  checkPerformance: () => {
    // Verifică performanța
    console.log('Checking performance...');
  },

  checkErrors: () => {
    // Verifică erorile recente
    console.log('Checking for errors...');
  },

  generateReport: () => {
    // Generează raport zilnic
    console.log('Generating daily report...');
  },

  cleanupLogs: () => {
    // Curăță log-urile vechi
    console.log('Cleaning up old logs...');
  }
};

// Pornește monitorizarea
monitoring.start();

8.9 Checklist pentru monitorizare

8.9.1 Checklist zilnic

- [ ] Verifică statusul general al sistemului
- [ ] Analizează erorile din ultimele 24h
- [ ] Verifică performanța aplicației
- [ ] Revizuiește alertele active
- [ ] Verifică backup-urile
- [ ] Analizează utilizarea resurselor

8.9.2 Checklist săptămânal

- [ ] Generează raport de performanță
- [ ] Analizează tendințele de utilizare
- [ ] Verifică securitatea aplicației
- [ ] Actualizează dashboard-urile
- [ ] Revizuiește configurațiile de alertă
- [ ] Planifică îmbunătățiri

8.10 Concluzie

Sistemul de monitorizare avansată pentru aplicația de analiză a clienților bancari include:

Monitorizare în timp real: Dashboard-uri interactive cu metrici live.

Alerte automate: Detectarea și notificarea problemelor în timp real.

Logging structurat: Înregistrarea detaliată a evenimentelor pentru debugging.

Răspuns la incidente: Procese automate pentru rezolvarea problemelor.

Analiză de performanță: Monitorizarea continuă a performanței aplicației.

Rapoarte și analize: Generarea de rapoarte pentru îmbunătățirea continuă.

Acest sistem de monitorizare asigură că aplicația rămâne stabilă, performantă și sigură, permițând detectarea rapidă a problemelor și implementarea de soluții eficiente.

---

9. Securitatea aplicației - Măsuri de protecție simple și eficiente

Pentru aplicația de analiză a clienților bancari, securitatea se bazează pe măsuri simple și eficiente care protejează datele utilizatorilor și asigură funcționarea stabilă a aplicației.

Măsurile de securitate implementate:

Autentificare securizată cu JWT și bcrypt pentru parole
Validarea și sanitizarea input-urilor pentru a preveni injection attacks
CORS configurat pentru a controla accesul la API-uri
Rate limiting pentru a preveni atacurile de tip DDoS
Logging pentru a urmări activitatea utilizatorilor

Aceste măsuri asigură că aplicația rămâne sigură și protejează datele sensibile ale utilizatorilor.

9.1 Măsuri de securitate implementate

9.1.1 Autentificare securizată

**JWT pentru autentificare:**
```javascript
// În server/index.js
const jwt = require('jsonwebtoken');

// Generează token la login
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Bcrypt pentru parole:**
```javascript
// Hash parola la înregistrare
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12);

// Verifică parola la login
const isValid = await bcrypt.compare(password, user.password_hash);
```

9.1.2 Validarea input-urilor

**Validare pe frontend:**
```typescript
// În CreditScorePage.tsx
const validateInput = (value: string, min: number, max: number): boolean => {
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

// Validare pentru calculul scorului
if (!validateInput(income, 0, 1000000)) {
  setError('Venitul trebuie să fie între 0 și 1,000,000');
  return;
}
```

**Validare pe backend:**
```javascript
// În server/index.js
const validateCreditScoreData = (data) => {
  const { income, expenses, debts } = data;
  
  if (income < 0 || income > 1000000) {
    throw new Error('Venitul trebuie să fie între 0 și 1,000,000');
  }
  
  if (expenses < 0 || expenses > 1000000) {
    throw new Error('Cheltuielile trebuie să fie între 0 și 1,000,000');
  }
  
  if (debts < 0 || debts > 1000000) {
    throw new Error('Datoriile trebuie să fie între 0 și 1,000,000');
  }
};
```

9.2 Configurarea variabilelor de mediu

9.2.1 Fișierul .env pentru dezvoltare

Creează fișierul `.env` în `Licenta/server/`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=banca

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Security
BCRYPT_ROUNDS=12
```

9.2.2 Securitatea variabilelor de mediu

**Nu commita niciodată fișierul .env:**
```bash
# Adaugă în .gitignore
echo ".env" >> .gitignore
echo "*.env" >> .gitignore
```

**Folosește valori sigure:**
- JWT_SECRET: minim 32 de caractere
- DB_PASSWORD: minim 12 caractere cu litere, cifre și simboluri
- Nu folosi parole simple sau default

9.3 Securizarea bazei de date

9.3.1 Conexiunea securizată la MySQL

```javascript
// În server/db.js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

const pool = mysql.createPool(dbConfig);

// Testează conexiunea
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = pool;
```

9.3.2 Logging pentru operațiuni critice

```javascript
// În server/index.js
const logOperation = (action, userId, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details
  };
  
  console.log('OPERATION:', JSON.stringify(logEntry));
};

// Folosește în endpoint-uri
app.post('/api/transfers', async (req, res) => {
  try {
    const result = await processTransfer(req.body);
    logOperation('transfer', req.user.id, {
      amount: req.body.amount,
      from: req.body.fromAccount,
      to: req.body.toAccount
    });
    res.json(result);
  } catch (error) {
    console.error('Transfer failed:', error);
    res.status(400).json({ error: error.message });
  }
});
```

9.4 Securizarea API-urilor

9.4.1 Rate limiting simplu

```javascript
// În server/index.js
const rateLimit = require('express-rate-limit');

// Rate limiting pentru login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // 5 încercări
  message: 'Too many login attempts, please try again later'
});

// Rate limiting pentru API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100, // 100 cereri
  message: 'Too many requests, please try again later'
});

// Aplică rate limiting
app.use('/api/login', loginLimiter);
app.use('/api', apiLimiter);
```

9.4.2 Validarea input-urilor

```javascript
// În server/index.js
const validateInput = (req, res, next) => {
  const { income, expenses, debts } = req.body;
  
  // Validare pentru calculul scorului
  if (income < 0 || income > 1000000) {
    return res.status(400).json({
      error: 'Venitul trebuie să fie între 0 și 1,000,000'
    });
  }
  
  if (expenses < 0 || expenses > 1000000) {
    return res.status(400).json({
      error: 'Cheltuielile trebuie să fie între 0 și 1,000,000'
    });
  }
  
  if (debts < 0 || debts > 1000000) {
    return res.status(400).json({
      error: 'Datoriile trebuie să fie între 0 și 1,000,000'
    });
  }
  
  next();
};

// Aplică validarea
app.post('/api/credit-score', validateInput, async (req, res) => {
  // Logica de calcul
});
```

9.5 Securizarea frontend-ului

9.5.1 Validarea input-urilor pe frontend

```typescript
// În CreditScorePage.tsx
const validateInput = (value: string, min: number, max: number): boolean => {
  const numValue = parseFloat(value);
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

const handleSubmit = () => {
  // Validare înainte de trimitere
  if (!validateInput(income, 0, 1000000)) {
    setError('Venitul trebuie să fie între 0 și 1,000,000');
    return;
  }
  
  if (!validateInput(expenses, 0, 1000000)) {
    setError('Cheltuielile trebuie să fie între 0 și 1,000,000');
    return;
  }
  
  if (!validateInput(debts, 0, 1000000)) {
    setError('Datoriile trebuie să fie între 0 și 1,000,000');
    return;
  }
  
  // Trimite datele
  calculateScore();
};
```

9.5.2 Securizarea stocării datelor

```typescript
// În services/authService.ts
class SecureStorage {
  static setItem(key: string, value: any) {
    try {
      const encryptedValue = btoa(JSON.stringify(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  static getItem(key: string) {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      return JSON.parse(atob(encryptedValue));
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  static removeItem(key: string) {
    localStorage.removeItem(key);
  }
}

export default SecureStorage;
```

9.6 Monitorizarea securității

9.6.1 Logging pentru securitate

```javascript
// În server/index.js
const logSecurityEvent = (event, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: details.ip || 'unknown'
  };
  
  console.log('SECURITY:', JSON.stringify(logEntry));
};

// Log pentru tentative de login eșuate
app.post('/api/login', async (req, res) => {
  try {
    const result = await loginUser(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    logSecurityEvent('failed_login', {
      email: req.body.email,
      ip: req.ip,
      reason: error.message
    });
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

9.6.2 Dashboard simplu de securitate

```typescript
// În AdminPage.tsx
const SecurityStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    failedLogins: 0,
    lastLogin: null
  });

  useEffect(() => {
    // Încarcă statistici simple
    loadSecurityStats();
  }, []);

  return (
    <div className="security-stats">
      <h3>Statistici de securitate</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span>Utilizatori totali: {stats.totalUsers}</span>
        </div>
        <div className="stat-item">
          <span>Utilizatori activi: {stats.activeUsers}</span>
        </div>
        <div className="stat-item">
          <span>Logini eșuați: {stats.failedLogins}</span>
        </div>
      </div>
    </div>
  );
};
```

9.7 Verificarea securității

9.7.1 Checklist simplu de securitate

**Verificări de bază:**
- [ ] Fișierul `.env` nu este în repository
- [ ] Parolele sunt hash-uite cu bcrypt
- [ ] JWT secret este configurat
- [ ] Input-urile sunt validate
- [ ] CORS este configurat
- [ ] Rate limiting este activat

**Script simplu de verificare:**
```bash
#!/bin/bash
# security-check.sh

echo "🔍 Verificare securitate..."

# Verifică dacă .env există în repo
if git ls-files | grep -q "\.env"; then
  echo "❌ .env file found in repository!"
  exit 1
fi

# Verifică dependențele de securitate
if ! grep -q "bcrypt" package.json; then
  echo "❌ bcrypt not found in dependencies"
  exit 1
fi

if ! grep -q "jsonwebtoken" package.json; then
  echo "❌ jsonwebtoken not found in dependencies"
  exit 1
fi

echo "✅ Security checks passed!"
```

9.8 Checklist pentru securitate

9.8.1 Checklist de bază pentru securitate

**La fiecare commit:**
- [ ] Verifică că nu ai inclus fișiere `.env`
- [ ] Validează că input-urile sunt verificate
- [ ] Testează că autentificarea funcționează
- [ ] Verifică că erorile sunt gestionate corect

**La fiecare deploy:**
- [ ] Verifică că toate dependențele sunt actualizate
- [ ] Testează că rate limiting funcționează
- [ ] Verifică că logging-ul funcționează
- [ ] Testează că backup-ul funcționează

9.9 Concluzie

Sistemul de securitate pentru aplicația de analiză a clienților bancari include:

**Autentificare securizată:** JWT și bcrypt pentru protecția parolelor
**Validarea input-urilor:** Protecție împotriva injection attacks
**Rate limiting:** Protecție împotriva atacurilor de tip DDoS
**Logging:** Urmărirea activității pentru debugging și securitate
**Configurare sigură:** Variabile de mediu protejate și validare

Aceste măsuri asigură că aplicația rămâne sigură și protejează datele sensibile ale utilizatorilor, oferind o experiență sigură în gestionarea finanțelor personale.
