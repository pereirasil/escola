import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StudentsService } from './students.service'
import { NotificationsService } from '../notifications/notifications.service'
import { GradesService } from '../grades/grades.service'
import { AttendanceService } from '../attendance/attendance.service'
import { SubjectsService } from '../subjects/subjects.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('students')
export class StudentsController {
  constructor(
    private service: StudentsService,
    private notificationsService: NotificationsService,
    private gradesService: GradesService,
    private attendanceService: AttendanceService,
    private subjectsService: SubjectsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll(@SchoolId() schoolId: number | undefined) {
    return this.service.findAll(schoolId)
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

  @Get('me/notifications/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async countUnreadNotifications(@Req() req: { user: { id: number } }) {
    const count = await this.notificationsService.countUnread(req.user.id)
    return { count }
  }

  @Patch('me/notifications/read')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  markNotificationsAsRead(@Req() req: { user: { id: number } }) {
    return this.notificationsService.markAllAsRead(req.user.id)
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.service.updatePassword(req.user.id, dto.currentPassword, dto.newPassword)
  }

  @Get('me/historico')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async getHistorico(@Req() req: { user: { id: number; school_id?: number } }) {
    const alunoId = req.user.id
    const schoolId = req.user.school_id

    const [notas, historicoPresenca, materias] = await Promise.all([
      this.gradesService.findByAluno(alunoId, schoolId),
      this.attendanceService.getHistoricoAluno(alunoId, schoolId),
      this.subjectsService.findAll(schoolId),
    ])

    const materiasMap = new Map(materias.map((m) => [m.id, m.name]))

    const presencasPorMateria = new Map<number, { presencas: number; faltas: number }>()
    for (const p of historicoPresenca.presencas) {
      const entry = presencasPorMateria.get(p.subject_id) || { presencas: 0, faltas: 0 }
      if (p.status === 'F') {
        entry.faltas++
      } else {
        entry.presencas++
      }
      presencasPorMateria.set(p.subject_id, entry)
    }

    const notasPorMateria = new Map<number, { bimestre: string; nota: number }[]>()
    for (const n of notas) {
      const arr = notasPorMateria.get(n.materia_id) || []
      arr.push({ bimestre: n.bimestre, nota: n.nota })
      notasPorMateria.set(n.materia_id, arr)
    }

    const materiaIds = new Set([
      ...notasPorMateria.keys(),
      ...presencasPorMateria.keys(),
    ])

    const historico = Array.from(materiaIds).map((materiaId) => ({
      materia_id: materiaId,
      materia: materiasMap.get(materiaId) || `Materia ${materiaId}`,
      notas: (notasPorMateria.get(materiaId) || []).sort((a, b) => a.bimestre.localeCompare(b.bimestre)),
      presencas: presencasPorMateria.get(materiaId)?.presencas || 0,
      faltas: presencasPorMateria.get(materiaId)?.faltas || 0,
    }))

    historico.sort((a, b) => a.materia.localeCompare(b.materia))

    return {
      historico,
      resumo: historicoPresenca.resumo,
    }
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
  create(@Body() dto: CreateStudentDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
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
