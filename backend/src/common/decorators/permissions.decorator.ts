import { SetMetadata } from '@nestjs/common'
import type { PermissionId } from '../rbac/role-permissions'

export const PERMISSIONS_KEY = 'permissions'

/** Declara permissões necessárias (além ou em substituição futura a @Roles). */
export const RequirePermissions = (...permissions: PermissionId[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
