import { api } from './api'


export const communicationService = {
  // Aluno
  minhasConversas: () => api.get('/students/me/conversations').then((r) => r.data),
  criarConversa: (data) => api.post('/students/me/conversations', data).then((r) => r.data),
  mensagensConversa: (id, page = 1, limit = 30) =>
    api.get(`/students/me/conversations/${id}/messages`, { params: { page, limit } }).then((r) => r.data),
  enviarMensagem: (id, message) =>
    api.post(`/students/me/conversations/${id}/messages`, { message }).then((r) => r.data),
  encerrarConversa: (id) => api.patch(`/students/me/conversations/${id}/close`).then((r) => r.data),

  // Escola
  listarConversas: () => api.get('/school/conversations').then((r) => r.data),
  criarConversaEscola: (data) => api.post('/school/conversations', data).then((r) => r.data),
  mensagensConversaEscola: (id, page = 1, limit = 30) =>
    api.get(`/school/conversations/${id}/messages`, { params: { page, limit } }).then((r) => r.data),
  enviarMensagemEscola: (id, message) =>
    api.post(`/school/conversations/${id}/messages`, { message }).then((r) => r.data),
  encerrarConversaEscola: (id) => api.patch(`/school/conversations/${id}/close`).then((r) => r.data),

  // Professor
  listarConversasProfessor: () => api.get('/teacher/conversations').then((r) => r.data),
  criarConversaProfessor: (data) => api.post('/teacher/conversations', data).then((r) => r.data),
  mensagensConversaProfessor: (id, page = 1, limit = 30) =>
    api.get(`/teacher/conversations/${id}/messages`, { params: { page, limit } }).then((r) => r.data),
  enviarMensagemProfessor: (id, message) =>
    api.post(`/teacher/conversations/${id}/messages`, { message }).then((r) => r.data),
  encerrarConversaProfessor: (id) => api.patch(`/teacher/conversations/${id}/close`).then((r) => r.data),

  // Aluno -> Professor (conversas iniciadas pelo aluno)
  listarConversasProfessorAluno: () => api.get('/students/me/teacher-conversations').then((r) => r.data),
  criarConversaProfessorAluno: (data) => api.post('/students/me/teacher-conversations', data).then((r) => r.data),
  mensagensConversaProfessorAluno: (id, page = 1, limit = 30) =>
    api.get(`/students/me/teacher-conversations/${id}/messages`, { params: { page, limit } }).then((r) => r.data),
  enviarMensagemProfessorAluno: (id, message) =>
    api.post(`/students/me/teacher-conversations/${id}/messages`, { message }).then((r) => r.data),

  getSocketUrl: () => (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, ''),
}
