import { api } from './api'

export const alunosService = {
  listar: () => api.get('/students'),
  buscarPorId: (id) => api.get(`/students/${id}`),
  criar: (data) => api.post('/students', data),
  atualizar: (id, data) => api.put(`/students/${id}`, data),
  excluir: (id) => api.delete(`/students/${id}`),
  me: () => api.get('/students/me').then((r) => r.data),
  minhasNotificacoes: () => api.get('/students/me/notifications').then((r) => r.data),
  alterarSenha: (currentPassword, newPassword) =>
    api.patch('/students/me/password', { currentPassword, newPassword }).then((r) => r.data),
}
