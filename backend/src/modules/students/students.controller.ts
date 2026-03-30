import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
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
import { ResponsiblesService } from '../responsibles/responsibles.service'
import { CalendarEventsService } from '../calendar-events/calendar-events.service'
import { MeetingsService } from '../meetings/meetings.service'
import { StudentMessagesService } from '../student-messages/student-messages.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { UpdateStudentStatusDto } from './dto/update-student-status.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateStudentMessageDto } from '../student-messages/dto/create-student-message.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'
import { getEffectiveStudentId, getEffectiveSchoolId } from '../../common/helpers/student-context.helper'

function parseIncludeInactive(v?: string): boolean {
  return v === '1' || v === 'true'
}

function parseListStatus(includeInactive?: string, status?: string): 'active' | 'inactive' | 'all' {
  if (parseIncludeInactive(includeInactive)) return 'all'
  if (status === 'inactive') return 'inactive'
  return 'active'
}

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
    private responsiblesService: ResponsiblesService,
    private calendarEventsService: CalendarEventsService,
    private meetingsService: MeetingsService,
    private studentMessagesService: StudentMessagesService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll(
    @SchoolId() schoolId: number | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('include_inactive') includeInactive?: string,
    @Query('status') status?: string,
    @Req() req?: { user: { role: string } },
  ) {
    const isAdmin = req?.user?.role === 'admin'
    const listStatus = parseListStatus(includeInactive, status)
    if (q !== undefined) {
      return this.service.search(schoolId, q, +(limit || 20), isAdmin, listStatus)
    }
    if (page) {
      return this.service.findAllPaginated(schoolId, +page, +(limit || 10), isAdmin, listStatus)
    }
    return this.service.findAll(schoolId, isAdmin, listStatus)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  findMe(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    return this.service.findOne(studentId)
  }

  @Get('me/header-info')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  getMyHeaderInfo(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    return this.service.getHeaderInfo(studentId)
  }

  @Get('me/teachers')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  findMyTeachers(@Req() req: { user: { role: string; student_id?: number; school_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    return this.classesService.findTeachersByStudentId(studentId, req.user.school_id)
  }

  @Get('me/notifications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  async findMyNotifications(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    const events = await this.calendarEventsService.findForStudent(studentId)
    await this.notificationsService.ensureForCalendarEvents(studentId, events)
    return this.notificationsService.findByStudentId(studentId)
  }

  @Get('me/notifications/count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  async countUnreadNotifications(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    const count = await this.notificationsService.countUnread(studentId)
    return { count }
  }

  @Patch('me/notifications/read')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  markNotificationsAsRead(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    return this.notificationsService.markAllAsRead(studentId)
  }

  @Post('me/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  async createMyMessage(
    @Req() req: { user: { role: string; student_id?: number; school_id?: number } },
    @Body() dto: CreateStudentMessageDto,
  ) {
    const studentId = getEffectiveStudentId(req)
    return this.studentMessagesService.create(
      studentId,
      dto.subject,
      dto.message,
      req.user.school_id,
    )
  }

  @Get('me/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  findMyMessages(@Req() req: { user: { role: string; student_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    return this.studentMessagesService.findByStudentId(studentId)
  }

  @Post('me/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
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
    @Req() req: { user: { role: string; student_id?: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const studentId = getEffectiveStudentId(req)
    return this.service.updatePhoto(studentId, file.filename)
  }

  @Get('me/schedules')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  async getMySchedules(@Req() req: { user: { role: string; student_id?: number; school_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    const student = await this.service.findOne(studentId)
    if (!student?.class_id) return []

    const turma = await this.classesService.findOne(student.class_id)

    const schoolId = getEffectiveSchoolId(req)
    const [allSchedules, materias] = await Promise.all([
      this.schedulesService.findAll(student.class_id, schoolId),
      this.subjectsService.findAll(schoolId),
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
  @Roles('responsible')
  async getHistorico(@Req() req: { user: { role: string; student_id?: number; school_id?: number } }) {
    const alunoId = getEffectiveStudentId(req)
    const schoolId = getEffectiveSchoolId(req)

    const [notas, historicoPresenca, materias] = await Promise.all([
      this.gradesService.findByAluno(alunoId, schoolId),
      this.attendanceService.getHistoricoAluno(alunoId, schoolId),
      this.subjectsService.findAll(schoolId),
    ])

    const materiasMap = new Map(materias.map((m) => [m.id, m.name]))

    const presencasPorMateria = new Map<number, { data: string; aula: string; status: string; observacao: string | null }[]>()
    for (const p of historicoPresenca.presencas) {
      const entry = presencasPorMateria.get(p.subject_id) || []
      entry.push({
        data: p.date,
        aula: p.lesson ?? '',
        status: p.status,
        observacao: p.observation ?? null,
      })
      presencasPorMateria.set(p.subject_id, entry)
    }

    for (const [, registros] of presencasPorMateria) {
      registros.sort((a, b) => b.data.localeCompare(a.data))
    }

    const historico: Array<{
      materia: string
      bimestre: number
      nota: number
      presencas: Array<{ data: string; aula: string; status: string; observacao: string | null }>
    }> = []

    for (const n of notas) {
      const materia = materiasMap.get(n.materia_id) || `Matéria ${n.materia_id}`
      const bimestreNum = parseInt(n.bimestre, 10) || 1
      const presencas = (presencasPorMateria.get(n.materia_id) || []).map((r) => ({ ...r }))

      historico.push({
        materia,
        bimestre: bimestreNum,
        nota: Number(n.nota),
        presencas,
      })
    }

    const materiaIdsComPresenca = new Set(presencasPorMateria.keys())
    for (const materiaId of materiaIdsComPresenca) {
      if (!notas.some((n) => n.materia_id === materiaId)) {
        const materia = materiasMap.get(materiaId) || `Matéria ${materiaId}`
        const presencas = (presencasPorMateria.get(materiaId) || []).map((r) => ({ ...r }))
        historico.push({
          materia,
          bimestre: 1,
          nota: 0,
          presencas,
        })
      }
    }

    historico.sort((a, b) => a.materia.localeCompare(b.materia) || a.bimestre - b.bimestre)

    const TIPOS_PADRAO = ['Trabalho', 'Teste', 'Prova']
    const avaliacoesPorDisciplina: Array<{
      materia: string
      bimestre: number
      avaliacoes: Array<{ tipo: string; nota: number | null }>
    }> = []

    for (const n of notas) {
      const materia = materiasMap.get(n.materia_id) || `Matéria ${n.materia_id}`
      const bimestreNum = parseInt(n.bimestre, 10) || 1
      const avaliacoes = TIPOS_PADRAO.map((tipo, idx) => ({
        tipo,
        nota: idx === 2 ? Number(n.nota) : null,
      }))

      avaliacoesPorDisciplina.push({
        materia,
        bimestre: bimestreNum,
        avaliacoes,
      })
    }

    avaliacoesPorDisciplina.sort(
      (a, b) => a.materia.localeCompare(b.materia) || a.bimestre - b.bimestre,
    )

    return {
      resumo: historicoPresenca.resumo,
      historico,
      avaliacoesPorDisciplina,
    }
  }

  @Get('me/meetings')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('responsible')
  async getMyMeetings(@Req() req: { user: { role: string; student_id?: number; school_id?: number } }) {
    const studentId = getEffectiveStudentId(req)
    const schoolId = getEffectiveSchoolId(req)
    const student = await this.service.findOne(studentId)
    const classIds: number[] = []

    if (student?.class_id) {
      classIds.push(student.class_id)
      const studentClass = await this.classesService.findOne(student.class_id)
      if (studentClass?.grade) {
        const sameGradeClasses = await this.classesService.findAll(schoolId)
        for (const c of sameGradeClasses) {
          if (c.grade === studentClass.grade && c.id !== student.class_id) {
            classIds.push(c.id)
          }
        }
      }
    }

    const meetings = await this.meetingsService.findByClassIdsOrGeneral(classIds, schoolId)

    return meetings.map((m) => {
      const scheduled = m.scheduled_at ? new Date(m.scheduled_at) : null
      const data = scheduled ? scheduled.toISOString().slice(0, 10) : ''
      const horario = scheduled ? scheduled.toTimeString().slice(0, 5) : ''
      return {
        id: m.id,
        titulo: m.title,
        descricao: m.description ?? '',
        data,
        horario,
        local: null,
        tipo: 'Reuniao',
      }
    })
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const numId = +id
    if (req.user.role === 'responsible') {
      await this.responsiblesService.ensureAccessToStudent(req.user.id, numId)
    } else {
      await this.teacherScope.ensureStudentAccess(req.user, numId)
    }
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.service.findOne(numId, schoolId)
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
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const numId = +id
    if (req.user.role === 'teacher') {
      throw new ForbiddenException('Professor não pode editar dados de alunos')
    }
    if (req.user.role === 'responsible') {
      await this.responsiblesService.ensureAccessToStudent(req.user.id, numId)
    }
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.service.update(numId, dto, schoolId)
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
    @Req() req: { user: { role: string; school_id?: number } },
    @SchoolId() schoolId: number | undefined,
  ) {
    const sid = req.user.role === 'admin' ? undefined : schoolId ?? req.user.school_id
    return this.service.updatePhoto(+id, file.filename, sid)
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStudentStatusDto,
    @Req() req: { user: { role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    return this.service.updateStatus(+id, dto.status, req.user.role === 'admin' ? undefined : schoolId)
  }
}
