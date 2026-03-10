import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GradesService } from './grades.service'
import { CreateGradeDto } from './dto/create-grade.dto'
import { TeacherScopeService } from '../../common/services/teacher-scope.service'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('notas')
@UseGuards(AuthGuard('jwt'))
export class GradesController {
  constructor(
    private service: GradesService,
    private teacherScope: TeacherScopeService,
  ) {}

  @Get()
  async findAll(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    if (req.user.role === 'teacher') {
      const classIds = await this.teacherScope.getTeacherClassIds(req.user)
      const all = await this.service.findAll(req.user.school_id)
      return all.filter((g) => classIds.includes(g.turma_id))
    }
    return this.service.findAll(schoolId)
  }

  @Get('aluno/:alunoId')
  async findByAluno(
    @Param('alunoId') alunoId: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.teacherScope.ensureStudentAccess(req.user, +alunoId)
    return this.service.findByAluno(+alunoId, schoolId)
  }

  @Get('turma/:turmaId/alunos')
  async findStudentsByTurma(
    @Param('turmaId') turmaId: string,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.teacherScope.ensureClassAccess(req.user, +turmaId)
    return this.service.findStudentsByTurma(+turmaId, schoolId)
  }

  @Get('filtros')
  async findByFilters(
    @Query('turmaId') turmaId: string,
    @Query('materiaId') materiaId: string,
    @Query('bimestre') bimestre: string,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    await this.teacherScope.ensureClassSubjectAccess(req.user, +turmaId, +materiaId)
    return this.service.findByFilters(+turmaId, +materiaId, bimestre, schoolId)
  }

  @Post()
  async createBulk(
    @Body() dtos: CreateGradeDto[],
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

  @Put(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() dto: CreateGradeDto,
    @Req() req: { user: { id: number; role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    const existing = await this.service.findOne(+id)
    if (existing) {
      await this.teacherScope.ensureClassSubjectAccess(req.user, existing.turma_id, existing.materia_id)
    }
    await this.teacherScope.ensureClassSubjectAccess(req.user, dto.turma_id, dto.materia_id)
    return this.service.updateOne(+id, dto, schoolId)
  }

  @Delete(':id')
  async deleteOne(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const existing = await this.service.findOne(+id)
    if (existing) {
      await this.teacherScope.ensureClassSubjectAccess(req.user, existing.turma_id, existing.materia_id)
    }
    return this.service.deleteOne(+id)
  }
}
