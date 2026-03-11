import { api } from './api'

export const turmasService = {
  listar: () => api.get('/classes'),
  buscarPorId: (id) => api.get(`/classes/${id}`),
  listarAlunos: (id) => api.get(`/classes/${id}/students`),
  criar: (data) => api.post('/classes', data),
  atualizar: (id, data) => api.put(`/classes/${id}`, data),
  matricularAluno: (id, studentId) => api.post(`/classes/${id}/enrollments`, { student_id: Number(studentId) }),
  removerMatricula: (id, studentId) => api.delete(`/classes/${id}/enrollments/${studentId}`),
  excluir: (id) => api.delete(`/classes/${id}`),
}
