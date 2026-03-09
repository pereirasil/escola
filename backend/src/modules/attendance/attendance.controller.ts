import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'

@Controller('presencas')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get('ranking-faltas')
  getRankingFaltas() {
    return this.service.getRankingFaltas()
  }

  @Get('relatorio/turma/:turmaId')
  getFaltasPorTurma(@Param('turmaId') turmaId: string) {
    return this.service.getFaltasPorTurma(+turmaId)
  }

  @Get('historico/aluno/:alunoId')
  getHistoricoAluno(@Param('alunoId') alunoId: string) {
    return this.service.getHistoricoAluno(+alunoId)
  }

  @Get('turma/:turmaId')
  findByTurma(@Param('turmaId') turmaId: string) {
    return this.service.findStudentsByTurma(+turmaId)
  }

  @Post()
  createBulk(@Body() dtos: CreateAttendanceDto[]) {
    if (!Array.isArray(dtos)) {
      dtos = [dtos];
    }
    return this.service.createBulk(dtos)
  }
}
