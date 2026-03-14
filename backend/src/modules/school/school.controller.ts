import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StudentMessagesService } from '../student-messages/student-messages.service'
import { RespondStudentMessageDto } from '../student-messages/dto/respond-student-message.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('school')
export class SchoolController {
  constructor(private studentMessagesService: StudentMessagesService) {}

  @Get('student-messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAllStudentMessages(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.studentMessagesService.findAllForSchool(schoolId)
  }

  @Patch('student-messages/:id/respond')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  respondToMessage(
    @Param('id') id: string,
    @Body() dto: RespondStudentMessageDto,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.studentMessagesService.respond(+id, dto.response, schoolId)
  }
}
