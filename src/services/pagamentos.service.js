import { api } from './api'

export const pagamentosService = {
  listar: () => api.get('/payments'),
  buscarPorId: (id) => api.get(`/payments/${id}`),
  criar: (data) => api.post('/payments', data),
  atualizar: (id, data) => api.put(`/payments/${id}`, data),
}
