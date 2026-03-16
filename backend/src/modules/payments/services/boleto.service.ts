import { Injectable } from '@nestjs/common'
import { MailQueueService } from '../../mail/mail-queue.service'

const PDFDocument = require('pdfkit')
import type { Payment } from '../entities/payment.entity'
import type { Student } from '../../students/entities/student.entity'

export interface BoletoResult {
  barcode: string
  linha_digitavel: string
  bankSlipUrl: string
  provider_id?: string
}

export interface BoletoLocalResult {
  barcode: string
  linha_digitavel: string
  pdfBuffer: Buffer
}

export interface PayerAddress {
  zip_code?: string
  street_name?: string
  street_number?: string
  neighborhood?: string
  city?: string
  federal_unit?: string
}

@Injectable()
export class BoletoService {
  constructor(private mailQueue: MailQueueService) {}

  private buildPayerAddress(addr?: PayerAddress | null): {
    zip_code: string
    street_name: string
    street_number: string
    neighborhood: string
    city: string
    federal_unit: string
  } {
    const a = addr ?? {}
    return {
      zip_code: (a.zip_code ?? '').replace(/\D/g, '').slice(0, 8) || '01310100',
      street_name: a.street_name || 'Av Paulista',
      street_number: String(a.street_number || '').trim() || '1000',
      neighborhood: a.neighborhood || 'Bela Vista',
      city: a.city || 'Sao Paulo',
      federal_unit: (a.federal_unit || '').toUpperCase().slice(0, 2) || 'SP',
    }
  }

  private normalizePayerEmail(email: string | null, paymentId: number): string {
    const e = (email ?? '').trim()
    if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return e
    return `aluno${paymentId}@escola.com.br`
  }

  private getAccessToken(): string {
    const token = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? '').trim()
    if (!token) {
      throw new Error(
        'Configure MERCADOPAGO_ACCESS_TOKEN no .env. Use credenciais de teste (TEST-...) ou de produção.',
      )
    }
    return token
  }

  async generate(
    paymentId: number,
    amount: number,
    dueDate: string | null,
    studentName: string,
    studentEmail: string | null,
    address?: PayerAddress | null,
  ): Promise<BoletoResult> {
    const accessToken = this.getAccessToken()
    return this.generateViaMercadoPago(accessToken, paymentId, amount, dueDate, studentName, studentEmail, address)
  }

  private async generateViaMercadoPago(
    accessToken: string,
    paymentId: number,
    amount: number,
    dueDate: string | null,
    studentName: string,
    studentEmail: string | null,
    address?: PayerAddress | null,
  ): Promise<BoletoResult> {
    const dueRaw = dueDate || new Date().toISOString().slice(0, 10)
    const due = dueRaw.length <= 10 ? `${dueRaw}T23:59:59.000-03:00` : dueRaw
    const nameParts = (studentName || 'Aluno').trim().split(/\s+/, 2)
    const firstName = nameParts[0] || 'Aluno'
    const lastName = nameParts[1] || `#${paymentId}`

    const addr = this.buildPayerAddress(address)
    const body = {
      transaction_amount: Number(amount),
      description: `Mensalidade escolar - Ref ${paymentId}`,
      payment_method_id: 'bolbradesco',
      date_of_expiration: due,
      payer: {
        email: this.normalizePayerEmail(studentEmail, paymentId),
        first_name: firstName,
        last_name: lastName,
        identification: { type: 'CPF', number: '19119119100' },
        address: addr,
      },
    }

    const idempotencyKey = `${paymentId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const res = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Mercado Pago: ${errText}`)
    }

    const mpPayment = await res.json()
    const poi = mpPayment.point_of_interaction?.transaction_data
    const bankSlipUrl =
      poi?.ticket_url ?? poi?.external_resource_url ?? mpPayment.transaction_details?.external_resource_url ?? ''
    const barcode =
      poi?.barcode?.content ?? poi?.barcode_content ?? mpPayment.transaction_details?.barcode_content ?? String(mpPayment.id)
    return {
      barcode,
      linha_digitavel: barcode,
      bankSlipUrl,
      provider_id: String(mpPayment.id),
    }
  }

  async generatePdfLocal(
    paymentId: number,
    amount: number,
    dueDate: string,
    studentName: string,
  ): Promise<BoletoLocalResult> {
    const seq = String(paymentId).padStart(10, '0')
    const barcode = seq
    const linhaDigitavel = seq

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    return new Promise<BoletoLocalResult>((resolve, reject) => {
      doc.on('end', () =>
        resolve({
          barcode,
          linha_digitavel: linhaDigitavel,
          pdfBuffer: Buffer.concat(chunks),
        }),
      )
      doc.on('error', reject)

      const valorFormatado = amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      const vencFormatado = dueDate
        ? new Date(dueDate + 'T12:00:00')
            .toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
        : '-'

      doc.fontSize(20).text('COMPROVANTE DE COBRANÇA', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(10).text('Mensalidade Escolar - Pagamento na secretaria ou via boleto (quando disponível)', {
        align: 'center',
      })
      doc.moveDown(2)
      doc.fontSize(11).text(`Aluno: ${studentName}`, { continued: false })
      doc.text(`Valor: ${valorFormatado}`, { continued: false })
      doc.text(`Vencimento: ${vencFormatado}`, { continued: false })
      doc.text(`Referência: ${paymentId}`, { continued: false })
      doc.moveDown(2)
      doc.fontSize(9)
        .text(
          'Este comprovante pode ser pago na secretaria da escola. Para boleto bancário com código de barras, utilize a opção "Gerar" (requer Mercado Pago configurado).',
          { align: 'center', width: 495 },
        )

      doc.end()
    }) as Promise<BoletoLocalResult>
  }

  async generateAndSend(
    payment: Payment,
    student: Student | null,
    schoolId?: number,
  ): Promise<{ barcode: string; linha_digitavel: string }> {
    const amount = Number(payment.amount)
    const dueDate = payment.due_date || new Date().toISOString().slice(0, 10)
    const studentName = student?.name || 'Aluno'
    const emailTo = student?.email

    const { barcode, linha_digitavel, pdfBuffer } = await this.generatePdfLocal(
      payment.id,
      amount,
      dueDate,
      studentName,
    )

    const filename = `boleto-${payment.id}-${dueDate}.pdf`

    if (emailTo) {
      const amountFormatted = amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      this.mailQueue
        .add({
          to: emailTo,
          subject: 'Nova mensalidade gerada',
          template: 'payment-created',
          data: {
            studentName,
            amount: amountFormatted,
            dueDate,
          },
          attachments: [{ filename, content: pdfBuffer }],
          schoolId: schoolId ?? undefined,
        })
        .catch((err) => console.error('[BoletoService] Erro ao enfileirar email:', err))
    }

    return { barcode, linha_digitavel }
  }
}
