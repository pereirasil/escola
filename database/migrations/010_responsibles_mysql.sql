-- Migração: Responsáveis e vínculo responsável-aluno
-- O TypeORM com synchronize:true cria as tabelas automaticamente.
-- Este arquivo documenta a estrutura para referência.

-- Tabela responsibles (criada pelo TypeORM)
-- CREATE TABLE IF NOT EXISTS responsibles (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   name VARCHAR(255) NOT NULL,
--   cpf VARCHAR(255) NOT NULL UNIQUE,
--   password_hash VARCHAR(255) NOT NULL,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- Tabela responsible_students (criada pelo TypeORM)
-- CREATE TABLE IF NOT EXISTS responsible_students (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   responsible_id INT NOT NULL,
--   student_id INT NOT NULL,
--   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (responsible_id) REFERENCES responsibles(id) ON DELETE CASCADE,
--   FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
-- );

-- NOTA: Para migrar alunos existentes (que tinham login por CPF do aluno):
-- É necessário um script que, para cada student com password_hash preenchido,
-- crie um responsible a partir de guardian_document (ou document se ausente),
-- defina a senha do responsible com a mesma do student, e crie o vínculo
-- em responsible_students. Isso deve ser feito com cuidado e backup prévio.
