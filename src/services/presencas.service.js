import { api } from './api'

export const presencasService = {
  listar: () => api.get('/presencas'),
  buscarPorTurma: (turmaId) => api.get(`/presencas/turma/${turmaId}`),
  salvarChamada: (presencas) => api.post('/presencas', presencas),
  
  // Relatórios
  historicoAluno: (alunoId) => api.get(`/presencas/historico/aluno/${alunoId}`),
  frequenciaTurma: (turmaId) => api.get(`/presencas/relatorio/turma/${turmaId}`),
  rankingFaltas: () => api.get('/presencas/ranking-faltas'),
  /** Professor: só disciplinas dele na turma. Query opcional: dataInicio, dataFim (YYYY-MM-DD) */
  historicoTurma: (turmaId, params = {}) => {
    const q = new URLSearchParams()
    if (params.dataInicio) q.set('dataInicio', params.dataInicio)
    if (params.dataFim) q.set('dataFim', params.dataFim)
    const s = q.toString()
    return api.get(`/presencas/historico-turma/${turmaId}${s ? `?${s}` : ''}`)
  },
}
