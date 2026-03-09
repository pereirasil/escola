import { api } from './api'

export const materiasService = {
  listar: () => api.get('/subjects'),
  buscarPorId: (id) => api.get(`/subjects/${id}`),
  criar: (data) => api.post('/subjects', data),
  atualizar: (id, data) => api.patch(`/subjects/${id}`, data),
  excluir: (id) => api.delete(`/subjects/${id}`),
}
