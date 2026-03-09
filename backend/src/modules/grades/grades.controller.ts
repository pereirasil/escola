import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { GradesService } from './grades.service'
import { CreateGradeDto } from './dto/create-grade.dto'

@Controller('notas')
export class GradesController {
  constructor(private service: GradesService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get('aluno/:alunoId')
  findByAluno(@Param('alunoId') alunoId: string) {
    return this.service.findByAluno(+alunoId)
  }

  @Get('turma/:turmaId/alunos')
  findStudentsByTurma(@Param('turmaId') turmaId: string) {
    return this.service.findStudentsByTurma(+turmaId)
  }

  @Get('filtros')
  findByFilters(
    @Query('turmaId') turmaId: string,
    @Query('materiaId') materiaId: string,
    @Query('bimestre') bimestre: string
  ) {
    return this.service.findByFilters(+turmaId, +materiaId, bimestre)
  }

  @Post()
  createBulk(@Body() dtos: CreateGradeDto[]) {
    if (!Array.isArray(dtos)) {
      dtos = [dtos];
    }
    return this.service.createBulk(dtos)
  }
}
