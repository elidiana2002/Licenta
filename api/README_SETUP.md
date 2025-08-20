# 🏦 Setup Baza de Date - Sistem Bancar

## 📋 **Pași de Setup**

### **Pasul 1: Creează structura bazei de date**
```sql
-- În phpMyAdmin sau MySQL Workbench
source api/database.sql
```
**Rezultat:** Se creează toate tabelele fără date

### **Pasul 2: Populează tabelele cu date de test**
```sql
-- În phpMyAdmin sau MySQL Workbench
source api/populate_tables.sql
```
**Rezultat:** Se adaugă datele de test în toate tabelele

### **Pasul 3: Instalează trigger-ele pentru automatizare**
```bash
# Accesează în browser
http://localhost/api/install_triggers.php
```
**Rezultat:** Se activează actualizarea automată a statusului cardurilor

## 🗂️ **Structura Tabelelor**

### **`clients`** - Utilizatori/Clienți
- `id`, `first_name`, `last_name`, `email`
- `password_hash`, `CNP`, `address`, `phone`
- `role` (admin/user/manager), `created_at`

### **`banks`** - Bănci
- `id`, `name` (Banca Transilvania, BCR, BRD, etc.)

### **`accounts`** - Conturi Bancare
- `id`, `client_id`, `bank_id`, `iban`
- `currency`, `balance`, `account_type`, `created_at`

### **`cards`** - Carduri Bancare
- `id`, `account_id`, `card_number`, `expiration_date`
- `cvv`, `status`, `card_type`, `bank_name`
- `iban`, `currency`, `issued_at`

### **`transactions`** - Tranzacții
- `id`, `card_id`, `amount`, `status`
- `transaction_type`, `category`, `description`, `created_at`

### **`history`** - Istoric Modificări
- `id`, `client_id`, `account_id`, `field_changed`
- `old_value`, `new_value`, `changed_at`, `changed_by`

## 🎯 **Datele de Test Create**

### **Utilizatori:**
- **admin@test.com** / admin123 (rol: admin)
- **user@test.com** / user123 (rol: user)
- **manager@test.com** / manager123 (rol: manager)
- **alex@test.com** / user123 (rol: user)
- **elena@test.com** / user123 (rol: user)

### **Conturi:**
- 6 conturi bancare cu diferite monede (RON, EUR, USD)
- Tipuri: current, savings, business

### **Carduri:**
- 5 carduri cu diferite tipuri (debit, credit, virtual)
- Statusuri: active, blocked, expired

### **Tranzacții:**
- 8 tranzacții cu diferite statusuri și categorii
- Tipuri: payment, withdrawal, deposit, transfer



## 🔧 **Scripturi Disponibile**

| Script | Descriere | Acces |
|--------|-----------|-------|
| `database.sql` | Structura tabelelor | phpMyAdmin |
| `populate_tables.sql` | Date de test | phpMyAdmin |
| `install_triggers.php` | Trigger-e automate | Browser |
| `getBanks.php` | Obține lista băncilor | API |

## 🚀 **Testare Aplicația**

### **1. Login cu utilizatorii de test:**
```
Email: user@test.com
Parolă: user123
```

### **2. Verifică cardurile:**
- Ar trebui să vezi cardurile asociate cu contul
- Statusul se actualizează automat

### **3. Adaugă card nou:**
- Formularul se pre-completează automat
- **Creare automată cont bancar** dacă nu există
- Validare pentru număr card, expirare, CVV
- Criptare automată a datelor sensibile
- **API endpoint:** `addCard.php` (cu funcționalitate îmbunătățită)

## ⚠️ **Note Importante**

1. **`database.sql`** conține doar structura - nu date
2. **`populate_tables.sql`** adaugă datele de test
3. **Trigger-ele** se activează doar după `install_triggers.php`
4. **Parolele** sunt hash-uite cu BCRYPT

## 🆘 **Troubleshooting**

### **Eroare "Clientul nu are niciun cont bancar"**
- **Nou:** Acum `addCard.php` creează automat contul bancar!
- Rulează `populate_tables.sql` pentru a crea conturile
- Verifică că `client_id` din `accounts` se potrivește cu `id` din `clients`



### **Trigger-ele nu funcționează**
- Rulează `install_triggers.php`
- Verifică că event scheduler-ul MySQL este activat
- Verifică log-urile MySQL pentru erori

## 🆕 **Funcționalitate Îmbunătățită - Creare Automată Cont**

### **`addCard.php` - Acum creează automat conturile!**

#### **Caracteristici:**
- ✅ **Creare automată cont bancar** dacă clientul nu are unul
- ✅ **Generare automată IBAN** unic
- ✅ **Validare completă** a datelor cardului
- ✅ **Compatibilitate** cu conturi existente
- ✅ **Response JSON** cu `account_id` generat

#### **Cum funcționează:**
1. **Clientul trimite** `client_id`, `bank_id`, datele cardului
2. **Sistemul verifică** dacă există cont bancar
3. **Dacă nu există** → creează automat unul nou
4. **Creează cardul** asociat cu contul (nou sau existent)
5. **Returnează** `account_id` pentru referință

#### **Exemple de request:**
```javascript
// Request minimal - creează automat contul
{
  "client_id": 2,
  "bank_id": 1,
  "card_number": "1234567890123456",
  "expiration_date": "12/26",
  "cvv": "123"
}

// Request cu cont existent
{
  "client_id": 2,
  "account_id": 5, // folosește contul existent
  "card_number": "1234567890123456",
  "expiration_date": "12/26",
  "cvv": "123"
}
```

#### **Documentație completă:**
Vezi `API_CARDS_DOCUMENTATION.md` pentru exemple detaliate și implementări frontend.
