import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { StudentsService } from './students.service'
import { NotificationsService } from '../notifications/notifications.service'
import { GradesService } from '../grades/grades.service'
import { AttendanceService } from '../attendance/attendance.service'
import { SubjectsService } from '../subjects/subjects.service'
import { SchedulesService } from '../schedules/schedules.service'
import { ClassesService } from '../classes/classes.service'
import { TeachersService } from '../teachers/teachers.service'
import { TeacherScopeService } from '../../common/services/teacher-scope.service'
import { CalendarEventsService } from '../calendar-events/calendar-events.service'
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
    private schedulesService: SchedulesService,
    private classesService: ClassesService,
    private teachersService: TeachersService,
    private teacherScope: TeacherScopeService,
    private calendarEventsService: CalendarEventsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll(
    @SchoolId() schoolId: number | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    if (q !== undefined) {
      return this.service.search(schoolId, q, +(limit || 20))
    }
    if (page) {
      return this.service.findAllPaginated(schoolId, +page, +(limit || 10))
    }
    return this.service.findAll(schoolId)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  findMe(@Req() req: { user: { id: number } }) {
    return this.service.findOne(req.user.id)
  }

  @Get('me/header-info')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  getMyHeaderInfo(@Req() req: { user: { id: number } }) {
    return this.service.getHeaderInfo(req.user.id)
  }

  @Get('me/notifications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async findMyNotifications(@Req() req: { user: { id: number } }) {
    const events = await this.calendarEventsService.findForStudent(req.user.id)
    await this.notificationsService.ensureForCalendarEvents(req.user.id, events)
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

  @Post('me/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `student-${unique}${extname(file.originalname)}`)
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
        cb(null, true)
      } else {
        cb(new Error('Apenas imagens JPG, PNG ou WEBP'), false)
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadMyPhoto(
    @Req() req: { user: { id: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updatePhoto(req.user.id, file.filename)
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.service.updatePassword(req.user.id, dto.currentPassword, dto.newPassword)
  }

  @Get('me/schedules')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async getMySchedules(@Req() req: { user: { id: number; school_id?: number } }) {
    const student = await this.service.findOne(req.user.id)
    if (!student?.class_id) return []

    const turma = await this.classesService.findOne(student.class_id)

    const [allSchedules, materias] = await Promise.all([
      this.schedulesService.findAll(student.class_id, req.user.school_id),
      this.subjectsService.findAll(req.user.school_id),
    ])

    const schedules = turma?.room
      ? allSchedules.filter((s) => s.room === turma.room)
      : allSchedules

    const materiasMap = new Map(materias.map((m) => [m.id, m.name]))

    const teacherIds = [...new Set(schedules.map((s) => s.teacher_id).filter(Boolean))]
    const teachers = await Promise.all(
      teacherIds.map((tid) => this.teachersService.findOne(tid).catch(() => null)),
    )
    const teachersMap = new Map(
      teachers.filter(Boolean).map((t) => [t!.id, t!.name]),
    )

    return schedules.map((s) => ({
      id: s.id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      room: s.room,
      materia: materiasMap.get(s.subject_id) || '-',
      professor: teachersMap.get(s.teacher_id) || '-',
    }))
  }

  @Get('me/historico')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async getHistorico(@Req() req: { user: { id: number; school_id?: number } }) {
    const alunoId = req.user.id
    const schoolId = req.user.school_id

    const [notas, historicoPresenca, materias, schedules] = await Promise.all([
      this.gradesService.findByAluno(alunoId, schoolId),
      this.attendanceService.getHistoricoAluno(alunoId, schoolId),
      this.subjectsService.findAll(schoolId),
      this.schedulesService.findAll(undefined, schoolId),
    ])

    const materiasMap = new Map(materias.map((m) => [m.id, m.name]))

    const scheduleMap = new Map<string, { start_time: string; end_time: string }>()
    for (const s of schedules) {
      scheduleMap.set(`${s.class_id}-${s.subject_id}-${s.day_of_week}`, { start_time: s.start_time, end_time: s.end_time })
    }

    const getDayOfWeek = (dateStr: string): string => {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      const d = new Date(dateStr + 'T12:00:00')
      return days[d.getDay()]
    }

    const presencasPorMateria = new Map<number, { presencas: number; faltas: number; registros: { date: string; lesson: string; status: string; observation?: string; start_time?: string; end_time?: string }[] }>()
    for (const p of historicoPresenca.presencas) {
      const entry = presencasPorMateria.get(p.subject_id) || { presencas: 0, faltas: 0, registros: [] }
      if (p.status === 'F') {
        entry.faltas++
      } else {
        entry.presencas++
      }
      const dayOfWeek = getDayOfWeek(p.date)
      const schedule = scheduleMap.get(`${p.class_id}-${p.subject_id}-${dayOfWeek}`)
      entry.registros.push({
        date: p.date,
        lesson: p.lesson,
        status: p.status,
        observation: p.observation,
        start_time: schedule?.start_time,
        end_time: schedule?.end_time,
      })
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
      materia: materiasMap.get(materiaId) || `Matéria ${materiaId}`,
      notas: (notasPorMateria.get(materiaId) || []).sort((a, b) => a.bimestre.localeCompare(b.bimestre)),
      presencas: presencasPorMateria.get(materiaId)?.presencas || 0,
      faltas: presencasPorMateria.get(materiaId)?.faltas || 0,
      registros: (presencasPorMateria.get(materiaId)?.registros || []).sort((a, b) => b.date.localeCompare(a.date)),
    }))

    historico.sort((a, b) => a.materia.localeCompare(b.materia))

    const TIPOS_PADRAO = ['Trabalho', 'Teste', 'Prova']
    const avaliacoesPorDisciplina: Array<{ materia_id: number; materia: string; bimestre: string; avaliacoes: Array<{ tipo: string; valor: number; nota: number | null }> }> = []

    for (const item of historico) {
      for (const { bimestre, nota } of item.notas) {
        const avaliacoes = TIPOS_PADRAO.map((tipo, idx) => ({
          tipo,
          valor: 10,
          nota: idx === 2 ? nota : null,
        }))
        avaliacoesPorDisciplina.push({
          materia_id: item.materia_id,
          materia: item.materia,
          bimestre,
          avaliacoes,
        })
      }
    }

    return {
      historico,
      resumo: historicoPresenca.resumo,
      avaliacoesPorDisciplina: avaliacoesPorDisciplina.sort((a, b) =>
        a.materia.localeCompare(b.materia) || a.bimestre.localeCompare(b.bimestre),
      ),
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const numId = +id
    if (req.user.role === 'student' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    await this.teacherScope.ensureStudentAccess(req.user, numId)
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
    if (req.user.role === 'teacher') {
      throw new ForbiddenException('Professor não pode editar dados de alunos')
    }
    if (req.user.role === 'student' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.update(numId, dto)
  }

  @Post(':id/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `student-${unique}${extname(file.originalname)}`)
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
        cb(null, true)
      } else {
        cb(new Error('Apenas imagens JPG, PNG ou WEBP'), false)
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updatePhoto(+id, file.filename)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
