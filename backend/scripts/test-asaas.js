/**
 * Script para testar a integração Asaas (chave, cliente, boleto).
 * Execute: node scripts/test-asaas.js (a partir de backend/)
 */
const path = require('path')
const fs = require('fs')

// Carrega .env do diretório backend
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

function normalizeKey(k) {
  return k
    .replace(/\uFEFF/g, '')
    .trim()
    .replace(/^['"`]|['"`]$/g, '')
    .replace(/^\\+/, '')
    .replace(/\r|\n|\s/g, '')
    .replace(/\uFFFD/g, '')
}

let apiKey = normalizeKey(process.env.ASAAS_API_KEY ?? '')
const isValidKey = (k) => k && /^\$aact_(prod|hmlg)_.+$/.test(k)

let apiKeyFromFile = ''
const keyFile = process.env.ASAAS_API_KEY_FILE?.trim()
if (keyFile) {
  try {
    const keyPath = path.resolve(__dirname, '..', keyFile)
    apiKeyFromFile = normalizeKey(fs.readFileSync(keyPath, 'utf-8'))
  } catch {
    // ignora
  }
}
if (isValidKey(apiKeyFromFile)) {
  apiKey = apiKeyFromFile
} else if (!isValidKey(apiKey)) {
  apiKey = ''
}

if (!isValidKey(apiKey)) {
  console.error('ERRO: Chave Asaas não configurada ou inválida.')
  console.error('Defina ASAAS_API_KEY no .env ou ASAAS_API_KEY_FILE=asaas.key')
  process.exit(1)
}

if (!apiKey.startsWith('$')) apiKey = '$' + apiKey

const baseUrl = process.env.ASAAS_BASE_URL || 'https://api-sandbox.asaas.com/v3'
// Asaas aceita access_token como header (não Authorization Bearer)
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'EscolaApp/1.0',
  access_token: apiKey,
}


async function test() {
  console.log('Testando integração Asaas (sandbox)...\n')

  // 1. Criar cliente de teste
  const customerRes = await fetch(`${baseUrl}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Teste Boleto Escola',
      email: 'teste-boleto@escola.local',
      cpfCnpj: '00000000000',
    }),
  })

  if (!customerRes.ok) {
    const err = await customerRes.text()
    console.error('ERRO ao criar cliente:', err)
    process.exit(1)
  }

  const customer = await customerRes.json()
  console.log('Cliente criado:', customer.id)

  // 2. Criar boleto de teste (R$ 1,00)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)
  const due = dueDate.toISOString().slice(0, 10)

  const paymentRes = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: customer.id,
      billingType: 'BOLETO',
      value: 1.0,
      dueDate: due,
    }),
  })

  if (!paymentRes.ok) {
    const err = await paymentRes.text()
    console.error('ERRO ao criar boleto:', err)
    process.exit(1)
  }

  const payment = await paymentRes.json()
  console.log('Boleto criado:', payment.id)
  console.log('URL do boleto:', payment.bankSlipUrl || payment.invoiceUrl || '(não disponível)')
  console.log('\nIntegração Asaas OK. A geração de boletos está funcionando.')
}

test().catch((e) => {
  console.error('Erro:', e.message)
  process.exit(1)
})
