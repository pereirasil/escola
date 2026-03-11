import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CalendarEvent } from './entities/calendar-event.entity'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { CalendarEventsService } from './calendar-events.service'
import { CalendarEventsController } from './calendar-events.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent, Student, Class]), NotificationsModule],
  controllers: [CalendarEventsController],
  providers: [CalendarEventsService],
})
export class CalendarEventsModule {}
