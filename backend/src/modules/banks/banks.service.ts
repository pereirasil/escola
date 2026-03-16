import { Injectable } from '@nestjs/common'

const BRASIL_API_URL = 'https://brasilapi.com.br/api/banks/v1'

export interface BankDto {
  code: string
  name: string
  ispb: string
}

@Injectable()
export class BanksService {
  async findAll(): Promise<BankDto[]> {
    try {
      const res = await fetch(BRASIL_API_URL)
      if (!res.ok) throw new Error(`BrasilAPI: ${res.status}`)
      const data = (await res.json()) as Array<{ ispb: string; name: string; code: number | null; fullName: string }>

      return data
        .filter((b) => b.code != null)
        .map((b) => ({
          code: String(b.code).padStart(3, '0'),
          name: b.name,
          ispb: b.ispb,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (err) {
      console.error('[BanksService] Erro ao buscar bancos:', err instanceof Error ? err.message : err)
      return []
    }
  }
}
