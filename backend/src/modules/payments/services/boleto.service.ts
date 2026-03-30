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

  /** Token da plataforma (cadastro, etc). Nao usar para pagamentos de escolas. */
  getPlatformToken(): string {
    const token = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? '').trim()
    if (!token) {
      throw new Error(
        'Configure MERCADOPAGO_ACCESS_TOKEN no .env. Use credenciais de teste (TEST-...) ou de produção.',
      )
    }
    return token
  }

  /** accessToken obrigatório: token OAuth da escola. Para fluxo de cadastro usa getPlatformAccessToken. */
  async generate(
    accessToken: string,
    paymentId: number,
    amount: number,
    dueDate: string | null,
    studentName: string,
    studentEmail: string | null,
    address?: PayerAddress | null,
    schoolId?: number,
  ): Promise<BoletoResult> {
    return this.generateViaMercadoPago(
      accessToken,
      paymentId,
      amount,
      dueDate,
      studentName,
      studentEmail,
      address,
      schoolId,
    )
  }

  /** Mercado Pago: expiration date cannot exceed 29 days from creation. Usar 28 dias max para margem. */
  private clampExpirationDate(dueDateStr: string | null): string {
    const raw = dueDateStr || new Date().toISOString().slice(0, 10)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 28)
    let due: Date
    if (raw.length <= 10) {
      const [y, m, d] = raw.split('-').map(Number)
      due = new Date(y, (m ?? 1) - 1, d ?? 1)
    } else {
      due = new Date(raw)
    }
    if (Number.isNaN(due.getTime())) due = today
    if (due < today) due = today
    if (due > maxDate) due = maxDate
    const y = due.getFullYear()
    const m = String(due.getMonth() + 1).padStart(2, '0')
    const d = String(due.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}T23:59:59.000-03:00`
  }

  private async generateViaMercadoPago(
    accessToken: string,
    paymentId: number,
    amount: number,
    dueDate: string | null,
    studentName: string,
    studentEmail: string | null,
    address?: PayerAddress | null,
    schoolId?: number,
  ): Promise<BoletoResult> {
    const due = this.clampExpirationDate(dueDate)
    const nameParts = (studentName || 'Aluno').trim().split(/\s+/, 2)
    const firstName = nameParts[0] || 'Aluno'
    const lastName = nameParts[1] || `#${paymentId}`

    const addr = this.buildPayerAddress(address)
    const body: Record<string, unknown> = {
      transaction_amount: Number(amount),
      description: `Mensalidade escolar - Ref ${paymentId}`,
      payment_method_id: 'bolbradesco',
      date_of_expiration: due,
      metadata: schoolId != null ? { school_id: String(schoolId), payment_id: String(paymentId) } : undefined,
      payer: {
        email: this.normalizePayerEmail(studentEmail, paymentId),
        first_name: firstName,
        last_name: lastName,
        identification: { type: 'CPF', number: '19119119100' },
        address: addr,
      },
    }
    if (body.metadata === undefined) delete body.metadata

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

  /** accessToken obrigatório: token OAuth da escola. Para cadastro usa getPlatformAccessToken. */
  async generatePix(
    accessToken: string,
    paymentId: number,
    amount: number,
    studentName: string,
    studentEmail: string | null,
    schoolId?: number,
  ): Promise<{ qr_code: string; qr_code_text: string; provider_id: string }> {
    const nameParts = (studentName || 'Aluno').trim().split(/\s+/, 2)
    const firstName = nameParts[0] || 'Aluno'
    const lastName = nameParts[1] || `#${paymentId}`

    const body: Record<string, unknown> = {
      transaction_amount: Number(amount),
      description: `Mensalidade escolar - Ref ${paymentId}`,
      payment_method_id: 'pix',
      metadata: schoolId != null ? { school_id: String(schoolId), payment_id: String(paymentId) } : undefined,
      payer: {
        email: this.normalizePayerEmail(studentEmail, paymentId),
        first_name: firstName,
        last_name: lastName,
      },
    }
    if (body.metadata === undefined) delete body.metadata

    const idempotencyKey = `pix-${paymentId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
      throw new Error(`Mercado Pago PIX: ${errText}`)
    }

    const mpPayment = await res.json()
    const poi = mpPayment.point_of_interaction?.transaction_data
    const qrCodeText = String(poi?.qr_code ?? '')
    const qrCodeBase64 = String(poi?.qr_code_base64 ?? '')

    return {
      qr_code: qrCodeBase64,
      qr_code_text: qrCodeText,
      provider_id: String(mpPayment.id),
    }
  }

  private formatCpf(doc: string | null): string {
    if (!doc?.trim()) return '-'
    const digits = doc.replace(/\D/g, '')
    if (digits.length !== 11) return doc
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  async generatePdfLocal(
    paymentId: number,
    amount: number,
    dueDate: string,
    studentName: string,
    status: string = 'pending',
    guardianName: string | null = null,
    guardianDocument: string | null = null,
    turma: string | null = null,
  ): Promise<BoletoLocalResult> {
    const seq = String(paymentId).padStart(10, '0')
    const barcode = seq
    const linhaDigitavel = seq

    const pageWidth = 595
    const pageHeight = 842
    const cardWidth = 495
    const cardLeft = (pageWidth - cardWidth) / 2
    const cardTop = 80
    const padding = 24

    const doc = new PDFDocument({ size: 'A4', margin: 0 })
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
        ? new Date(dueDate + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '-'
      const dataEmissao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const isPaid = status === 'paid'
      const statusLabel = isPaid ? 'PAGO' : status === 'overdue' ? 'Vencido' : 'Pendente'
      const textPrimary = '#1A1A1A'
      const textSecondary = '#666666'
      const borderColor = '#E5E7EB'
      const statusPaidColor = '#15803D'

      // Fundo da página
      doc.rect(0, 0, pageWidth, pageHeight).fill('#F5F5F5')

      // Card centralizado com bordas arredondadas e sombra simulada
      const cardRadius = 8
      const shadowOffset = 4
      doc.save()
      const cardHeight = 500
      doc.roundedRect(cardLeft + shadowOffset, cardTop + shadowOffset, cardWidth, cardHeight, cardRadius)
        .fill('#E8E8E8')
      doc.restore()
      doc.roundedRect(cardLeft, cardTop, cardWidth, cardHeight, cardRadius).fillAndStroke('#FFFFFF', '#E5E7EB')

      let y = cardTop + padding
      const headerWidth = cardWidth - padding * 2
      const titleStr = isPaid ? 'RECIBO DE PAGAMENTO' : 'COMPROVANTE DE COBRANÇA'
      const subtitleStr = isPaid
        ? 'Comprovante de quitação de mensalidade escolar'
        : 'Mensalidade Escolar - Pagamento na secretaria ou via boleto (quando disponível)'

      // Cabeçalho (avanço em y pela altura real do bloco — evita sobreposição no PDF)
      doc.fontSize(22).font('Helvetica-Bold').fillColor(textPrimary)
      const titleH = doc.heightOfString(titleStr, { width: headerWidth, align: 'center' })
      doc.text(titleStr, cardLeft + padding, y, {
        width: headerWidth,
        align: 'center',
      })
      y += titleH + 6

      doc.fontSize(12).font('Helvetica').fillColor(textSecondary)
      const subtitleH = doc.heightOfString(subtitleStr, { width: headerWidth, align: 'center' })
      doc.text(subtitleStr, cardLeft + padding, y, {
        width: headerWidth,
        align: 'center',
      })
      y += subtitleH + 6

      doc.fontSize(10).font('Helvetica').fillColor(textSecondary)
      const emissaoStr = `Emitido em: ${dataEmissao}`
      const emissaoH = doc.heightOfString(emissaoStr, { width: headerWidth, align: 'center' })
      doc.text(emissaoStr, cardLeft + padding, y, {
        width: headerWidth,
        align: 'center',
      })
      y += emissaoH + 16

      // Separador
      doc.strokeColor(borderColor).lineWidth(1)
      doc.moveTo(cardLeft + padding, y).lineTo(cardLeft + cardWidth - padding, y).stroke()
      y += 24

      // Seção de informações (grid)
      const labelWidth = 120
      const lineHeight = 22
      const contentLeft = cardLeft + padding

      const addRow = (label: string, value: string, highlight = false, valueColor?: string) => {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(textSecondary)
        doc.text(label, contentLeft, y)
        doc.font('Helvetica').fillColor(valueColor ?? textPrimary)
        if (highlight) doc.fontSize(16).font('Helvetica-Bold')
        doc.text(value, contentLeft + labelWidth, y, { width: cardWidth - padding * 2 - labelWidth })
        if (highlight) doc.fontSize(11).font('Helvetica')
        doc.fillColor(textPrimary)
        y += lineHeight
      }

      addRow('Aluno:', studentName)
      addRow('Responsável:', guardianName || '-')
      addRow('CPF do responsável:', this.formatCpf(guardianDocument))
      addRow('Turma:', turma || '-')
      addRow('Valor:', valorFormatado, true)
      addRow('Vencimento:', vencFormatado)
      addRow('Referência:', String(paymentId))
      addRow('Status:', statusLabel, false, isPaid ? statusPaidColor : status === 'overdue' ? '#DC2626' : undefined)

      y += 16

      // Separador
      doc.strokeColor(borderColor)
      doc.moveTo(cardLeft + padding, y).lineTo(cardLeft + cardWidth - padding, y).stroke()
      y += 20

      // Observação
      doc.fontSize(11).font('Helvetica')
      const obsText = isPaid
        ? 'Este documento comprova a quitação da mensalidade descrita acima.'
        : 'Este comprovante pode ser pago na secretaria da escola. Para boleto bancário com código de barras, utilize a opção "Gerar" (requer Mercado Pago configurado).'
      doc.fillColor(isPaid ? statusPaidColor : textSecondary)
      doc.text(obsText, contentLeft, y, {
        width: cardWidth - padding * 2,
        align: 'center',
      })
      y += 28
      doc.fillColor(textSecondary)

      // Separador
      doc.strokeColor(borderColor)
      doc.moveTo(cardLeft + padding, y).lineTo(cardLeft + cardWidth - padding, y).stroke()
      y += 16

      // Rodapé
      doc.fontSize(10).fillColor(textSecondary)
      doc.text('Documento gerado eletronicamente. Válido sem assinatura.', contentLeft, y, {
        width: cardWidth - padding * 2,
        align: 'center',
      })

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
