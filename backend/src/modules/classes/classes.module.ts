import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from './entities/class.entity'
import { Enrollment } from './entities/enrollment.entity'
import { ClassesService } from './classes.service'
import { ClassesController } from './classes.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, Enrollment]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
