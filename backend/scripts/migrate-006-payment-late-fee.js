/**
 * Adiciona colunas payment_due_day, late_fee_percentage em students
 * e late_fee_percentage, late_fee_applied em payments.
 * Executar: node scripts/migrate-006-payment-late-fee.js (a partir da pasta backend)
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

    const [colsStudents] = await conn.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME IN ('payment_due_day', 'late_fee_percentage')",
      [config.database]
    )
    const existingStudents = colsStudents.map((r) => r.COLUMN_NAME)

    const [colsPayments] = await conn.execute(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payments' AND COLUMN_NAME IN ('late_fee_percentage', 'late_fee_applied')",
      [config.database]
    )
    const existingPayments = colsPayments.map((r) => r.COLUMN_NAME)

    if (!existingStudents.includes('payment_due_day')) {
      await conn.execute('ALTER TABLE students ADD COLUMN payment_due_day INT NULL')
      console.log('Coluna students.payment_due_day adicionada.')
    } else {
      console.log('Coluna students.payment_due_day ja existe.')
    }

    if (!existingStudents.includes('late_fee_percentage')) {
      await conn.execute('ALTER TABLE students ADD COLUMN late_fee_percentage DECIMAL(5,2) NULL')
      console.log('Coluna students.late_fee_percentage adicionada.')
    } else {
      console.log('Coluna students.late_fee_percentage ja existe.')
    }

    if (!existingPayments.includes('late_fee_percentage')) {
      await conn.execute('ALTER TABLE payments ADD COLUMN late_fee_percentage DECIMAL(5,2) NULL')
      console.log('Coluna payments.late_fee_percentage adicionada.')
    } else {
      console.log('Coluna payments.late_fee_percentage ja existe.')
    }

    if (!existingPayments.includes('late_fee_applied')) {
      await conn.execute('ALTER TABLE payments ADD COLUMN late_fee_applied TINYINT(1) DEFAULT 0')
      console.log('Coluna payments.late_fee_applied adicionada.')
    } else {
      console.log('Coluna payments.late_fee_applied ja existe.')
    }

    console.log('Migration 006 concluida.')
  } catch (err) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    if (conn) await conn.end()
  }
}

main()
