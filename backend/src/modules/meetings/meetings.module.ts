import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Meeting } from './entities/meeting.entity'
import { Message } from './entities/message.entity'
import { MeetingsService } from './meetings.service'
import { MeetingsController } from './meetings.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Message]), NotificationsModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
