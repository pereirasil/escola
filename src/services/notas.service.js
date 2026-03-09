import { api } from './api'

export const notasService = {
  listar: () => api.get('/notas'),
  buscarPorAluno: (alunoId) => api.get(`/notas/aluno/${alunoId}`),
  buscarAlunosPorTurma: (turmaId) => api.get(`/notas/turma/${turmaId}/alunos`),
  buscarFiltros: (turmaId, materiaId, bimestre) => 
    api.get(`/notas/filtros?turmaId=${turmaId}&materiaId=${materiaId}&bimestre=${bimestre}`),
  salvarNotas: (notasArray) => api.post('/notas', notasArray),
}
