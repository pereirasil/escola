import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import type { PermissionId } from '../rbac/role-permissions'
import { roleHasPermission } from '../rbac/role-permissions'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndMerge<PermissionId[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required?.length) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user?.role) throw new ForbiddenException('Acesso negado')

    const ok = required.every((p) => roleHasPermission(user.role, p))
    if (!ok) throw new ForbiddenException('Permissão insuficiente')
    return true
  }
}
