import { api } from './api'

export const bancoService = {
  listar: () => api.get('/bank-accounts'),
  listarBancos: () => api.get('/banks').then((r) => r.data),
  buscarPorId: (id) => api.get(`/bank-accounts/${id}`),
  criar: (data) => api.post('/bank-accounts', data),
  atualizar: (id, data) => api.put(`/bank-accounts/${id}`, data),
  excluir: (id) => api.delete(`/bank-accounts/${id}`),
}
