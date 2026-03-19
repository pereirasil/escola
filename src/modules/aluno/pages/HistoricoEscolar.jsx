import { useState, useEffect } from 'react'
import { Card, DataTable, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

const ANOS = [2026, 2025, 2024]
const BIMESTRES = [1, 2, 3, 4]

const mapStatus = (status) => {
  if (!status) return '-'
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
  const parts = String(dateStr).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

function toBimestreValue(val) {
  if (val === null || val === undefined) return 1
  const n = Number(val)
  return isNaN(n) ? 1 : n
}

export default function HistoricoEscolar() {
  const { user } = useAuthStore()
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('boletim')
  const [ano, setAno] = useState(new Date().getFullYear().toString())
  const [bimestre, setBimestre] = useState(1)

  useEffect(() => {
    alunosService.meuHistorico()
      .then((res) => setDados(res ?? null))
      .catch(() => {
        toast.error('Erro ao carregar histórico.')
        setDados(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>
  if (!dados) return <div className="page"><div className="empty-state">Não foi possível carregar o histórico.</div></div>

  const resumo = dados?.resumo ?? { total: 0, faltas: 0, presentes: 0, frequencia: 100 }
  const historico = dados?.historico ?? []
  const avaliacoesPorDisciplina = dados?.avaliacoesPorDisciplina ?? []

  const bimestreNum = toBimestreValue(bimestre)

  const notasFiltradas = historico
    .filter((item) => toBimestreValue(item?.bimestre) === bimestreNum)
    .map((item) => ({
      materia: item?.materia ?? '-',
      bimestre: toBimestreValue(item?.bimestre),
      nota: Number(item?.nota) ?? 0,
    }))
    .sort((a, b) => a.materia.localeCompare(b.materia))

  const seenPresencas = new Set()
  const todosRegistros = []
  for (const item of historico) {
    const materia = item?.materia ?? '-'
    const presencas = item?.presencas ?? []
    for (const r of presencas) {
      const key = `${r?.data ?? ''}-${r?.aula ?? ''}-${materia}`
      if (key && !seenPresencas.has(key)) {
        seenPresencas.add(key)
        const dateStr = r?.data ?? ''
        const anoPresenca = dateStr ? String(dateStr).split('-')[0] : ''
        if (!ano || anoPresenca === String(ano)) {
          todosRegistros.push({
            data: r?.data ?? '',
            aula: r?.aula ?? '-',
            materia,
            status: r?.status ?? '',
            observacao: r?.observacao ?? null,
          })
        }
      }
    }
  }
  todosRegistros.sort((a, b) => (b?.data ?? '').localeCompare(a?.data ?? ''))

  const avaliacoesFiltradas = avaliacoesPorDisciplina
    .filter((d) => toBimestreValue(d?.bimestre) === bimestreNum)

  const avaliacoesLinhas = []
  for (const d of avaliacoesFiltradas) {
    const materia = d?.materia ?? '-'
    const bimestreItem = toBimestreValue(d?.bimestre)
    for (const av of d?.avaliacoes ?? []) {
      avaliacoesLinhas.push({
        materia,
        tipo: av?.tipo ?? '-',
        nota: av?.nota != null ? Number(av.nota) : null,
        bimestre: bimestreItem,
      })
    }
  }

  return (
    <div className="pedagogico-page">
      <section className="pedagogico-profile">
        <div>
          <h2 className="pedagogico-profile-name">{user?.name ?? 'Aluno'}</h2>
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
          onChange={(e) => setBimestre(Number(e.target.value))}
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
                  style={{ color: (resumo?.frequencia ?? 100) < 75 ? '#dc2626' : '#16a34a' }}
                >
                  {resumo?.frequencia ?? 0}%
                </div>
              </div>
              <div className="pedagogico-boletim-card">
                <div className="pedagogico-boletim-card-label">Aulas Presentes</div>
                <div className="pedagogico-boletim-card-value" style={{ color: '#2563eb' }}>
                  {resumo?.presentes ?? 0}
                </div>
              </div>
              <div className="pedagogico-boletim-card">
                <div className="pedagogico-boletim-card-label">Total de Faltas</div>
                <div
                  className="pedagogico-boletim-card-value"
                  style={{ color: (resumo?.faltas ?? 0) > 0 ? '#dc2626' : '#6b7280' }}
                >
                  {resumo?.faltas ?? 0}
                </div>
              </div>
            </div>

            <Card title="Boletim de Notas">
              <DataTable
                columns={['Matéria', 'Bimestre', 'Nota']}
                data={notasFiltradas}
                emptyMessage="Nenhuma nota lançada para o bimestre selecionado."
                renderRow={(n, idx) => (
                  <tr key={idx}>
                    <td>{n.materia}</td>
                    <td>{n.bimestre} Bimestre</td>
                    <td>
                      <strong style={{ color: (n.nota ?? 0) >= 6 ? '#4ade80' : '#f87171' }}>
                        {Number(n.nota ?? 0).toFixed(1)}
                      </strong>
                    </td>
                  </tr>
                )}
              />
            </Card>

            <Card title="Histórico de Presença">
              <DataTable
                columns={['Data', 'Aula', 'Matéria', 'Status', 'Observação']}
                data={todosRegistros}
                emptyMessage="Nenhuma chamada registrada."
                renderRow={(r, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(r?.data)}</td>
                    <td>{r?.aula ?? '-'}</td>
                    <td>{r?.materia ?? '-'}</td>
                    <td>{mapStatus(r?.status)}</td>
                    <td style={{ color: '#888' }}>{r?.observacao ?? '-'}</td>
                  </tr>
                )}
              />
            </Card>
          </>
        )}

        {tab === 'avaliacoes' && (
          <>
            {avaliacoesLinhas.length === 0 ? (
              <div className="empty-state">Nenhuma avaliação para o bimestre selecionado.</div>
            ) : (
              <Card title="Avaliações por Disciplina">
                <DataTable
                  columns={['Matéria', 'Tipo de Avaliação', 'Nota', 'Bimestre']}
                  data={avaliacoesLinhas}
                  emptyMessage="Nenhuma avaliação encontrada."
                  renderRow={(av, idx) => (
                    <tr key={idx}>
                      <td>{av.materia}</td>
                      <td>{av.tipo}</td>
                      <td>
                        {av.nota != null ? (
                          <span className={(av.nota ?? 0) >= 6 ? 'nota-aprovado' : 'nota-reprovado'}>
                            {Number(av.nota).toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{av.bimestre} Bimestre</td>
                    </tr>
                  )}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
