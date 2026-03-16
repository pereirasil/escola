import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Payment } from '../entities/payment.entity'
import { Invoice } from '../entities/invoice.entity'
import { MailQueueService } from '../../mail/mail-queue.service'

@Injectable()
export class PaymentNotificationsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    private mailQueue: MailQueueService,
  ) {}

  @Cron('0 9 * * *')
  async sendRemindersTwoDaysBefore(): Promise<void> {
    const today = new Date()
    const twoDaysLater = new Date(today)
    twoDaysLater.setDate(twoDaysLater.getDate() + 2)
    const dueStr = twoDaysLater.toISOString().slice(0, 10)

    const payments = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .where('payment.due_date = :dueStr', { dueStr })
      .andWhere('payment.status != :paid', { paid: 'paid' })
      .getMany()

    if (payments.length === 0) return

    const paymentIds = payments.map((p) => p.id)
    const invoices = await this.invoiceRepo.find({
      where: { payment_id: In(paymentIds) },
    })
    const invByPayment = new Map(invoices.map((i) => [i.payment_id, i]))

    for (const payment of payments) {
      const student = payment.student
      const emailTo = student?.email
      if (!emailTo) continue

      const invoice = invByPayment.get(payment.id)
      const amountFormatted = Number(payment.amount).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      this.mailQueue
        .add({
          to: emailTo,
          subject: 'Lembrete: mensalidade vence em 2 dias',
          template: 'payment-reminder',
          data: {
            studentName: student?.name || 'Aluno',
            amount: amountFormatted,
            dueDate: payment.due_date || dueStr,
            boletoUrl: invoice?.boleto_url,
          },
          schoolId: payment.school_id ?? undefined,
        })
        .catch((err) => console.error('[PaymentNotifications] Erro ao enfileirar lembrete:', err))
    }
  }

  @Cron('0 9 * * *')
  async sendOverdueNotices(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10)

    const payments = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .where('payment.due_date < :today', { today })
      .andWhere('payment.status != :paid', { paid: 'paid' })
      .getMany()

    if (payments.length === 0) return

    const paymentIds = payments.map((p) => p.id)
    const invoices = await this.invoiceRepo.find({
      where: { payment_id: In(paymentIds) },
    })
    const invByPayment = new Map(invoices.map((i) => [i.payment_id, i]))

    for (const payment of payments) {
      const student = payment.student
      const emailTo = student?.email
      if (!emailTo) continue

      const invoice = invByPayment.get(payment.id)
      const amountFormatted = Number(payment.amount).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      this.mailQueue
        .add({
          to: emailTo,
          subject: 'Aviso: mensalidade vencida',
          template: 'payment-overdue',
          data: {
            studentName: student?.name || 'Aluno',
            amount: amountFormatted,
            dueDate: payment.due_date || today,
            boletoUrl: invoice?.boleto_url,
          },
          schoolId: payment.school_id ?? undefined,
        })
        .catch((err) => console.error('[PaymentNotifications] Erro ao enfileirar aviso vencido:', err))
    }
  }
}
