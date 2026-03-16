import { Body, Controller, Post, Req, Res } from '@nestjs/common'
import { Response } from 'express'
import { MercadoPagoWebhookService } from './services/mercadopago-webhook.service'

@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private webhookService: MercadoPagoWebhookService) {}

  @Post()
  async handleWebhook(
    @Body() body: { type?: string; data?: { id?: string } },
    @Req() req: { query?: { 'data.id'?: string } },
    @Res() res: Response,
  ) {
    const mpId = body?.data?.id ?? req?.query?.['data.id']
    if (!mpId || typeof mpId !== 'string') {
      return res.status(400).json({ error: 'Missing payment id' })
    }

    const type = body?.type ?? 'payment'
    if (type !== 'payment') {
      return res.status(200).json({ received: true })
    }

    try {
      const updated = await this.webhookService.markAsPaidIfApproved(String(mpId))
      return res.status(200).json({ received: true, updated })
    } catch (err) {
      console.error('[MercadoPagoWebhook] Erro ao processar:', err)
      return res.status(200).json({ received: true, error: 'processing_failed' })
    }
  }
}
