# 🎴 API Documentație - Creare Carduri

## 📋 **Endpoint: `addCard.php`**

### **URL:** `POST /api/addCard.php`

## 🔧 **Funcționalitate**

Acest API creează automat un **cont bancar** dacă clientul nu are unul, apoi adaugă **cardul** asociat cu acel cont.

---

## 📤 **Request Parameters**

### **Parametri obligatorii:**
```json
{
  "client_id": 2,           // ID-ul clientului din tabelul clients
  "bank_id": 1,             // ID-ul băncii din tabelul banks
  "card_number": "1234567890123456",
  "expiration_date": "12/26", // Format MM/YY
  "cvv": "123"              // Exact 3 cifre
}
```

### **Parametri opționali:**
```json
{
  "card_type": "debit",     // debit, credit, virtual (default: debit)
  "bank_name": "Banca Transilvania",
  "currency": "RON",        // RON, EUR, USD (default: RON)
  "account_type": "current", // current, savings, business (default: current)
  "account_id": 5           // Dacă vrei să folosești un cont existent
}
```

---

## 📥 **Response**

### **Succes:**
```json
{
  "success": true,
  "account_id": 6,
  "card_id": 12,
  "message": "Cardul a fost creat cu succes!"
}
```

### **Eroare:**
```json
{
  "error": "Descrierea erorii"
}
```

---

## 🚀 **Exemple de Utilizare**

### **1. Creare card cu cont nou (recomandat):**

```javascript
// Frontend React/JavaScript
const createCard = async () => {
  try {
    const response = await fetch('/api/addCard.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 2,                    // ID-ul clientului logat
        bank_id: 1,                      // Banca Transilvania
        card_number: "1234567890123456",
        expiration_date: "12/26",
        cvv: "123",
        card_type: "debit",
        bank_name: "Banca Transilvania",
        currency: "RON"
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Card creat cu succes!');
      console.log('Account ID:', result.account_id);
      console.log('Card ID:', result.card_id);
    } else {
      console.error('Eroare:', result.error);
    }
  } catch (error) {
    console.error('Eroare de rețea:', error);
  }
};
```

### **2. Creare card cu cont existent:**

```javascript
const createCardWithExistingAccount = async () => {
  try {
    const response = await fetch('/api/addCard.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 2,
        bank_id: 1,
        account_id: 5,                   // Folosește contul existent
        card_number: "9876543210987654",
        expiration_date: "06/27",
        cvv: "456",
        card_type: "credit"
      })
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Eroare:', error);
  }
};
```

---

## 🔄 **Fluxul de Funcționare**

### **Cazul 1: Clientul nu are cont bancar**
1. **Frontend** trimite `client_id`, `bank_id`, datele cardului
2. **Backend** verifică dacă clientul există
3. **Backend** creează automat un cont nou în `accounts`
4. **Backend** generează un IBAN unic
5. **Backend** creează cardul asociat cu contul nou
6. **Backend** returnează `account_id` și `card_id`

### **Cazul 2: Clientul are deja cont bancar**
1. **Frontend** trimite `client_id`, `bank_id`, datele cardului
2. **Backend** verifică dacă clientul există
3. **Backend** creează cardul asociat cu contul existent
4. **Backend** returnează `account_id` și `card_id`

---

## ✅ **Validări Implementate**

### **Card Number:**
- Minim 16 cifre, maxim 32 cifre
- Se elimină automat spațiile și caracterele non-digitale

### **Expiration Date:**
- Format obligatoriu: `MM/YY`
- Se convertește automat în `YYYY-MM-01` pentru baza de date

### **CVV:**
- Exact 3 cifre
- Doar numere

### **Client:**
- Trebuie să existe în tabelul `clients`

### **Bank:**
- Trebuie să existe în tabelul `banks`

---

## 📊 **Tabelele Implicate**

### **`clients`** - Verificare existență client
### **`banks`** - Verificare existență bancă
### **`accounts`** - Creare automată cont nou
### **`cards`** - Inserare card
### **`history`** - Logging automat al acțiunilor

---

## 🆘 **Coduri de Eroare Comune**

| Eroare | Cauza | Soluție |
|--------|-------|---------|
| `"Date lipsă"` | Parametri obligatorii lipsă | Verifică că trimiți `client_id`, `bank_id`, `card_number`, `expiration_date`, `cvv` |
| `"Clientul nu există!"` | `client_id` invalid | Verifică că ID-ul clientului este corect |
| `"Numărul cardului trebuie să conțină între 16 și 32 de cifre"` | Format card invalid | Verifică că numărul cardului are între 16-32 cifre |
| `"Data expirării trebuie să fie în format MM/YY"` | Format dată invalid | Folosește formatul `MM/YY` (ex: `12/26`) |
| `"CVV-ul trebuie să conțină exact 3 cifre"` | CVV invalid | CVV-ul trebuie să fie exact 3 cifre |
| `"Există deja un card cu acest număr!"` | Duplicat | Folosește un număr de card diferit |

---

## 🔐 **Securitate**

- ✅ **Validare strictă** a tuturor parametrilor
- ✅ **Verificare proprietate** - clientul poate crea carduri doar pentru conturile sale
- ✅ **Logging automat** în tabelul `history`
- ✅ **Sanitizare** a numerelor de card
- ✅ **Validare format** pentru toate câmpurile

---

## 📱 **Integrare Frontend**

### **React Hook Example:**
```javascript
import { useState } from 'react';

const useCardCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCard = async (cardData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/addCard.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('Eroare de rețea');
      return { success: false, error: 'Eroare de rețea' };
    } finally {
      setLoading(false);
    }
  };

  return { createCard, loading, error };
};
```

---

## 🎯 **Testare**

### **1. Test cu cont nou:**
```bash
curl -X POST http://localhost/api/addCard.php \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 2,
    "bank_id": 1,
    "card_number": "1234567890123456",
    "expiration_date": "12/26",
    "cvv": "123"
  }'
```

### **2. Test cu cont existent:**
```bash
curl -X POST http://localhost/api/addCard.php \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 2,
    "bank_id": 1,
    "account_id": 5,
    "card_number": "9876543210987654",
    "expiration_date": "06/27",
    "cvv": "456"
  }'
```

---

## 📝 **Note Importante**

1. **`client_id`** trebuie să existe în tabelul `clients`
2. **`bank_id`** trebuie să existe în tabelul `banks`
3. **IBAN-ul** se generează automat dacă nu există cont
4. **Statusul cardului** se setează automat la `active`
5. **Toate acțiunile** sunt logate în tabelul `history`
6. **Validarea** se face atât pe frontend cât și pe backend
