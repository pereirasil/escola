import { api } from './api'

export const professoresService = {
  listar: () => api.get('/teachers'),
  buscarPorId: (id) => api.get(`/teachers/${id}`),
  criar: (data) => api.post('/teachers', data),
  atualizar: (id, data) => api.put(`/teachers/${id}`, data),
  excluir: (id) => api.delete(`/teachers/${id}`),
  me: () => api.get('/teachers/me').then((r) => r.data),
  minhasTurmas: () => api.get('/teachers/me/classes').then((r) => r.data),
  alterarSenha: (currentPassword, newPassword) =>
    api.patch('/teachers/me/password', { currentPassword, newPassword }).then((r) => r.data),
}
