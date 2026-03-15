-- Migração: adicionar teacher_id em conversations (MySQL)
-- Suporta comunicação Professor <-> Aluno
-- Executar: mysql -u root -p escola < database/migrations/002_conversations_teacher_id.sql

ALTER TABLE conversations ADD COLUMN teacher_id INT NULL AFTER school_id;
CREATE INDEX idx_conversations_teacher_id ON conversations(teacher_id);
