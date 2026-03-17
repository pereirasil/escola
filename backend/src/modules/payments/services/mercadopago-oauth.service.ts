import { BadRequestException, Injectable } from '@nestjs/common'
import { UsersService } from '../../users/users.service'

@Injectable()
export class MercadoPagoOAuthService {
  constructor(private usersService: UsersService) {}

  private getClientId(): string {
    const id = (process.env.MERCADOPAGO_CLIENT_ID ?? '').trim()
    if (!id) {
      throw new BadRequestException(
        'Mercado Pago OAuth não configurado (MERCADOPAGO_CLIENT_ID).',
      )
    }
    return id
  }

  private getClientSecret(): string {
    const secret = (process.env.MERCADOPAGO_CLIENT_SECRET ?? '').trim()
    if (!secret) {
      throw new BadRequestException(
        'Mercado Pago OAuth não configurado (MERCADOPAGO_CLIENT_SECRET).',
      )
    }
    return secret
  }

  private getRedirectUri(): string {
    const uri = (process.env.MERCADOPAGO_REDIRECT_URI ?? '').trim()
    if (!uri) {
      throw new BadRequestException(
        'Mercado Pago OAuth não configurado (MERCADOPAGO_REDIRECT_URI).',
      )
    }
    return uri
  }

  getAuthorizationUrl(schoolUserId: number): string {
    const clientId = this.getClientId()
    const redirectUri = this.getRedirectUri()
    const state = String(schoolUserId)
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      platform_id: 'mp',
      state,
      redirect_uri: redirectUri,
    })
    return `https://auth.mercadopago.com/authorization?${params.toString()}`
  }

  async exchangeCodeForToken(
    code: string,
    state: string,
  ): Promise<{ access_token: string; user_id: string }> {
    const schoolUserId = parseInt(state, 10)
    if (Number.isNaN(schoolUserId) || schoolUserId <= 0) {
      throw new BadRequestException('Estado inválido na autorização.')
    }

    const school = await this.usersService.findSchoolById(schoolUserId)
    if (!school) {
      throw new BadRequestException('Escola não encontrada.')
    }

    const clientId = this.getClientId()
    const clientSecret = this.getClientSecret()
    const redirectUri = this.getRedirectUri()

    const res = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code.trim(),
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new BadRequestException(
        `Mercado Pago: falha ao trocar código por token. ${errText}`,
      )
    }

    const data = await res.json()
    const accessToken = data.access_token
    let userId = data.user_id ?? data.payer_id ?? null

    if (!accessToken || typeof accessToken !== 'string') {
      throw new BadRequestException('Mercado Pago: token não retornado.')
    }

    if (!userId) {
      const meRes = await fetch('https://api.mercadopago.com/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (meRes.ok) {
        const meData = await meRes.json()
        userId = meData.id ?? meData.user_id ?? null
      }
    }

    await this.usersService.updateMercadoPagoCredentials(
      schoolUserId,
      accessToken,
      userId ? String(userId) : '',
    )

    return { access_token: accessToken, user_id: userId ? String(userId) : '' }
  }
}
