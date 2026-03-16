import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Job } from 'bullmq'
import { MailService } from './mail.service'
import type { SendEmailPayload } from './interfaces/send-email.interface'

export const MAIL_QUEUE_NAME = 'mail'

@Injectable()
@Processor(MAIL_QUEUE_NAME)
export class MailProcessor extends WorkerHost {
  constructor(private mailService: MailService) {
    super()
  }

  async process(job: Job<SendEmailPayload>): Promise<void> {
    await this.mailService.sendEmail(job.data)
  }
}
