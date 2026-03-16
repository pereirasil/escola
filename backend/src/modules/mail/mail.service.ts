import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { Repository } from 'typeorm'
import { MailTemplatesService } from './mail-templates.service'
import { EmailLog } from './entities/email-log.entity'
import type { MailAttachment, SendEmailPayload } from './interfaces/send-email.interface'

@Injectable()
export class MailService {
  private transporter: Transporter | null = null

  constructor(
    private templates: MailTemplatesService,
    @InjectRepository(EmailLog)
    private emailLogRepo: Repository<EmailLog>,
  ) {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
    const user = process.env.EMAIL_USER || process.env.SMTP_USER
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    }
  }

  async sendEmail(payload: SendEmailPayload): Promise<boolean> {
    const { to, subject, template, data, attachments, schoolId } = payload

    const html = this.templates.render(template, { ...data, subject })
    const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER

    const mailOptions: nodemailer.SendMailOptions = {
      from: from || 'noreply@escola.com',
      to,
      subject,
      html,
    }
    if (attachments?.length) {
      mailOptions.attachments = attachments.map((a) => {
        if (a.content) {
          const buf = Buffer.isBuffer(a.content)
            ? a.content
            : Buffer.from(
                (typeof a.content === 'object' && a.content && 'data' in a.content ? a.content.data : []) as number[],
              )
          return { filename: a.filename, content: buf }
        }
        return { filename: a.filename, path: a.path }
      })
    }

    if (!this.transporter) {
      console.log('[MailService] SMTP não configurado. Email simulado:', { to, subject })
      await this.logEmail(to, subject, 'skipped', null, schoolId)
      return false
    }

    try {
      await this.transporter.sendMail(mailOptions)
      await this.logEmail(to, subject, 'sent', null, schoolId)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[MailService] Erro ao enviar email:', msg)
      await this.logEmail(to, subject, 'failed', msg, schoolId)
      return false
    }
  }

  private async logEmail(
    to: string,
    subject: string,
    status: string,
    error: string | null,
    schoolId?: number,
  ): Promise<void> {
    try {
      await this.emailLogRepo.save(
        this.emailLogRepo.create({
          to,
          subject,
          status,
          error: error ?? undefined,
          school_id: schoolId,
        }),
      )
    } catch (err) {
      console.error('[MailService] Erro ao registrar log:', err)
    }
  }
}
