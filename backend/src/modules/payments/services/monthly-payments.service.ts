import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaymentsService } from '../payments.service'
import { StudentsService } from '../../students/students.service'
import { Student } from '../../students/entities/student.entity'

const DEFAULT_MONTHLY_FEE = 350
const DEFAULT_DUE_DAY = 10
const DAYS_BEFORE_DUE = 5

@Injectable()
export class MonthlyPaymentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    private paymentsService: PaymentsService,
    private studentsService: StudentsService,
  ) {}

  @Cron('0 0 * * *')
  async generatePaymentsFiveDaysBefore() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const todayStr = now.toISOString().slice(0, 10)

    const defaultAmount = Number(process.env.MONTHLY_FEE_DEFAULT) || DEFAULT_MONTHLY_FEE

    const students = await this.studentRepo.find({
      where: {},
    })

    let created = 0
    let skipped = 0
    let errors = 0

    for (const student of students) {
      if (!student.school_id) {
        skipped++
        continue
      }

      const dueDay = student.payment_due_day ?? DEFAULT_DUE_DAY
      const lastDayOfMonth = new Date(year, month, 0).getDate()
      const validDay = Math.min(Math.max(1, dueDay), lastDayOfMonth)
      const dueDateStr = `${year}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`

      const dueDate = new Date(year, month - 1, validDay)
      const triggerDate = new Date(dueDate)
      triggerDate.setDate(triggerDate.getDate() - DAYS_BEFORE_DUE)
      const triggerStr = triggerDate.toISOString().slice(0, 10)

      if (todayStr !== triggerStr) {
        skipped++
        continue
      }

      const existing = await this.paymentsService.findByStudentAndMonth(
        student.id,
        month,
        year,
      )
      if (existing) {
        skipped++
        continue
      }

      const amount =
        student.monthly_fee != null && Number(student.monthly_fee) > 0
          ? Number(student.monthly_fee)
          : defaultAmount
      const lateFeePct = student.late_fee_percentage != null
        ? Number(student.late_fee_percentage)
        : null

      try {
        await this.paymentsService.createWithLocalBoleto(
          student.id,
          amount,
          dueDateStr,
          lateFeePct,
          student.school_id,
        )
        created++
      } catch (err) {
        errors++
        console.error(
          `[MonthlyPaymentsService] Erro ao criar pagamento para aluno ${student.id}:`,
          err instanceof Error ? err.message : err,
        )
      }
    }

    if (created > 0 || errors > 0) {
      console.log(
        `[MonthlyPaymentsService] ${todayStr}: ${created} criados, ${skipped} ignorados, ${errors} erros.`,
      )
    }
  }

  @Cron('0 1 * * *')
  async applyLateFeesToOverduePayments() {
    const applied = await this.paymentsService.applyLateFeesToOverdue()
    if (applied > 0) {
      console.log(`[MonthlyPaymentsService] Multa aplicada em ${applied} pagamento(s) atrasado(s).`)
    }
  }
}
