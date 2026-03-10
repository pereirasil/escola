import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { TeacherScopeService } from '../../common/services/teacher-scope.service'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('presencas')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(
    private service: AttendanceService,
    private teacherScope: TeacherScopeService,
  ) {}

  @Get()
  async findAll(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    if (req.user.role === 'teacher') {
      const classIds = await this.teacherScope.getTeacherClassIds(req.user)
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
    await this.teacherScope.ensureClassAccess(req.user, +turmaId)
    return this.service.getFaltasPorTurma(+turmaId, schoolId)
  }

  @Get('historico/aluno/:alunoId')
  async getHistoricoAluno(
    @Param('alunoId') alunoId: string,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.teacherScope.ensureStudentAccess(req.user, +alunoId)
    return this.service.getHistoricoAluno(+alunoId, schoolId)
  }

  @Get('turma/:turmaId')
  async findByTurma(
    @Param('turmaId') turmaId: string,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.teacherScope.ensureClassAccess(req.user, +turmaId)
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
    for (const dto of dtos) {
      await this.teacherScope.ensureClassSubjectAccess(req.user, dto.turma_id, dto.materia_id)
    }
    return this.service.createBulk(dtos, schoolId)
  }
}
