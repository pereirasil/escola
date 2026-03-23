import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = useAuthStore(state => state.token)
  const user = useAuthStore(state => state.user)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'responsible') return <Navigate to="/aluno" replace />
    if (user.role === 'teacher') return <Navigate to="/professor" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children ?? <Outlet />
}
