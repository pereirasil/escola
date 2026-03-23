import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'chave-secreta-trocar-em-producao',
    })
  }

  validate(payload: {
    sub: number
    email?: string
    role: string
    document?: string
    school_id?: number
    student_id?: number
  }) {
    return {
      id: payload.sub,
      email: payload.email ?? null,
      role: payload.role,
      document: payload.document ?? null,
      school_id: payload.school_id ?? null,
      student_id: payload.student_id ?? null,
    }
  }
}
