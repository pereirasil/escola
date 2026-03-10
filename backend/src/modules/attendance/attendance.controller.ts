import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AttendanceService } from './attendance.service'
import { ClassesService } from '../classes/classes.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('presencas')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(
    private service: AttendanceService,
    private classesService: ClassesService,
  ) {}

  private async ensureTeacherCanAccessClass(user: { id: number; role: string }, classId: number) {
    if (user.role !== 'teacher') return
    const classEntity = await this.classesService.findOne(classId)
    if (!classEntity || classEntity.teacher_id !== user.id) {
      throw new ForbiddenException('Acesso negado a esta turma')
    }
  }

  @Get()
  async findAll(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    if (req.user.role === 'teacher') {
      const classes = await this.classesService.findByTeacherId(req.user.id, req.user.school_id)
      const classIds = classes.map((c) => c.id)
      const all = await this.service.findAll(req.user.school_id)
      return all.filter((p) => classIds.includes(p.class_id))
    }
    return this.service.findAll(schoolId)
  }

  @Get('ranking-faltas')
  getRankingFaltas(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    if (req.user.role === 'teacher') {
      return this.service.getRankingFaltasByTeacherId(req.user.id, req.user.school_id)
    }
    return this.service.getRankingFaltas(schoolId)
  }

  @Get('relatorio/turma/:turmaId')
  async getFaltasPorTurma(
    @Param('turmaId') turmaId: string,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.ensureTeacherCanAccessClass(req.user, +turmaId)
    return this.service.getFaltasPorTurma(+turmaId, schoolId)
  }

  @Get('historico/aluno/:alunoId')
  getHistoricoAluno(@Param('alunoId') alunoId: string, @SchoolId() schoolId: number | undefined) {
    return this.service.getHistoricoAluno(+alunoId, schoolId)
  }

  @Get('turma/:turmaId')
  async findByTurma(
    @Param('turmaId') turmaId: string,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.ensureTeacherCanAccessClass(req.user, +turmaId)
    return this.service.findStudentsByTurma(+turmaId, schoolId)
  }

  @Post()
  async createBulk(
    @Body() dtos: CreateAttendanceDto[],
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    if (!Array.isArray(dtos)) {
      dtos = [dtos]
    }
    const classIds = [...new Set(dtos.map((d) => d.turma_id))]
    for (const classId of classIds) {
      await this.ensureTeacherCanAccessClass(req.user, classId)
    }
    return this.service.createBulk(dtos, schoolId)
  }
}
