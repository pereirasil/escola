import { api } from './api'

export const turmasService = {
  listar: () => api.get('/classes'),
  buscarPorId: (id) => api.get(`/classes/${id}`),
  criar: (data) => api.post('/classes', data),
  atualizar: (id, data) => api.put(`/classes/${id}`, data),
  excluir: (id) => api.delete(`/classes/${id}`),
}
