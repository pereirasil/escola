import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository, type DeepPartial } from 'typeorm'
import { Payment } from './entities/payment.entity'
import { Invoice } from './entities/invoice.entity'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { BoletoService } from './services/boleto.service'
import { MailQueueService } from '../mail/mail-queue.service'
import { StudentsService } from '../students/students.service'

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private repo: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    private boletoService: BoletoService,
    private mailQueue: MailQueueService,
    private studentsService: StudentsService,
  ) {}

  async findAll(schoolId?: number) {
    const qb = this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .orderBy('payment.due_date', 'DESC')

    if (schoolId) {
      qb.andWhere('payment.school_id = :schoolId', { schoolId })
    }

    const payments = await qb.getMany()
    if (payments.length > 0) {
      const paymentIds = payments.map((p) => p.id)
      const invoices = await this.invoiceRepo.find({
        where: { payment_id: In(paymentIds) },
      })
      const invByPayment = new Map(invoices.map((i) => [i.payment_id, i]))
      for (const p of payments) {
        ;(p as Payment & { invoice?: typeof invoices[0] }).invoice = invByPayment.get(p.id)
      }
    }
    return payments
  }

  async findOne(id: number) {
    const payment = await this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .where('payment.id = :id', { id })
      .getOne()

    if (payment) {
      const invoice = await this.invoiceRepo.findOne({ where: { payment_id: id } })
      ;(payment as Payment & { invoice?: { id: number; barcode?: string; linha_digitavel?: string; boleto_url?: string; status?: string } }).invoice = invoice ?? undefined
    }
    return payment
  }

  async findByStudentAndMonth(studentId: number, month: number, year: number): Promise<Payment | null> {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return this.repo
      .createQueryBuilder('payment')
      .where('payment.student_id = :studentId', { studentId })
      .andWhere('payment.due_date LIKE :prefix', { prefix: `${prefix}%` })
      .getOne()
  }

  async createWithLocalBoleto(
    studentId: number,
    amount: number,
    dueDate: string,
    lateFeePercentage: number | null,
    schoolId?: number,
  ) {
    const entity = this.repo.create({
      student_id: studentId,
      amount,
      due_date: dueDate,
      status: 'pending',
      school_id: schoolId,
      late_fee_percentage: lateFeePercentage ?? undefined,
      late_fee_applied: false,
    })
    const payment = await this.repo.save(entity)

    const student = await this.studentsService.findOne(studentId)
    const boleto = await this.boletoService.generateAndSend(payment, student, schoolId)

    const invoiceData: DeepPartial<Invoice> = {
      school_id: schoolId,
      payment_id: payment.id,
      barcode: boleto.barcode,
      linha_digitavel: boleto.linha_digitavel,
      status: 'pending',
    }
    const invoice = this.invoiceRepo.create(invoiceData)
    await this.invoiceRepo.save(invoice)

    return this.findOne(payment.id)
  }

  async create(dto: CreatePaymentDto, schoolId?: number) {
    const student = await this.studentsService.findOne(dto.student_id)
    const lateFeePct = student?.late_fee_percentage != null ? Number(student.late_fee_percentage) : undefined

    const payment = await this.repo.save(
      this.repo.create({
        ...dto,
        school_id: schoolId,
        late_fee_percentage: lateFeePct,
        late_fee_applied: false,
      }),
    )
    const dueDate = dto.due_date || new Date().toISOString().slice(0, 10)

    const address = student
      ? {
          zip_code: student.cep,
          street_name: student.street,
          street_number: student.number,
          neighborhood: student.neighborhood,
          city: student.city,
          federal_unit: student.state,
        }
      : null
    const boleto = await this.boletoService.generate(
      payment.id,
      dto.amount,
      dto.due_date || null,
      student?.name || 'Aluno',
      student?.email || null,
      address,
    )

    const invoice = this.invoiceRepo.create({
      school_id: schoolId,
      payment_id: payment.id,
      barcode: boleto.barcode,
      linha_digitavel: boleto.linha_digitavel,
      boleto_url: boleto.bankSlipUrl,
      provider_id: boleto.provider_id,
      status: 'pending',
    })
    await this.invoiceRepo.save(invoice)

    const emailTo = student?.email
    if (emailTo) {
      const amountFormatted = Number(dto.amount).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      this.mailQueue
        .add({
          to: emailTo,
          subject: 'Nova mensalidade gerada',
          template: 'payment-created',
          data: {
            studentName: student?.name || 'Aluno',
            amount: amountFormatted,
            dueDate,
            boletoUrl: boleto.bankSlipUrl || undefined,
          },
          schoolId,
        })
        .catch((err) => console.error('[PaymentsService] Erro ao enfileirar email:', err))
    }

    return this.findOne(payment.id)
  }

  async applyLateFeeIfOverdue(id: number): Promise<Payment | null> {
    const payment = await this.findOne(id)
    if (!payment || payment.status === 'paid' || payment.late_fee_applied) return payment

    const dueDate = payment.due_date
    if (!dueDate) return payment

    const today = new Date().toISOString().slice(0, 10)
    if (dueDate >= today) return payment

    const pct = Number(payment.late_fee_percentage) || 0
    if (pct <= 0) return payment

    const currentAmount = Number(payment.amount)
    const lateFee = currentAmount * (pct / 100)
    const newAmount = currentAmount + lateFee

    await this.repo.update(id, {
      amount: newAmount,
      late_fee_applied: true,
    })
    return this.findOne(id)
  }

  async applyLateFeesToOverdue(): Promise<number> {
    const today = new Date().toISOString().slice(0, 10)
    const payments = await this.repo
      .createQueryBuilder('payment')
      .where('payment.due_date < :today', { today })
      .andWhere('payment.status != :paid', { paid: 'paid' })
      .andWhere('payment.late_fee_applied = :applied', { applied: false })
      .getMany()

    let applied = 0
    for (const p of payments) {
      const pct = Number(p.late_fee_percentage) || 0
      if (pct <= 0) continue
      const newAmount = Number(p.amount) * (1 + pct / 100)
      await this.repo.update(p.id, { amount: newAmount, late_fee_applied: true })
      applied++
    }
    return applied
  }

  update(id: number, dto: UpdatePaymentDto) {
    return this.applyLateFeeIfOverdue(id).then(() =>
      this.repo.update(id, dto as Partial<Payment>).then(() => this.findOne(id)),
    )
  }

  async sendBoletoById(id: number): Promise<void> {
    const payment = await this.findOne(id)
    if (!payment) throw new BadRequestException('Pagamento não encontrado')

    const student = payment.student
    const emailTo = student?.email
    if (!emailTo) throw new BadRequestException('Aluno sem e-mail cadastrado')

    const invoice = (payment as Payment & { invoice?: { boleto_url?: string } }).invoice
    if (!invoice) throw new BadRequestException('Pagamento sem boleto gerado')

    const amount = Number(payment.amount)
    const dueDate = payment.due_date || new Date().toISOString().slice(0, 10)
    const studentName = student?.name || 'Aluno'

    if (invoice.boleto_url) {
      const amountFormatted = Number(amount).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      this.mailQueue
        .add({
          to: emailTo,
          subject: 'Nova mensalidade gerada',
          template: 'payment-created',
          data: {
            studentName,
            amount: amountFormatted,
            dueDate,
            boletoUrl: invoice.boleto_url,
          },
          schoolId: payment.school_id,
        })
        .catch((err) => console.error('[PaymentsService] Erro ao enfileirar email:', err))
    } else {
      await this.boletoService.generateAndSend(payment, student, payment.school_id)
    }
  }

  async generateBoletoById(id: number) {
    const payment = await this.findOne(id)
    if (!payment) throw new BadRequestException('Pagamento não encontrado')

    const student = payment.student
    const amount = Number(payment.amount)
    const dueDate = payment.due_date || new Date().toISOString().slice(0, 10)
    const studentName = student?.name || 'Aluno'
    const studentEmail = student?.email || null

    const existingInvoice = await this.invoiceRepo.findOne({ where: { payment_id: id } })

    if (existingInvoice?.boleto_url) {
      return this.findOne(id)
    }

    const address = student
      ? {
          zip_code: student.cep,
          street_name: student.street,
          street_number: student.number,
          neighborhood: student.neighborhood,
          city: student.city,
          federal_unit: student.state,
        }
      : null
    let boleto
    try {
      boleto = await this.boletoService.generate(
        payment.id,
        amount,
        dueDate,
        studentName,
        studentEmail,
        address,
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      throw new BadRequestException(`Erro ao gerar boleto: ${msg}`)
    }

    const invoiceData = {
      barcode: boleto.barcode,
      linha_digitavel: boleto.linha_digitavel,
      boleto_url: boleto.bankSlipUrl ?? undefined,
      provider_id: boleto.provider_id ?? undefined,
      status: 'pending',
    }

    if (existingInvoice) {
      await this.invoiceRepo.update({ payment_id: id }, invoiceData)
    } else {
      const newInvoice = this.invoiceRepo.create({
        school_id: payment.school_id,
        payment_id: payment.id,
        barcode: invoiceData.barcode,
        linha_digitavel: invoiceData.linha_digitavel,
        boleto_url: invoiceData.boleto_url,
        provider_id: invoiceData.provider_id,
        status: invoiceData.status,
      })
      await this.invoiceRepo.save(newInvoice)
    }

    return this.findOne(id)
  }

  async getBoletoPdfBuffer(id: number): Promise<Buffer> {
    try {
      const payment = await this.findOne(id)
      if (!payment) throw new BadRequestException('Pagamento não encontrado')
      const student = payment.student
      const rawAmount = payment.amount
      const amount = typeof rawAmount === 'string'
        ? parseFloat(String(rawAmount).replace(',', '.')) || 0
        : Number(rawAmount) || 0
      if (amount < 0) throw new BadRequestException('Valor do pagamento inválido')
      const dueDate = String(
        payment.due_date ?? new Date().toISOString().slice(0, 10),
      )
      const studentName = (student?.name || 'Aluno').toString()
      const { pdfBuffer } = await this.boletoService.generatePdfLocal(
        payment.id,
        amount,
        dueDate,
        studentName,
      )
      return pdfBuffer
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      const msg = err instanceof Error ? err.message : String(err)
      throw new BadRequestException(`Erro ao gerar PDF: ${msg}`)
    }
  }
}
