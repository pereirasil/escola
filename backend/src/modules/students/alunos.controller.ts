import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { StudentsService } from './students.service'
import { BoletimPdfService } from './services/boletim-pdf.service'
import { PresencaHistoricoPdfService } from './services/presenca-historico-pdf.service'
import { TeacherScopeService } from '../../common/services/teacher-scope.service'
import { ResponsiblesService } from '../responsibles/responsibles.service'

function sanitizeBoletimFilename(name: string): string {
  const s = (name || 'aluno')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
  return s || 'aluno'
}

@Controller('alunos')
@UseGuards(AuthGuard('jwt'))
export class AlunosController {
  constructor(
    private studentsService: StudentsService,
    private boletimPdfService: BoletimPdfService,
    private presencaHistoricoPdfService: PresencaHistoricoPdfService,
    private teacherScope: TeacherScopeService,
    private responsiblesService: ResponsiblesService,
  ) {}

  @Get(':id/boletim-pdf')
  async getBoletimPdf(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const numId = +id
    if (req.user.role === 'responsible') {
      await this.responsiblesService.ensureAccessToStudent(req.user.id, numId)
    } else if (req.user.role === 'teacher') {
      await this.teacherScope.ensureStudentAccess(req.user, numId)
    } else if (req.user.role !== 'admin' && req.user.role !== 'school') {
      throw new ForbiddenException('Sem permissão para exportar boletim')
    }

    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    const student = await this.studentsService.findOne(numId, schoolId)
    if (!student) {
      throw new NotFoundException('Aluno não encontrado')
    }

    const buffer = await this.boletimPdfService.generateBufferForStudent(student, schoolId)
    const filename = `${sanitizeBoletimFilename(student.name)}-${numId}.pdf`

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="boletim-${filename}"`,
    })
  }

  @Get(':id/presenca-pdf')
  async getPresencaPdf(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const numId = +id
    if (req.user.role === 'responsible') {
      await this.responsiblesService.ensureAccessToStudent(req.user.id, numId)
    } else if (req.user.role === 'teacher') {
      await this.teacherScope.ensureStudentAccess(req.user, numId)
    } else if (req.user.role !== 'admin' && req.user.role !== 'school') {
      throw new ForbiddenException('Sem permissão para exportar histórico de presença')
    }

    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    const student = await this.studentsService.findOne(numId, schoolId)
    if (!student) {
      throw new NotFoundException('Aluno não encontrado')
    }

    const buffer = await this.presencaHistoricoPdfService.generateBufferForStudent(student, schoolId)
    const filename = `${sanitizeBoletimFilename(student.name)}-${numId}.pdf`

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="presenca-${filename}"`,
    })
  }
}
