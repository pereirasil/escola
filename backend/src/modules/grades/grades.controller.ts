import { Body, Controller, ForbiddenException, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GradesService } from './grades.service'
import { ClassesService } from '../classes/classes.service'
import { CreateGradeDto } from './dto/create-grade.dto'

@Controller('notas')
@UseGuards(AuthGuard('jwt'))
export class GradesController {
  constructor(
    private service: GradesService,
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
      return all.filter((g) => classIds.includes(g.turma_id))
    }
    return this.service.findAll()
  }

  @Get('aluno/:alunoId')
  findByAluno(@Param('alunoId') alunoId: string) {
    return this.service.findByAluno(+alunoId)
  }

  @Get('turma/:turmaId/alunos')
  async findStudentsByTurma(@Param('turmaId') turmaId: string, @Req() req: { user: { id: number; role: string } }) {
    await this.ensureTeacherCanAccessClass(req.user, +turmaId)
    return this.service.findStudentsByTurma(+turmaId)
  }

  @Get('filtros')
  async findByFilters(
    @Query('turmaId') turmaId: string,
    @Query('materiaId') materiaId: string,
    @Query('bimestre') bimestre: string,
    @Req() req: { user: { id: number; role: string } },
  ) {
    await this.ensureTeacherCanAccessClass(req.user, +turmaId)
    return this.service.findByFilters(+turmaId, +materiaId, bimestre)
  }

  @Post()
  async createBulk(@Body() dtos: CreateGradeDto[], @Req() req: { user: { id: number; role: string } }) {
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
