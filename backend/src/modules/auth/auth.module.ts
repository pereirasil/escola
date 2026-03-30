import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { StudentsModule } from '../students/students.module'
import { TeachersModule } from '../teachers/teachers.module'
import { ResponsiblesModule } from '../responsibles/responsibles.module'
import { PaymentsModule } from '../payments/payments.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RefreshToken } from './entities/refresh-token.entity'

const accessExpires = process.env.JWT_ACCESS_EXPIRES_IN?.trim() || '15m'

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    StudentsModule,
    TeachersModule,
    ResponsiblesModule,
    PaymentsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'chave-secreta-trocar-em-producao',
      signOptions: { expiresIn: accessExpires },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
