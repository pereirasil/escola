import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { MAIL_QUEUE_NAME } from './mail.processor'
import type { SendEmailPayload } from './interfaces/send-email.interface'

@Injectable()
export class MailQueueService {
  constructor(
    @InjectQueue(MAIL_QUEUE_NAME)
    private queue: Queue<SendEmailPayload>,
  ) {}

  async add(payload: SendEmailPayload): Promise<void> {
    await this.queue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 86400 },
    })
  }
}
