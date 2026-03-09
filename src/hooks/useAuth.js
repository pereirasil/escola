/**
 * Hook para acesso ao token e estado de autenticação.
 * Expandir quando o login estiver integrado ao backend.
 */
export function useAuth() {
  const token = localStorage.getItem('token')
  return {
    isAuthenticated: !!token,
    token,
  }
}
