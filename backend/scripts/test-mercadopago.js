/**
 * Script para testar a integração Mercado Pago (boleto).
 * Execute: node scripts/test-mercadopago.js (a partir de backend/)
 */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const token = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? '').trim()
if (!token) {
  console.error('ERRO: MERCADOPAGO_ACCESS_TOKEN não configurado no .env')
  process.exit(1)
}

async function test() {
  console.log('Testando integração Mercado Pago (boleto)...\n')

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)
  const due = dueDate.toISOString().slice(0, 19) + '.000-03:00'

  const body = {
    transaction_amount: 10.0,
    description: 'Teste boleto escola',
    payment_method_id: 'bolbradesco',
    date_of_expiration: due,
    payer: {
      email: 'test_user_123@testuser.com',
      first_name: 'Teste',
      last_name: 'Boleto',
      identification: { type: 'CPF', number: '19119119100' },
      address: {
        zip_code: '01310100',
        street_name: 'Av Paulista',
        street_number: '1000',
        neighborhood: 'Bela Vista',
        city: 'Sao Paulo',
        federal_unit: 'SP',
      },
    },
  }

  const idempotencyKey = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const res = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('ERRO ao criar boleto:', err)
    process.exit(1)
  }

  const payment = await res.json()
  const poi = payment.point_of_interaction?.transaction_data
  const url = poi?.ticket_url ?? poi?.external_resource_url ?? ''

  console.log('Boleto criado:', payment.id)
  console.log('URL do boleto:', url || '(verificar point_of_interaction)')
  console.log('\nIntegração Mercado Pago OK. A geração de boletos está funcionando.')
}

test().catch((e) => {
  console.error('Erro:', e.message)
  process.exit(1)
})
