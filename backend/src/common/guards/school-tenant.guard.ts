import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'

@Injectable()
export class SchoolTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (!user) return false
    if (user.role === 'admin') return true
    if (!user.school_id) {
      throw new ForbiddenException('Usuário não vinculado a nenhuma escola')
    }
    return true
  }
}
