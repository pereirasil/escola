import { api } from './api'

export const escolaService = {
  listarMensagensAlunos: () => api.get('/school/student-messages').then((r) => r.data),
  responderMensagem: (id, response) =>
    api.patch(`/school/student-messages/${id}/respond`, { response }).then((r) => r.data),
}
