import { api } from './api'

export const calendarEventsService = {
  listar: () => api.get('/calendar-events'),
  criar: (data) => api.post('/calendar-events', data),
  atualizar: (id, data) => api.put(`/calendar-events/${id}`, data),
  excluir: (id) => api.delete(`/calendar-events/${id}`),
  listarParaAluno: () => api.get('/calendar-events/student/me'),
}
