import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Hook para trocar o aluno selecionado.
 * Atualiza token, studentId no store e invalida todas as queries da área aluno.
 */
export function useChangeStudent() {
  const [switching, setSwitching] = useState(false)
  const queryClient = useQueryClient()
  const setStudent = useAuthStore((s) => s.setStudent)

  const changeStudent = useCallback(
    async (newStudentId) => {
      const currentId = useAuthStore.getState().studentId
      if (!newStudentId || Number(newStudentId) === currentId) return

      setSwitching(true)
      try {
        const data = await authService.chooseStudent(Number(newStudentId))
        setStudent(Number(newStudentId), data.access_token, data.school_id)
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'aluno' })
      } finally {
        setSwitching(false)
      }
    },
    [setStudent, queryClient],
  )

  return { changeStudent, switching }
}
