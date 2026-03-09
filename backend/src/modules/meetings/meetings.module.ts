import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Meeting } from './entities/meeting.entity'
import { Message } from './entities/message.entity'
import { MeetingsService } from './meetings.service'
import { MeetingsController } from './meetings.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Message])],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
