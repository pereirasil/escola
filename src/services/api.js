import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const rawClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Rotas de auth que não devem disparar renovação de sessão nem logout em 401. */
const AUTH_PUBLIC_PATH = /^auth\/(login|login-responsible|login-teacher|teacher\/choose-school|responsible\/choose-student|refresh|logout|register)$/

function normalizeRequestPath(config) {
  let u = config?.url || ''
  if (u.startsWith('http')) {
    try {
      const parsed = new URL(u)
      u = parsed.pathname
      const basePath = new URL(baseURL).pathname.replace(/\/$/, '')
      if (basePath && u.startsWith(basePath)) u = u.slice(basePath.length) || '/'
    } catch {
      /* mantém u */
    }
  }
  return u.replace(/^\//, '').split('?')[0]
}

function isAuthPublicRequest(config) {
  return AUTH_PUBLIC_PATH.test(normalizeRequestPath(config))
}

let refreshInFlight = null

function refreshAccessToken() {
  const rt = useAuthStore.getState().refreshToken
  if (!rt) return Promise.resolve(null)
  if (!refreshInFlight) {
    refreshInFlight = rawClient
      .post('/auth/refresh', { refresh_token: rt })
      .then((res) => {
        const access = res.data?.access_token
        const nextRt = res.data?.refresh_token
        if (!access) throw new Error('Resposta de refresh inválida')
        useAuthStore.getState().setTokens(access, nextRt ?? rt)
        return access
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {}
    const status = error.response?.status

    if (status !== 401 || original._authRetry || isAuthPublicRequest(original)) {
      return Promise.reject(error)
    }

    original._authRetry = true
    try {
      const access = await refreshAccessToken()
      if (access) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${access}`
        return api.request(original)
      }
    } catch {
      /* segue para logout */
    }

    useAuthStore.getState().logout()
    window.location.href = '/login'
    return Promise.reject(error)
  }
)
