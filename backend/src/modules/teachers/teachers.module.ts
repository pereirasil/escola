import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Teacher } from './entities/teacher.entity'
import { TeachersService } from './teachers.service'
import { TeachersController } from './teachers.controller'
import { ClassesModule } from '../classes/classes.module'

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), ClassesModule],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
