import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { UsersService } from './modules/users/users.service'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { RedisIoAdapter } from './common/redis-io.adapter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const redisAdapter = new RedisIoAdapter(app)
  await redisAdapter.connectToRedis()
  app.useWebSocketAdapter(redisAdapter)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.enableCors({ origin: true })

  const uploadsPath = join(process.cwd(), 'uploads')
  if (!existsSync(uploadsPath)) mkdirSync(uploadsPath)
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' })

  const usersService = app.get(UsersService)
  await usersService.ensureAdminExists()
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
