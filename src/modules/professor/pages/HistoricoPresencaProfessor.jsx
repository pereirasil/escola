import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, SelectField, FormInput, Spinner } from '../../../components/ui'
import { presencasService } from '../../../services/presencas.service'
import { professoresService } from '../../../services/professores.service'
import { turmasService } from '../../../services/turmas.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

function labelTurma(t) {
  if (t.grade && t.name) return `${t.grade} - ${t.name}`
  return t.room || t.name || String(t.id)
}

const STATUS_LABEL = {
  P: 'Presente',
  F: 'Falta',
  A: 'Atraso',
  J: 'Justificado',
}

function StatusBadge({ status }) {
  const cls = `presenca-status-badge presenca-status-badge--${status}`
  return <span className={cls}>{STATUS_LABEL[status] || status}</span>
}

export default function HistoricoPresencaProfessor() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'
  const [turmas, setTurmas] = useState([])
  const [turmaId, setTurmaId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [payload, setPayload] = useState({ alunos: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadTurmas() {
      try {
        const turmasData = isTeacher
          ? await professoresService.minhasTurmas()
          : (await turmasService.listar()).data || []
        setTurmas(turmasData || [])
      } catch {
        toast.error('Erro ao carregar turmas')
      }
    }
    loadTurmas()
  }, [isTeacher])

  useEffect(() => {
    if (!turmaId) {
      setPayload({ alunos: [] })
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const res = await presencasService.historicoTurma(turmaId, {
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        })
        if (!cancelled) setPayload(res.data || { alunos: [] })
      } catch {
        if (!cancelled) {
          setPayload({ alunos: [] })
          toast.error('Erro ao carregar histórico de presença')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [turmaId, dataInicio, dataFim])

  const alunos = payload.alunos || []

  return (
    <div className="page">
      <PageHeader
        title="Histórico de presença"
        description="Registros de chamada por aluno na turma (suas disciplinas)."
      />

      <Card title="Filtros">
        <div className="form-grid">
          <SelectField
            label="Turma"
            id="turma-hist-pres"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            options={turmas.map((t) => ({ value: t.id, label: labelTurma(t) }))}
          />
          <FormInput
            label="Data inicial (opcional)"
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <FormInput
            label="Data final (opcional)"
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <p className="field-hint" style={{ marginTop: '0.75rem' }}>
          <Link to="/professor/historico">Ver resumo de frequência por turma</Link>
        </p>
      </Card>

      {turmaId && (
        <Card title="Registros por aluno">
          {loading ? (
            <Spinner />
          ) : alunos.length === 0 ? (
            <div className="empty-state">Nenhum registro encontrado.</div>
          ) : (
            <div className="historico-presenca-alunos">
              {alunos.map((a) => (
                <div
                  key={a.aluno_id}
                  className={`historico-presenca-bloco${a.alerta_faltas ? ' historico-presenca-bloco--alerta' : ''}`}
                >
                  <div className="historico-presenca-bloco-header">
                    <strong>{a.nome}</strong>
                    <span className="historico-presenca-stats">
                      {a.total_registros} registro(s) · {a.faltas} falta(s) ·{' '}
                      <span
                        className={
                          a.frequencia_percentual < 75
                            ? 'historico-presenca-freq--baixa'
                            : 'historico-presenca-freq--ok'
                        }
                      >
                        {a.frequencia_percentual}% presença
                      </span>
                    </span>
                  </div>
                  {a.registros.length === 0 ? (
                    <p className="field-hint">Sem linhas.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table historico-presenca-tabela">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Matéria</th>
                            <th>Aula</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.registros.map((r, idx) => (
                            <tr key={`${r.data}-${r.aula}-${r.materia_id}-${idx}`}>
                              <td>
                                {r.data
                                  ? new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR')
                                  : '-'}
                              </td>
                              <td>{r.materia_nome}</td>
                              <td>{r.aula}</td>
                              <td>
                                <StatusBadge status={r.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
