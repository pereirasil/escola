import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AttendanceService } from './attendance.service'
import { ClassesService } from '../classes/classes.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'

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
  async findAll(@Req() req: { user: { id: number; role: string } }) {
    if (req.user.role === 'teacher') {
      const classes = await this.classesService.findByTeacherId(req.user.id)
      const classIds = classes.map((c) => c.id)
      const all = await this.service.findAll()
      return all.filter((p) => classIds.includes(p.class_id))
    }
    return this.service.findAll()
  }

  @Get('ranking-faltas')
  getRankingFaltas(@Req() req: { user: { id: number; role: string } }) {
    if (req.user.role === 'teacher') {
      return this.service.getRankingFaltasByTeacherId(req.user.id)
    }
    return this.service.getRankingFaltas()
  }

  @Get('relatorio/turma/:turmaId')
  async getFaltasPorTurma(@Param('turmaId') turmaId: string, @Req() req: { user: { id: number; role: string } }) {
    await this.ensureTeacherCanAccessClass(req.user, +turmaId)
    return this.service.getFaltasPorTurma(+turmaId)
  }

  @Get('historico/aluno/:alunoId')
  getHistoricoAluno(@Param('alunoId') alunoId: string) {
    return this.service.getHistoricoAluno(+alunoId)
  }

  @Get('turma/:turmaId')
  async findByTurma(@Param('turmaId') turmaId: string, @Req() req: { user: { id: number; role: string } }) {
    await this.ensureTeacherCanAccessClass(req.user, +turmaId)
    return this.service.findStudentsByTurma(+turmaId)
  }

  @Post()
  async createBulk(@Body() dtos: CreateAttendanceDto[], @Req() req: { user: { id: number; role: string } }) {
    if (!Array.isArray(dtos)) {
      dtos = [dtos]
    }
    const classIds = [...new Set(dtos.map((d) => d.turma_id))]
    for (const classId of classIds) {
      await this.ensureTeacherCanAccessClass(req.user, classId)
    }
    return this.service.createBulk(dtos)
  }
}
