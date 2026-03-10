import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SchedulesService } from './schedules.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('schedules')
@UseGuards(AuthGuard('jwt'))
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('me')
  findMine(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.schedulesService.findByTeacherId(req.user.id, req.user.school_id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'school')
  create(@Body() createScheduleDto: CreateScheduleDto, @SchoolId() schoolId: number | undefined) {
    return this.schedulesService.create(createScheduleDto, schoolId)
  }

  @Get()
  findAll(@Query('class_id') classId?: string, @SchoolId() schoolId?: number) {
    return this.schedulesService.findAll(classId ? +classId : undefined, schoolId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id)
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'school')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto, @SchoolId() schoolId?: number) {
    return this.schedulesService.update(+id, updateScheduleDto, schoolId)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'school')
  patch(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto, @SchoolId() schoolId?: number) {
    return this.schedulesService.update(+id, updateScheduleDto, schoolId)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'school')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id)
  }
}
