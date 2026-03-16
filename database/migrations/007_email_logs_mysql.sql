-- Tabela de logs de envio de e-mail
-- Executar: mysql -u root -p escola < database/migrations/007_email_logs_mysql.sql

CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `to` VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  error TEXT NULL,
  school_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
