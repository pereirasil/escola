import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const isHttp = exception instanceof HttpException
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const rawBody = isHttp ? exception.getResponse() : undefined
    const isProd = process.env.NODE_ENV === 'production'

    const message = !isHttp
      ? isProd
        ? 'Erro interno do servidor'
        : exception instanceof Error
          ? exception.message
          : 'Erro interno do servidor'
      : typeof rawBody === 'string'
        ? rawBody
        : rawBody && typeof rawBody === 'object' && 'message' in rawBody
          ? (rawBody as { message: string | string[] }).message
          : 'Erro interno do servidor'

    const normalized = Array.isArray(message) ? message.join('; ') : String(message)

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    response.status(status).json({
      statusCode: status,
      message: normalized,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
