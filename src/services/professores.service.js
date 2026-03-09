import { api } from './api'

export const professoresService = {
  listar: () => api.get('/teachers'),
  buscarPorId: (id) => api.get(`/teachers/${id}`),
  criar: (data) => api.post('/teachers', data),
  atualizar: (id, data) => api.patch(`/teachers/${id}`, data),
  excluir: (id) => api.delete(`/teachers/${id}`),
}
