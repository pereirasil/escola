import { useState, useEffect } from 'react'
import { Card, DataTable, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const mapStatus = (status) => {
  switch (status) {
    case 'P': return <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Presente</span>
    case 'F': return <span style={{ color: '#f87171', fontWeight: 'bold' }}>Falta</span>
    case 'A': return <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Atraso</span>
    case 'J': return <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Falta Justificada</span>
    default: return status
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

const ANOS = [2026, 2025, 2024]
const BIMESTRES = ['1', '2', '3', '4']

export default function HistoricoEscolar() {
  const { user } = useAuthStore()
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('boletim')
  const [ano, setAno] = useState(new Date().getFullYear().toString())
  const [bimestre, setBimestre] = useState('1')

  useEffect(() => {
    alunosService.meuHistorico()
      .then(setDados)
      .catch(() => toast.error('Erro ao carregar histórico.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>
  if (!dados) return <div className="page"><div className="empty-state">Não foi possível carregar o histórico.</div></div>

  const { historico, resumo, avaliacoesPorDisciplina = [] } = dados

  const todasNotas = []
  const todosRegistros = []

  for (const item of historico) {
    for (const n of item.notas) {
      todasNotas.push({ ...n, materia: item.materia })
    }
    if (item.registros) {
      for (const r of item.registros) {
        todosRegistros.push({ ...r, materia: item.materia })
      }
    }
  }

  todasNotas.sort((a, b) => a.materia.localeCompare(b.materia) || a.bimestre.localeCompare(b.bimestre))
  todosRegistros.sort((a, b) => b.date.localeCompare(a.date))

  const avaliacoesFiltradas = avaliacoesPorDisciplina.filter(
    (a) => a.bimestre === bimestre
  )

  return (
    <div className="pedagogico-page">
      <section className="pedagogico-profile">
        <div className="pedagogico-profile-photo">
          {user?.photo ? (
            <img
              src={user.photo.startsWith('http') ? user.photo : `${API_URL}/uploads/${user.photo}`}
              alt={user.name}
            />
          ) : (
            <div className="pedagogico-profile-placeholder">SEM FOTO</div>
          )}
        </div>
        <div>
          <h2 className="pedagogico-profile-name">{user?.name || 'Aluno'}</h2>
        </div>
      </section>

      <nav className="pedagogico-tabs">
        <button
          type="button"
          className={`pedagogico-tab ${tab === 'boletim' ? 'pedagogico-tab-active' : ''}`}
          onClick={() => setTab('boletim')}
        >
          Boletim
        </button>
        <button
          type="button"
          className={`pedagogico-tab ${tab === 'avaliacoes' ? 'pedagogico-tab-active' : ''}`}
          onClick={() => setTab('avaliacoes')}
        >
          Avaliações
        </button>
      </nav>

      <section className="pedagogico-selectors">
        <select
          className="pedagogico-select"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          aria-label="Ano"
        >
          {ANOS.map((a) => (
            <option key={a} value={String(a)}>{a}</option>
          ))}
        </select>
        <select
          className="pedagogico-select"
          value={bimestre}
          onChange={(e) => setBimestre(e.target.value)}
          aria-label="Bimestre"
        >
          {BIMESTRES.map((b) => (
            <option key={b} value={b}>{b} Bimestre</option>
          ))}
        </select>
      </section>

      <div className="pedagogico-content">
        {tab === 'boletim' && (
          <>
            <div className="pedagogico-boletim-cards">
              <div className="pedagogico-boletim-card">
                <div className="pedagogico-boletim-card-label">Frequência Total</div>
                <div
                  className="pedagogico-boletim-card-value"
                  style={{ color: resumo.frequencia < 75 ? '#dc2626' : '#16a34a' }}
                >
                  {resumo.frequencia}%
                </div>
              </div>
              <div className="pedagogico-boletim-card">
                <div className="pedagogico-boletim-card-label">Aulas Presentes</div>
                <div className="pedagogico-boletim-card-value" style={{ color: '#2563eb' }}>
                  {resumo.presentes}
                </div>
              </div>
              <div className="pedagogico-boletim-card">
                <div className="pedagogico-boletim-card-label">Total de Faltas</div>
                <div
                  className="pedagogico-boletim-card-value"
                  style={{ color: resumo.faltas > 0 ? '#dc2626' : '#6b7280' }}
                >
                  {resumo.faltas}
                </div>
              </div>
            </div>

            <Card title="Boletim de Notas">
              <DataTable
                columns={['Matéria', 'Bimestre', 'Nota']}
                data={todasNotas}
                emptyMessage="Nenhuma nota lançada."
                renderRow={(n, idx) => (
                  <tr key={idx}>
                    <td>{n.materia}</td>
                    <td>{n.bimestre} Bimestre</td>
                    <td>
                      <strong style={{ color: n.nota >= 6 ? '#4ade80' : '#f87171' }}>
                        {Number(n.nota).toFixed(1)}
                      </strong>
                    </td>
                  </tr>
                )}
              />
            </Card>

            <Card title="Histórico de Presença">
              <DataTable
                columns={['Data', 'Horário', 'Aula', 'Matéria', 'Status', 'Observação']}
                data={todosRegistros}
                emptyMessage="Nenhuma chamada registrada."
                renderRow={(r, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(r.date)}</td>
                    <td>{r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'}</td>
                    <td>{r.lesson || '-'}</td>
                    <td>{r.materia}</td>
                    <td>{mapStatus(r.status)}</td>
                    <td style={{ color: '#888' }}>{r.observation || '-'}</td>
                  </tr>
                )}
              />
            </Card>
          </>
        )}

        {tab === 'avaliacoes' && (
          <>
            {avaliacoesFiltradas.length === 0 ? (
              <div className="empty-state">Nenhuma avaliação para o bimestre selecionado.</div>
            ) : (
              avaliacoesFiltradas.map((d) => (
                <div key={`${d.materia_id}-${d.bimestre}`} className="pedagogico-disciplina">
                  <h3 className="pedagogico-disciplina-nome">{d.materia}</h3>
                  <div className="pedagogico-avaliacoes-wrap">
                    <table className="pedagogico-avaliacoes-table">
                      <thead>
                        <tr>
                          <th>Avaliação</th>
                          <th>Valor</th>
                          <th>Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.avaliacoes.map((av, idx) => (
                          <tr key={idx}>
                            <td>{av.tipo}</td>
                            <td>{Number(av.valor).toFixed(2).replace('.', ',')}</td>
                            <td>
                              {av.nota != null ? (
                                <span className={av.nota >= 6 ? 'nota-aprovado' : 'nota-reprovado'}>
                                  {Number(av.nota).toFixed(2).replace('.', ',')}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
