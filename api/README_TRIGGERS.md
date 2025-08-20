# Automatizarea Statusului Cardurilor

## Descriere
Acest sistem automatizează actualizarea statusului cardurilor bancare bazat pe data expirării.

## Fișiere Create

### 1. `triggers.sql`
- **before_card_insert**: Trigger care se execută înainte de inserarea unui card nou
- **update_expired_cards**: Event care se execută zilnic pentru actualizarea statusului

### 2. `install_triggers.php`
Script PHP pentru instalarea automată a trigger-elor în baza de date.

### 3. `updateExpiredCards.php`
Script PHP care poate fi rulat ca cron job pentru actualizarea manuală.

## Instalare

### Pasul 1: Instalează trigger-ele
```bash
php install_triggers.php
```

### Pasul 2: Configurează cron job (opțional)
Pentru actualizarea automată zilnică, adaugă în crontab:
```bash
0 1 * * * /usr/bin/php /path/to/api/updateExpiredCards.php
```

## Cum Funcționează

### La Inserarea unui Card Nou:
1. **Status implicit**: `active`
2. **Verificare automată**: Dacă data expirării este în trecut, statusul devine `expired`
3. **Nu poate fi modificat**: Utilizatorul nu poate schimba statusul

### Actualizarea Zilnică:
1. **Event MySQL**: Rulează în fiecare zi la 00:00
2. **Verificare**: Toate cardurile cu `expiration_date < CURDATE()` sunt marcate ca `expired`
3. **Automat**: Nu necesită intervenția utilizatorului

## Structura Actualizată

### Tabelul `cards`:
- ❌ **Eliminat**: `account_type` (redundant cu tabelul `accounts`)
- ✅ **Păstrat**: `status` (doar pentru afișare, nu poate fi modificat)
- ✅ **Păstrat**: `currency` și `iban` (pentru afișare)

### Tabelul `accounts`:
- ✅ **Păstrat**: `account_type` (sursa principală pentru tipul contului)

## Beneficii

1. **Eliminarea redundanței**: Nu mai există conflicte între `cards.account_type` și `accounts.account_type`
2. **Automatizarea**: Statusul se actualizează automat fără intervenția utilizatorului
3. **Consistența datelor**: Statusul reflectă întotdeauna starea reală a cardului
4. **Simplitatea**: Utilizatorul nu trebuie să se preocupe de status

## Testare

Pentru a testa funcționalitatea:

1. Adaugă un card cu data expirării în trecut
2. Verifică că statusul este automat `expired`
3. Adaugă un card cu data expirării în viitor
4. Verifică că statusul este automat `active`
5. Rulează `updateExpiredCards.php` pentru a testa actualizarea manuală
