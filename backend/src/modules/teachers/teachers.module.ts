import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Teacher } from './entities/teacher.entity'
import { Class } from '../classes/entities/class.entity'
import { TeachersService } from './teachers.service'
import { TeachersController } from './teachers.controller'
import { ClassesModule } from '../classes/classes.module'

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Class]), ClassesModule],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
