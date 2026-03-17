import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common'

export const SchoolId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    const schoolId = user?.school_id ?? undefined
    if (user?.role && user.role !== 'admin' && schoolId == null) {
      throw new ForbiddenException('Identificação da escola não encontrada. Faça login novamente.')
    }
    return schoolId
  },
)
