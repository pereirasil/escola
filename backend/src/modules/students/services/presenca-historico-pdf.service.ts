import { Injectable } from '@nestjs/common'
import { AttendanceService } from '../../attendance/attendance.service'
import { ClassesService } from '../../classes/classes.service'
import { SubjectsService } from '../../subjects/subjects.service'
import { Student } from '../entities/student.entity'

const PDFDocument = require('pdfkit')

function statusLabel(status: string): string {
  switch (status) {
    case 'P':
      return 'Presente'
    case 'F':
      return 'Falta'
    case 'A':
      return 'Atraso'
    case 'J':
      return 'Falta justificada'
    default:
      return status?.trim() || '-'
  }
}

function formatDateBr(iso: string): string {
  if (!iso) return '-'
  const d = String(iso).split('T')[0]
  const partes = d.split('-')
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`
  return d
}

function truncateObs(s: string, max = 72): string {
  const t = (s || '-').replace(/\s+/g, ' ').trim() || '-'
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export interface PresencaLinhaPdf {
  data: string
  aula: string
  materia: string
  status: string
  obs: string
}

@Injectable()
export class PresencaHistoricoPdfService {
  constructor(
    private attendanceService: AttendanceService,
    private classesService: ClassesService,
    private subjectsService: SubjectsService,
  ) {}

  async resolveTurmaLabel(student: Student): Promise<string | null> {
    if (!student.class_id) return null
    const cls = await this.classesService.findOne(student.class_id)
    if (!cls) return null
    const parts: string[] = []
    if (cls.name) parts.push(cls.name)
    if (cls.grade) parts.push(`Série: ${cls.grade}`)
    if (cls.room) parts.push(`Sala: ${cls.room}`)
    return parts.length ? parts.join(' · ') : null
  }

  async generateBufferForStudent(student: Student, schoolId?: number): Promise<Buffer> {
    const sid = schoolId ?? student.school_id ?? undefined
    const [{ presencas, resumo }, turmaLinha, subjects] = await Promise.all([
      this.attendanceService.getHistoricoAluno(student.id, sid),
      this.resolveTurmaLabel(student),
      this.subjectsService.findAll(sid),
    ])
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))
    const linhas: PresencaLinhaPdf[] = presencas.map((p) => ({
      data: formatDateBr(p.date),
      aula: (p.lesson || '-').slice(0, 40),
      materia: subjectMap.get(p.subject_id) || `Matéria ${p.subject_id}`,
      status: statusLabel(p.status),
      obs: truncateObs(p.observation || '-'),
    }))
    return this.renderPdf({
      studentName: student.name || 'Aluno',
      document: student.document ?? null,
      turmaLinha,
      resumo,
      linhas,
    })
  }

  private renderPdf(params: {
    studentName: string
    document: string | null
    turmaLinha: string | null
    resumo: { total: number; faltas: number; presentes: number; frequencia: number }
    linhas: PresencaLinhaPdf[]
  }): Promise<Buffer> {
    const pageWidth = 595
    const pageHeight = 842
    const margin = 40
    const contentW = pageWidth - margin * 2
    const textPrimary = '#1A1A1A'
    const textSecondary = '#666666'
    const borderColor = '#E5E7EB'
    const headerBg = '#F3F4F6'

    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    const drawFooter = () => {
      doc.fontSize(9).font('Helvetica').fillColor(textSecondary)
      doc.text('Documento gerado eletronicamente.', margin, pageHeight - 36, {
        width: contentW,
        align: 'center',
      })
    }

    const col = {
      x0: margin + 6,
      wData: contentW * 0.11,
      wAula: contentW * 0.12,
      wMat: contentW * 0.22,
      wStat: contentW * 0.16,
      wObs: contentW * 0.35,
    }
    const xAula = col.x0 + col.wData
    const xMat = xAula + col.wAula
    const xStat = xMat + col.wMat
    const xObs = xStat + col.wStat

    const drawTableHeader = (yy: number) => {
      const h = 26
      doc.rect(margin, yy, contentW, h).fillAndStroke(headerBg, borderColor)
      doc.fontSize(9).font('Helvetica-Bold').fillColor(textPrimary)
      doc.text('Data', col.x0, yy + 8, { width: col.wData - 4 })
      doc.text('Aula', xAula, yy + 8, { width: col.wAula - 4 })
      doc.text('Matéria', xMat, yy + 8, { width: col.wMat - 4 })
      doc.text('Status', xStat, yy + 8, { width: col.wStat - 4 })
      doc.text('Observação', xObs, yy + 8, { width: col.wObs - 6 })
      return yy + h
    }

    const rowH = 22
    const bottomLimit = pageHeight - 56

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      let y = margin

      const startContinuationPage = () => {
        drawFooter()
        doc.addPage()
        doc.rect(0, 0, pageWidth, pageHeight).fill('#F5F5F5')
        y = margin
        doc.fontSize(14).font('Helvetica-Bold').fillColor(textPrimary)
        doc.text('Histórico de Presença (continuação)', margin, y, { width: contentW, align: 'center' })
        y += 28
        y = drawTableHeader(y)
      }

      doc.rect(0, 0, pageWidth, pageHeight).fill('#F5F5F5')

      doc.fontSize(22).font('Helvetica-Bold').fillColor(textPrimary)
      doc.text('Histórico de Presença', margin, y, { width: contentW, align: 'center' })
      y += 32

      doc.fontSize(11).font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Nome:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(params.studentName, margin + 72, y, { width: contentW - 72 })
      y += 20

      doc.font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Matrícula/CPF:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(params.document?.trim() || '-', margin + 100, y, { width: contentW - 100 })
      y += 20

      doc.font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Turma/Série:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(params.turmaLinha || '-', margin + 100, y, { width: contentW - 100 })
      y += 20

      const r = params.resumo
      doc.font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Resumo:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(
        `Frequência ${r.frequencia}% · Registros: ${r.total} · Presentes/atraso/just.: ${r.presentes} · Faltas: ${r.faltas}`,
        margin + 58,
        y,
        { width: contentW - 58 },
      )
      y += 24

      doc.strokeColor(borderColor).lineWidth(1)
      doc.moveTo(margin, y).lineTo(margin + contentW, y).stroke()
      y += 14

      y = drawTableHeader(y)

      const drawRow = (linha: PresencaLinhaPdf, yy: number) => {
        doc.fontSize(8).font('Helvetica').fillColor(textPrimary)
        doc.text(linha.data, col.x0, yy + 5, { width: col.wData - 4 })
        doc.text(linha.aula, xAula, yy + 5, { width: col.wAula - 4 })
        doc.text(linha.materia, xMat, yy + 5, { width: col.wMat - 4 })
        doc.text(linha.status, xStat, yy + 5, { width: col.wStat - 4 })
        doc.text(linha.obs, xObs, yy + 5, { width: col.wObs - 6 })
        doc.strokeColor(borderColor).moveTo(margin, yy + rowH).lineTo(margin + contentW, yy + rowH).stroke()
      }

      if (params.linhas.length === 0) {
        doc.fontSize(10).font('Helvetica-Oblique').fillColor(textSecondary)
        doc.text('Nenhuma chamada registrada.', margin + 10, y + 6, { width: contentW - 20 })
        y += rowH
        doc.strokeColor(borderColor).moveTo(margin, y).lineTo(margin + contentW, y).stroke()
      } else {
        for (const linha of params.linhas) {
          if (y + rowH > bottomLimit) {
            startContinuationPage()
          }
          drawRow(linha, y)
          y += rowH
        }
      }

      y += 14
      if (y + 36 > pageHeight - 48) {
        drawFooter()
        doc.addPage()
        doc.rect(0, 0, pageWidth, pageHeight).fill('#F5F5F5')
        y = margin + 8
      }

      doc.fontSize(10).font('Helvetica').fillColor(textSecondary)
      doc.text(
        `Emitido em: ${new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`,
        margin,
        y,
        { width: contentW },
      )

      drawFooter()
      doc.end()
    })
  }
}
