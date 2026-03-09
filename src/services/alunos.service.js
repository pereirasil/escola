import { api } from './api'

export const alunosService = {
  listar: () => api.get('/students'),
  buscarPorId: (id) => api.get(`/students/${id}`),
  criar: (data) => api.post('/students', data),
  atualizar: (id, data) => api.patch(`/students/${id}`, data),
  excluir: (id) => api.delete(`/students/${id}`),
}
