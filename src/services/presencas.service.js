import { api } from './api'

export const presencasService = {
  listar: () => api.get('/presencas'),
  buscarPorTurma: (turmaId) => api.get(`/presencas/turma/${turmaId}`),
  salvarChamada: (presencas) => api.post('/presencas', presencas),
  
  // Relatórios
  historicoAluno: (alunoId) => api.get(`/presencas/historico/aluno/${alunoId}`),
  frequenciaTurma: (turmaId) => api.get(`/presencas/relatorio/turma/${turmaId}`),
  rankingFaltas: () => api.get('/presencas/ranking-faltas'),
}
