import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notification } from './entities/notification.entity'
import { Student } from '../students/entities/student.entity'
import { Class } from '../classes/entities/class.entity'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Student, Class])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
