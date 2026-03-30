-- Status do aluno: active (padrão) | inactive (desativado, sem exclusão física)
-- Executar: mysql -u root -p escola < database/migrations/011_student_status.sql

ALTER TABLE students ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
