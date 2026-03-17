import { Body, Controller, Post, Req, Res } from '@nestjs/common'
import { Response } from 'express'
import { createHmac } from 'crypto'
import { MercadoPagoWebhookService } from './services/mercadopago-webhook.service'

@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private webhookService: MercadoPagoWebhookService) {}

  private verifySignature(
    dataId: string,
    xRequestId: string,
    xSignature: string,
    secret: string,
  ): boolean {
    if (!secret?.trim() || !xSignature?.trim()) return false

    const parts = xSignature.split(',').reduce<Record<string, string>>((acc, part) => {
      const [key, val] = part.split('=').map((s) => s.trim())
      if (key && val) acc[key] = val
      return acc
    }, {})

    const ts = parts.ts
    const v1 = parts.v1
    if (!ts || !v1) return false

    const dataIdNorm = typeof dataId === 'string' && /^[a-zA-Z0-9]+$/.test(dataId)
      ? dataId.toLowerCase()
      : String(dataId || '')

    const template = `id:${dataIdNorm};request-id:${xRequestId || ''};ts:${ts};`
    const expected = createHmac('sha256', secret.trim()).update(template).digest('hex')
    return expected === v1
  }

  @Post()
  async handleWebhook(
    @Body() body: { type?: string; data?: { id?: string } },
    @Req() req: {
      query?: { 'data.id'?: string }
      headers?: { 'x-signature'?: string; 'x-request-id'?: string }
    },
    @Res() res: Response,
  ) {
    const mpId = body?.data?.id ?? req?.query?.['data.id']
    if (!mpId || typeof mpId !== 'string') {
      return res.status(400).json({ error: 'Missing payment id' })
    }

    const secret = (process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '').trim()
    if (secret) {
      const xSignature = (req.headers as Record<string, string>)?.['x-signature']
      const xRequestId = (req.headers as Record<string, string>)?.['x-request-id']
      const valid = this.verifySignature(String(mpId), xRequestId || '', xSignature || '', secret)
      if (!valid) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }
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
