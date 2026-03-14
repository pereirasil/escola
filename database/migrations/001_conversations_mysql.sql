-- Migração: tabelas conversations e conversation_messages (MySQL)
-- Executar: mysql -u root -p escola < database/migrations/001_conversations_mysql.sql

-- Verifica e cria conversations
CREATE TABLE IF NOT EXISTS conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NULL,
  student_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  last_message_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_conversations_student_id (student_id),
  INDEX idx_conversations_school_id (school_id),
  INDEX idx_conversations_last_message_at (last_message_at)
);

-- Verifica e cria conversation_messages
CREATE TABLE IF NOT EXISTS conversation_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_type VARCHAR(50) NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_conversation_messages_conversation_id (conversation_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
