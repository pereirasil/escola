import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const SchoolId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest()
    return request.user?.school_id ?? undefined
  },
)
