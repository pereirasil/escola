import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { MercadoPagoOAuthService } from './services/mercadopago-oauth.service'
import { PaymentsService } from './payments.service'

function getFrontendUrl(): string {
  return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')
}

@Controller('payments/mercadopago')
export class MercadoPagoOAuthController {
  constructor(
    private oauthService: MercadoPagoOAuthService,
    private paymentsService: PaymentsService,
  ) {}

  @Get('connect')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('school')
  getConnectUrl(@Req() req: { user: { id: number; role: string } }) {
    const url = this.oauthService.getAuthorizationUrl(req.user.id)
    return { url }
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('school')
  async getConnectionStatus(@Req() req: { user: { id: number; role: string } }) {
    const connected = await this.paymentsService.hasMercadoPagoConnected(req.user.id)
    return { connected }
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const base = getFrontendUrl()
    const successUrl = `${base}/financeiro?mercadopago=connected`
    const errorUrl = `${base}/financeiro?mercadopago=error`

    if (!code?.trim() || !state?.trim()) {
      return res.redirect(`${errorUrl}&reason=missing_params`)
    }

    try {
      await this.oauthService.exchangeCodeForToken(code, state)
      return res.redirect(successUrl)
    } catch (err) {
      console.error('[MercadoPagoOAuth] Erro no callback:', err)
      const reason = encodeURIComponent(err?.message || 'exchange_failed')
      return res.redirect(`${errorUrl}&reason=${reason}`)
    }
  }
}
