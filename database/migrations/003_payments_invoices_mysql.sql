-- Migração: tabelas payments e invoices (MySQL)
-- Executar: mysql -u root -p escola < database/migrations/003_payments_invoices_mysql.sql
-- Ou via cliente MySQL: source database/migrations/003_payments_invoices_mysql.sql

-- Tabela payments (mensalidades/cobranças)
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NULL,
  student_id INT NOT NULL,
  amount DOUBLE NOT NULL,
  due_date VARCHAR(50) NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_payments_school_id (school_id),
  INDEX idx_payments_student_id (student_id),
  INDEX idx_payments_due_date (due_date),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Tabela invoices (boletos vinculados aos pagamentos)
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NULL,
  payment_id INT NOT NULL,
  barcode VARCHAR(255) NULL,
  linha_digitavel VARCHAR(255) NULL,
  boleto_url VARCHAR(500) NULL,
  provider_id VARCHAR(255) NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_invoices_payment_id (payment_id),
  INDEX idx_invoices_school_id (school_id),
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Para tabelas que já existiam sem as colunas novas, adicione-as manualmente se necessário:
-- ALTER TABLE invoices ADD COLUMN linha_digitavel VARCHAR(255) NULL;
-- ALTER TABLE invoices ADD COLUMN boleto_url VARCHAR(500) NULL;
-- ALTER TABLE invoices ADD COLUMN provider_id VARCHAR(255) NULL;
-- ALTER TABLE invoices ADD COLUMN school_id INT NULL;
