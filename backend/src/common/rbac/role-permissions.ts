/**
 * Mapa role → permissões lógicas (evolução de RBAC sem alterar rotas existentes).
 * Novos endpoints podem usar @RequirePermissions(...) com PermissionsGuard.
 */
export const PERMISSIONS = {
  PLATFORM_ADMIN: 'platform.admin',
  SCHOOL_MANAGE: 'school.manage',
  SCHOOL_ACADEMIC: 'school.academic',
  SCHOOL_FINANCE: 'school.finance',
  TEACHER_ACADEMIC: 'teacher.academic',
  RESPONSIBLE_PORTAL: 'responsible.portal',
} as const

export type PermissionId = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/** Permissões efetivas por role JWT atual. '*' concede todas as listadas no sistema. */
export const ROLE_PERMISSIONS: Record<string, PermissionId[] | ['*']> = {
  admin: ['*'],
  school: [
    PERMISSIONS.SCHOOL_MANAGE,
    PERMISSIONS.SCHOOL_ACADEMIC,
    PERMISSIONS.SCHOOL_FINANCE,
  ],
  teacher: [PERMISSIONS.TEACHER_ACADEMIC],
  responsible: [PERMISSIONS.RESPONSIBLE_PORTAL],
}

export function roleHasPermission(role: string, permission: PermissionId): boolean {
  const granted = ROLE_PERMISSIONS[role]
  if (!granted) return false
  if (granted[0] === '*') return true
  return (granted as PermissionId[]).includes(permission)
}
