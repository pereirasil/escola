import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Invoice } from '../entities/invoice.entity'
import { Payment } from '../entities/payment.entity'

@Injectable()
export class MercadoPagoWebhookService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  private getAccessToken(): string {
    const token = (process.env.MERCADOPAGO_ACCESS_TOKEN ?? '').trim()
    if (!token) return ''
    return token
  }

  async fetchMpPaymentStatus(mpPaymentId: string): Promise<string | null> {
    const accessToken = this.getAccessToken()
    if (!accessToken) return null

    const res = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null

    const data = await res.json()
    return data.status ?? null
  }

  async markAsPaidIfApproved(mpPaymentId: string): Promise<boolean> {
    const status = await this.fetchMpPaymentStatus(mpPaymentId)
    if (status !== 'approved') return false

    const invoice = await this.invoiceRepo.findOne({
      where: [
        { provider_id: mpPaymentId },
        { pix_provider_id: mpPaymentId },
      ],
    })
    if (!invoice) return false

    await this.paymentRepo.update(
      { id: invoice.payment_id },
      { status: 'paid' },
    )
    await this.invoiceRepo.update(
      { id: invoice.id },
      { status: 'paid' },
    )
    return true
  }
}
