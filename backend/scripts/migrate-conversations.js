/**
 * Verifica se as tabelas conversations e conversation_messages existem.
 * Se não existirem, cria.
 * Executar: node scripts/migrate-conversations.js (a partir da pasta backend)
 */
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'escola',
  }

  let conn
  try {
    conn = await mysql.createConnection(config)
    const [tables] = await conn.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('conversations', 'conversation_messages')",
      [config.database]
    )
    const existing = tables.map((r) => r.TABLE_NAME)

    if (existing.includes('conversations') && existing.includes('conversation_messages')) {
      console.log('Tabelas conversations e conversation_messages já existem.')
      return
    }

    if (!existing.includes('conversations')) {
      await conn.execute(`
        CREATE TABLE conversations (
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
        )
      `)
      console.log('Tabela conversations criada.')
    }

    if (!existing.includes('conversation_messages')) {
      await conn.execute(`
        CREATE TABLE conversation_messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          conversation_id INT NOT NULL,
          sender_type VARCHAR(50) NOT NULL,
          sender_id INT NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_conversation_messages_conversation_id (conversation_id),
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
      `)
      console.log('Tabela conversation_messages criada.')
    }
  } catch (err) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    if (conn) await conn.end()
  }
}

main()
