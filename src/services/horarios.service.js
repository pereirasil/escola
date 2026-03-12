import { api } from './api'

export const horariosService = {
  listar: (classId) => api.get('/schedules' + (classId ? `?class_id=${classId}` : '')),
  meusHorarios: () => api.get('/schedules/me').then((r) => r.data),
  buscarPorId: (id) => api.get(`/schedules/${id}`),
  criar: (data) => api.post('/schedules', data),
  atualizar: (id, data) => api.put(`/schedules/${id}`, data),
  excluir: (id) => api.delete(`/schedules/${id}`),
}
