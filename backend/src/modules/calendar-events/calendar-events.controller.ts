import { Body, Controller, Get, Post, Put, Delete, Param, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CalendarEventsService } from './calendar-events.service'
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto'
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto'
import { SchoolId } from '../../common/decorators/school-id.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'
import { getEffectiveStudentId } from '../../common/helpers/student-context.helper'

@Controller('calendar-events')
@UseGuards(AuthGuard('jwt'))
export class CalendarEventsController {
  constructor(private service: CalendarEventsService) {}

  @Get()
  findAll(@SchoolId() schoolId: number | undefined) {
    return this.service.findAll(schoolId)
  }

  @Get('student/me')
  @UseGuards(RolesGuard)
  @Roles('responsible')
  findForStudent(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    return this.service.findForStudent(studentId)
  }

  @Post()
  create(@Body() dto: CreateCalendarEventDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCalendarEventDto) {
    return this.service.update(+id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
