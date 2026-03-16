import { Injectable } from '@nestjs/common'
import { MailService } from './mail.service'
import type { SendEmailPayload } from './interfaces/send-email.interface'

@Injectable()
export class MailSyncQueueService {
  constructor(private mailService: MailService) {}

  async add(payload: SendEmailPayload): Promise<void> {
    setImmediate(() => {
      this.mailService.sendEmail(payload).catch((err) => {
        console.error('[MailSyncQueueService] Erro ao enviar email:', err)
      })
    })
  }
}
