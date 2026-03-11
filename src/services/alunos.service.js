import { api } from './api'

export const alunosService = {
  listar: () => api.get('/students'),
  buscar: (q, limit = 20) => api.get(`/students?q=${encodeURIComponent(q || '')}&limit=${limit}`).then((r) => r.data),
  listarPaginado: (page, limit = 10) => api.get(`/students?page=${page}&limit=${limit}`).then((r) => r.data),
  buscarPorId: (id) => api.get(`/students/${id}`),
  criar: (data) => api.post('/students', data),
  atualizar: (id, data) => api.put(`/students/${id}`, data),
  excluir: (id) => api.delete(`/students/${id}`),
  uploadFoto: (id, file) => {
    const form = new FormData()
    form.append('photo', file)
    return api.post(`/students/${id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  me: () => api.get('/students/me').then((r) => r.data),
  minhasNotificacoes: () => api.get('/students/me/notifications').then((r) => r.data),
  contarNotificacoesNaoLidas: () => api.get('/students/me/notifications/count').then((r) => r.data),
  marcarNotificacoesComoLidas: () => api.patch('/students/me/notifications/read').then((r) => r.data),
  meuHistorico: () => api.get('/students/me/historico').then((r) => r.data),
  alterarSenha: (currentPassword, newPassword) =>
    api.patch('/students/me/password', { currentPassword, newPassword }).then((r) => r.data),
  uploadMinhaFoto: (file) => {
    const form = new FormData()
    form.append('photo', file)
    return api.post('/students/me/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },
}
