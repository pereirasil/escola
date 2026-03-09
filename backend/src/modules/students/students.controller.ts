import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StudentsService } from './students.service'
import { NotificationsService } from '../notifications/notifications.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('students')
export class StudentsController {
  constructor(
    private service: StudentsService,
    private notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll() {
    return this.service.findAll()
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  findMe(@Req() req: { user: { id: number } }) {
    return this.service.findOne(req.user.id)
  }

  @Get('me/notifications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  findMyNotifications(@Req() req: { user: { id: number } }) {
    return this.notificationsService.findByStudentId(req.user.id)
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.service.updatePassword(req.user.id, dto.currentPassword, dto.newPassword)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const numId = +id
    if (req.user.role === 'student' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.findOne(numId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const numId = +id
    if (req.user.role === 'student' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.update(numId, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
