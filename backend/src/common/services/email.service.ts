import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null

  constructor() {
    const host = process.env.SMTP_HOST
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const port = Number(process.env.SMTP_PORT) || 587

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    }
  }

  async sendBoletoEmail(
    to: string,
    studentName: string,
    amount: number,
    dueDate: string,
    boletoUrl: string,
  ): Promise<void> {
    const valorFormatado = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    const subject = `Boleto de mensalidade - ${valorFormatado} - Vencimento ${dueDate}`
    const html = `
      <p>Olá, ${studentName}</p>
      <p>Segue o boleto da sua mensalidade:</p>
      <p><strong>Valor:</strong> ${valorFormatado}</p>
      <p><strong>Vencimento:</strong> ${dueDate}</p>
      <p><a href="${boletoUrl}" target="_blank">Clique aqui para visualizar e pagar o boleto</a></p>
      <p>Atenciosamente,<br>Equipe Escolar</p>
    `
    const text = `Boleto de mensalidade. Valor: ${valorFormatado}. Vencimento: ${dueDate}. Acesse: ${boletoUrl}`

    if (this.transporter) {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      })
    } else {
      console.log('[EmailService] SMTP não configurado. Email simulado:', {
        to,
        subject,
        valor: valorFormatado,
        vencimento: dueDate,
        boletoUrl,
      })
    }
  }

  async sendBoletoEmailWithAttachment(
    to: string,
    studentName: string,
    amount: number,
    dueDate: string,
    pdfBuffer: Buffer,
    filename: string,
  ): Promise<void> {
    const valorFormatado = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    const subject = `Boleto de mensalidade - ${valorFormatado} - Vencimento ${dueDate}`
    const html = `
      <p>Olá, ${studentName}</p>
      <p>Segue em anexo o boleto da sua mensalidade.</p>
      <p><strong>Valor:</strong> ${valorFormatado}</p>
      <p><strong>Vencimento:</strong> ${dueDate}</p>
      <p>Atenciosamente,<br>Equipe Escolar</p>
    `
    const text = `Boleto de mensalidade. Valor: ${valorFormatado}. Vencimento: ${dueDate}. Ver PDF em anexo.`

    if (this.transporter) {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
        attachments: [{ filename, content: pdfBuffer }],
      })
    } else {
      console.log('[EmailService] SMTP não configurado. Email com PDF simulado:', {
        to,
        subject,
        valor: valorFormatado,
        vencimento: dueDate,
        attachment: filename,
      })
    }
  }
}
