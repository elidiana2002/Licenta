-- Trigger pentru actualizarea automată a statusului cardurilor expirate
DELIMITER $$

-- Trigger care se execută înainte de inserare pentru a verifica data expirării
CREATE TRIGGER IF NOT EXISTS before_card_insert 
BEFORE INSERT ON cards
FOR EACH ROW
BEGIN
    -- Verifică dacă data expirării este în trecut
    IF NEW.expiration_date < CURDATE() THEN
        SET NEW.status = 'expired';
    ELSE
        SET NEW.status = 'active';
    END IF;
END$$

-- Trigger pentru actualizarea automată a statusului la fiecare zi
-- Acest trigger se poate executa printr-un event scheduler MySQL
CREATE EVENT IF NOT EXISTS update_expired_cards
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE cards 
    SET status = 'expired' 
    WHERE expiration_date < CURDATE() 
    AND status = 'active';
END$$

DELIMITER ;
