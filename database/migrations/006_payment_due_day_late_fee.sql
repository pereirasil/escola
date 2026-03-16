-- Adiciona payment_due_day e late_fee_percentage em students
-- Adiciona late_fee_percentage e late_fee_applied em payments
-- O erro 500 em GET/POST /payments ocorre quando estas colunas nao existem.
-- Executar: mysql -u root -p escola < database/migrations/006_payment_due_day_late_fee.sql

ALTER TABLE students ADD COLUMN payment_due_day INT NULL;
ALTER TABLE students ADD COLUMN late_fee_percentage DECIMAL(5,2) NULL;

ALTER TABLE payments ADD COLUMN late_fee_percentage DECIMAL(5,2) NULL;
ALTER TABLE payments ADD COLUMN late_fee_applied TINYINT(1) DEFAULT 0;
