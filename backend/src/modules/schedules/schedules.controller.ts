import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchoolId } from '../../common/decorators/school-id.decorator';

@Controller('schedules')
@UseGuards(AuthGuard('jwt'))
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto, @SchoolId() schoolId: number | undefined) {
    return this.schedulesService.create(createScheduleDto, schoolId);
  }

  @Get()
  findAll(@Query('class_id') classId?: string, @SchoolId() schoolId?: number) {
    return this.schedulesService.findAll(classId ? +classId : undefined, schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto, @SchoolId() schoolId?: number) {
    return this.schedulesService.update(+id, updateScheduleDto, schoolId);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto, @SchoolId() schoolId?: number) {
    return this.schedulesService.update(+id, updateScheduleDto, schoolId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
}
