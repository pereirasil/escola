import { api } from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((res) => res.data),

  loginStudent: (cpf, password) =>
    api.post('/auth/login-student', { cpf, password }).then((res) => res.data),

  loginTeacher: (cpf, password) =>
    api.post('/auth/login-teacher', { cpf, password }).then((res) => res.data),

  register: (data) =>
    api.post('/auth/register', data),
}
