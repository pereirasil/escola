import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailService } from './mail.service'
import { MailQueueService } from './mail-queue.service'
import { MailSyncQueueService } from './mail-sync-queue.service'
import { MailProcessor } from './mail.processor'
import { MailTemplatesService } from './mail-templates.service'
import { EmailLog } from './entities/email-log.entity'
import { MAIL_QUEUE_NAME } from './mail.processor'

function isRedisConfigured(): boolean {
  if (process.env.REDIS_ENABLED === 'false') return false
  if (process.env.REDIS_URL) return true
  if (process.env.REDIS_HOST && process.env.REDIS_HOST !== '') return true
  return false
}

const useRedis = isRedisConfigured()

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailLog]),
    ...(useRedis ? [BullModule.registerQueue({ name: MAIL_QUEUE_NAME })] : []),
  ],
  providers: [
    MailService,
    MailTemplatesService,
    {
      provide: MailQueueService,
      useClass: useRedis ? MailQueueService : MailSyncQueueService,
    },
    ...(useRedis ? [MailProcessor] : []),
  ],
  exports: [MailService, MailQueueService],
})
export class MailModule {}
