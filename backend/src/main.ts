import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { UsersService } from './modules/users/users.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { RedisIoAdapter } from './common/redis-io.adapter'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    logger.warn(
      'JWT_SECRET ausente ou curto: defina uma chave forte em produção (variável de ambiente).',
    )
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : undefined,
  })

  const redisAdapter = new RedisIoAdapter(app)
  await redisAdapter.connectToRedis()
  app.useWebSocketAdapter(redisAdapter)
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // Clientes legados podem enviar campos extras no JSON; whitelist já remove o que não está no DTO.
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.enableCors({ origin: true })

  const uploadsPath = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsPath)) mkdirSync(uploadsPath)
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' })

  const usersService = app.get(UsersService)
  await usersService.ensureAdminExists()
  const port = process.env.PORT ?? 3000
  await app.listen(port)
  logger.log(`HTTP em execução na porta ${port}`)
}
bootstrap()
