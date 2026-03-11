import { api } from './api'

export const professoresService = {
  listar: () => api.get('/teachers'),
  buscar: (q, limit = 20) => api.get(`/teachers?q=${encodeURIComponent(q || '')}&limit=${limit}`).then((r) => r.data),
  listarPaginado: (page, limit = 10) => api.get(`/teachers?page=${page}&limit=${limit}`).then((r) => r.data),
  buscarPorId: (id) => api.get(`/teachers/${id}`),
  criar: (data) => api.post('/teachers', data),
  atualizar: (id, data) => api.put(`/teachers/${id}`, data),
  excluir: (id) => api.delete(`/teachers/${id}`),
  uploadFoto: (id, file) => {
    const form = new FormData()
    form.append('photo', file)
    return api.post(`/teachers/${id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  me: () => api.get('/teachers/me').then((r) => r.data),
  minhasTurmas: () => api.get('/teachers/me/classes').then((r) => r.data),
  alterarSenha: (currentPassword, newPassword) =>
    api.patch('/teachers/me/password', { currentPassword, newPassword }).then((r) => r.data),
  uploadMinhaFoto: (file) => {
    const form = new FormData()
    form.append('photo', file)
    return api.post('/teachers/me/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  },
}
