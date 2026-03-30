import { Injectable } from '@nestjs/common'
import { GradesService } from '../../grades/grades.service'
import { ClassesService } from '../../classes/classes.service'
import { SubjectsService } from '../../subjects/subjects.service'
import { Student } from '../entities/student.entity'

const PDFDocument = require('pdfkit')

export interface BoletimLinhaPdf {
  materia: string
  bimestre: string
  nota: string
}

@Injectable()
export class BoletimPdfService {
  constructor(
    private gradesService: GradesService,
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

  async buildLinhasNotas(studentId: number, schoolId?: number): Promise<BoletimLinhaPdf[]> {
    const [grades, subjects] = await Promise.all([
      this.gradesService.findByAluno(studentId, schoolId),
      this.subjectsService.findAll(schoolId),
    ])
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))
    return grades
      .slice()
      .sort((a, b) => {
        const na = subjectMap.get(a.materia_id) || ''
        const nb = subjectMap.get(b.materia_id) || ''
        const c = na.localeCompare(nb, 'pt-BR')
        if (c !== 0) return c
        return String(a.bimestre).localeCompare(String(b.bimestre), undefined, { numeric: true })
      })
      .map((g) => ({
        materia: subjectMap.get(g.materia_id) || `Matéria ${g.materia_id}`,
        bimestre: String(g.bimestre),
        nota: Number(g.nota).toFixed(1),
      }))
  }

  async generateBufferForStudent(student: Student, schoolId?: number): Promise<Buffer> {
    const sid = schoolId ?? student.school_id ?? undefined
    const [turmaLinha, linhas] = await Promise.all([
      this.resolveTurmaLabel(student),
      this.buildLinhasNotas(student.id, sid),
    ])
    return this.renderPdf({
      studentName: student.name || 'Aluno',
      document: student.document ?? null,
      turmaLinha,
      linhas,
    })
  }

  private renderPdf(params: {
    studentName: string
    document: string | null
    turmaLinha: string | null
    linhas: BoletimLinhaPdf[]
  }): Promise<Buffer> {
    const pageWidth = 595
    const pageHeight = 842
    const margin = 48
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

    const drawTableHeader = (yy: number) => {
      const h = 26
      doc.rect(margin, yy, contentW, h).fillAndStroke(headerBg, borderColor)
      doc.fontSize(10).font('Helvetica-Bold').fillColor(textPrimary)
      const colM = margin + 10
      const colB = margin + contentW * 0.58
      const colN = margin + contentW * 0.82
      doc.text('Matéria', colM, yy + 8, { width: colB - colM - 8 })
      doc.text('Bimestre', colB, yy + 8, { width: colN - colB - 8, align: 'center' })
      doc.text('Nota', colN, yy + 8, { width: margin + contentW - colN - 10, align: 'right' })
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
        doc.text('Boletim Escolar (continuação)', margin, y, { width: contentW, align: 'center' })
        y += 28
        y = drawTableHeader(y)
      }

      // Página 1 — fundo
      doc.rect(0, 0, pageWidth, pageHeight).fill('#F5F5F5')

      doc.fontSize(22).font('Helvetica-Bold').fillColor(textPrimary)
      doc.text('Boletim Escolar', margin, y, { width: contentW, align: 'center' })
      y += 36

      doc.fontSize(11).font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Nome:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(params.studentName, margin + 72, y, { width: contentW - 72 })
      y += 22

      doc.font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Matrícula/CPF:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(params.document?.trim() || '-', margin + 100, y, { width: contentW - 100 })
      y += 22

      doc.font('Helvetica-Bold').fillColor(textSecondary)
      doc.text('Turma/Série:', margin, y)
      doc.font('Helvetica').fillColor(textPrimary)
      doc.text(params.turmaLinha || '-', margin + 100, y, { width: contentW - 100 })
      y += 28

      doc.strokeColor(borderColor).lineWidth(1)
      doc.moveTo(margin, y).lineTo(margin + contentW, y).stroke()
      y += 16

      y = drawTableHeader(y)

      const drawRow = (linha: BoletimLinhaPdf, yy: number) => {
        const colM = margin + 10
        const colB = margin + contentW * 0.58
        const colN = margin + contentW * 0.82
        doc.fontSize(10).font('Helvetica').fillColor(textPrimary)
        doc.text(linha.materia, colM, yy + 5, { width: colB - colM - 8 })
        doc.text(linha.bimestre, colB, yy + 5, { width: colN - colB - 8, align: 'center' })
        doc.text(linha.nota, colN, yy + 5, { width: margin + contentW - colN - 10, align: 'right' })
        doc.strokeColor(borderColor).moveTo(margin, yy + rowH).lineTo(margin + contentW, yy + rowH).stroke()
      }

      if (params.linhas.length === 0) {
        doc.fontSize(10).font('Helvetica-Oblique').fillColor(textSecondary)
        doc.text('Nenhuma nota lançada.', margin + 10, y + 6, { width: contentW - 20 })
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

      y += 16
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
