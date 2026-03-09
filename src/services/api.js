import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Se for uma requisição para a API (não GET), tenta injetar o school_id se existir e não foi passado
  const schoolId = useAuthStore.getState().schoolId;
  if (schoolId && config.method !== 'get') {
    if (config.data && typeof config.data === 'object' && !config.data.school_id) {
      config.data.school_id = schoolId;
    }
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = (error.config?.url || '').replace(/^\//, '')
    const isLoginRequest = /^auth\/(login|login-student|login-teacher)$/.test(url)
    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
