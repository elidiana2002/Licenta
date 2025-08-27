-- Creează tabela history pentru a ține evidența tranzacțiilor
CREATE TABLE IF NOT EXISTS `history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_history_account` (`account_id`),
  CONSTRAINT `fk_history_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adaugă index pentru performanță
CREATE INDEX IF NOT EXISTS `idx_history_account_date` ON `history` (`account_id`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_history_type` ON `history` (`transaction_type`);
