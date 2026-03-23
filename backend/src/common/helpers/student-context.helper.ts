import { ForbiddenException } from '@nestjs/common'

/**
 * Obtém o ID do aluno efetivo para a requisição.
 * Para role 'responsible': usa user.student_id (deve estar definido no JWT).
 */
export function getEffectiveStudentId(req: { user: { role: string; student_id?: number } }): number {
  const user = req.user
  if (user.role === 'responsible') {
    if (user.student_id == null) {
      throw new ForbiddenException('Selecione um aluno para continuar')
    }
    return user.student_id
  }
  throw new ForbiddenException('Acesso negado')
}

/**
 * Obtém o school_id para a requisição (usado em escopo de aluno/responsável).
 */
export function getEffectiveSchoolId(req: { user: { school_id?: number } }): number | undefined {
  return req.user?.school_id ?? undefined
}
