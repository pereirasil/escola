import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './entities/payment.entity'
import { Invoice } from './entities/invoice.entity'
import { Student } from '../students/entities/student.entity'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { BoletoService } from './services/boleto.service'
import { MonthlyPaymentsService } from './services/monthly-payments.service'
import { PaymentNotificationsService } from './services/payment-notifications.service'
import { MercadoPagoWebhookService } from './services/mercadopago-webhook.service'
import { MercadoPagoOAuthService } from './services/mercadopago-oauth.service'
import { MercadoPagoWebhookController } from './mercadopago-webhook.controller'
import { MercadoPagoOAuthController } from './mercadopago-oauth.controller'
import { MailModule } from '../mail/mail.module'
import { StudentsModule } from '../students/students.module'
import { UsersModule } from '../users/users.module'
import { ClassesModule } from '../classes/classes.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice, Student]),
    MailModule,
    StudentsModule,
    ClassesModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [
    PaymentsController,
    MercadoPagoWebhookController,
    MercadoPagoOAuthController,
  ],
  providers: [
    PaymentsService,
    BoletoService,
    MonthlyPaymentsService,
    PaymentNotificationsService,
    MercadoPagoWebhookService,
    MercadoPagoOAuthService,
  ],
  exports: [BoletoService],
})
export class PaymentsModule {}
