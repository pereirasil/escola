import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function RoleBasedRedirect() {
  const user = useAuthStore((state) => state.user)
  if (user?.role === 'responsible') return <Navigate to="/aluno" replace />
  if (user?.role === 'teacher') return <Navigate to="/professor" replace />
  return <Navigate to="/dashboard" replace />
}
