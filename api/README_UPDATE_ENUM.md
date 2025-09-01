# Actualizare Enum pentru Coloana Status din Tabelul Transactions

## Problema
Coloana `status` din tabelul `transactions` are doar 3 valori în enum:
- `completed`
- `pending` 
- `rejected`

Dar în codul PHP folosim și:
- `accepted`
- `returned`
- `cancelled`

## Soluții

### Metoda 1: SQL Direct (Recomandată)
1. **Deschide phpMyAdmin** sau clientul MySQL preferat
2. **Selectează baza de date** `banca`
3. **Execută comanda SQL:**
```sql
ALTER TABLE transactions 
MODIFY COLUMN status ENUM('completed', 'pending', 'rejected', 'accepted', 'returned', 'cancelled') DEFAULT 'pending';
```

### Metoda 2: Fișier SQL
1. **Deschide fișierul** `update_transactions_status_enum.sql`
2. **Execută-l** în phpMyAdmin sau clientul MySQL

### Metoda 3: Script PHP
1. **Deschide browser-ul** și navighează la:
   ```
   http://localhost/api/update_transactions_enum.php
   ```
2. **Verifică output-ul** pentru confirmarea actualizării

## Verificare
După actualizare, verifică:
```sql
DESCRIBE transactions;
SELECT DISTINCT status FROM transactions;
```

## Status-uri Noi Adăugate
- **`accepted`** - Transfer acceptat de destinatar
- **`returned`** - Transfer returnat de destinatar
- **`cancelled`** - Transfer anulat de expeditor

## Backup (Recomandat)
Înainte de actualizare, fă backup la baza de date:
```bash
mysqldump -u root -p banca > backup_banca_$(date +%Y%m%d_%H%M%S).sql
```

## Rollback (Dacă e necesar)
Dacă vrei să revii la enum-ul original:
```sql
ALTER TABLE transactions 
MODIFY COLUMN status ENUM('completed', 'pending', 'rejected') DEFAULT 'pending';
```

## Note Importante
- **MySQL 8.0+** suportă `MODIFY COLUMN` pentru enum-uri
- **MySQL 5.7** poate necesita metoda cu coloană temporară
- **Datele existente** sunt păstrate automat
- **Valorile noi** pot fi folosite imediat după actualizare
