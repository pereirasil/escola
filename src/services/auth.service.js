import { api } from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((res) => res.data),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
}
