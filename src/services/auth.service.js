import { api } from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((res) => res.data),

  loginResponsible: (cpf, password) =>
    api.post('/auth/login-responsible', { cpf, password }).then((res) => res.data),

  loginTeacher: (cpf, password) =>
    api.post('/auth/login-teacher', { cpf, password }).then((res) => res.data),

  chooseSchool: (schoolId) =>
    api.post('/auth/teacher/choose-school', { school_id: schoolId }).then((res) => res.data),

  chooseStudent: (studentId) =>
    api.post('/auth/responsible/choose-student', { student_id: studentId }).then((res) => res.data),

  register: (data) =>
    api.post('/auth/register', data),

  getAvatarByCpf: (cpf) =>
    api.get(`/auth/avatar/${cpf.replace(/\D/g, '')}`).then((res) => res.data),
}
