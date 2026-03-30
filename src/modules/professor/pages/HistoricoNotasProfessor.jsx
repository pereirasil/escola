import { useState, useEffect } from 'react'
import { Card, PageHeader, SelectField, Spinner } from '../../../components/ui'
import { turmasService } from '../../../services/turmas.service'
import { notasService } from '../../../services/notas.service'
import { professoresService } from '../../../services/professores.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

const BIMESTRES = [
  { value: '1º Bimestre', label: '1º Bimestre' },
  { value: '2º Bimestre', label: '2º Bimestre' },
  { value: '3º Bimestre', label: '3º Bimestre' },
  { value: '4º Bimestre', label: '4º Bimestre' },
  { value: 'Recuperação', label: 'Recuperação' },
  { value: 'Exame Final', label: 'Exame Final' },
]

function labelTurma(t) {
  if (t.grade && t.name) return `${t.grade} - ${t.name}`
  return t.room || t.name || String(t.id)
}

const MSG_SEM_MATERIA =
  'Nenhuma matéria vinculada a este professor nesta turma.'

export default function HistoricoNotasProfessor() {
  const user = useAuthStore((s) => s.user)
  const isTeacher = user?.role === 'teacher'
  const [turmas, setTurmas] = useState([])
  const [materias, setMaterias] = useState([])
  const [loadingMaterias, setLoadingMaterias] = useState(false)
  const [form, setForm] = useState({
    turma_id: '',
    materia_id: '',
    bimestre: '1º Bimestre',
  })
  const [linhas, setLinhas] = useState([])
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
    if (!isTeacher) return
    if (!form.turma_id) {
      setMaterias([])
      return
    }
    let cancelled = false
    setLoadingMaterias(true)
    ;(async () => {
      try {
        const data = await professoresService.minhasMateriasNaTurma(form.turma_id)
        if (!cancelled) setMaterias(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) {
          setMaterias([])
          toast.error('Erro ao carregar matérias desta turma')
        }
      } finally {
        if (!cancelled) setLoadingMaterias(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isTeacher, form.turma_id])

  useEffect(() => {
    if (!form.turma_id || !form.materia_id || !form.bimestre) {
      setLinhas([])
      return
    }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const [resAlunos, resNotas] = await Promise.all([
          notasService.buscarAlunosPorTurma(form.turma_id),
          notasService.buscarFiltros(form.turma_id, form.materia_id, form.bimestre),
        ])
        if (cancelled) return
        const alunos = resAlunos.data || []
        const notas = resNotas.data || []
        const mapa = new Map(notas.map((n) => [n.aluno_id, n.nota]))
        setLinhas(
          alunos.map((aluno) => ({
            id: aluno.id,
            nome: aluno.name,
            nota: mapa.has(aluno.id) ? mapa.get(aluno.id) : null,
          })),
        )
      } catch {
        if (!cancelled) {
          setLinhas([])
          toast.error('Erro ao carregar notas')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form.turma_id, form.materia_id, form.bimestre])

  const handleChange = (e) => {
    const { id, value } = e.target
    if (id === 'turma_id') {
      setForm((p) => ({ ...p, turma_id: value, materia_id: '' }))
      return
    }
    setForm((p) => ({ ...p, [id]: value }))
  }

  const comNota = linhas.filter((l) => l.nota !== null && l.nota !== undefined)

  return (
    <div className="page">
      <PageHeader
        title="Histórico de notas"
        description="Consulta das notas já lançadas por turma, matéria e bimestre."
      />

      <Card title="Filtros">
        <div className="form-grid">
          <SelectField
            label="Turma"
            id="turma_id"
            value={form.turma_id}
            onChange={handleChange}
            options={turmas.map((t) => ({ value: t.id, label: labelTurma(t) }))}
          />
          <SelectField
            label="Matéria"
            id="materia_id"
            value={form.materia_id}
            onChange={handleChange}
            disabled={isTeacher && (!form.turma_id || loadingMaterias)}
            options={materias.map((m) => ({ value: m.id, label: m.name }))}
          />
          {isTeacher && form.turma_id && loadingMaterias && (
            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Spinner />
              <span className="field-hint">Carregando matérias…</span>
            </div>
          )}
          {isTeacher && form.turma_id && !loadingMaterias && materias.length === 0 && (
            <p className="field-hint" style={{ gridColumn: '1 / -1', marginTop: '-0.5rem' }}>
              {MSG_SEM_MATERIA}
            </p>
          )}
          <SelectField
            label="Bimestre"
            id="bimestre"
            value={form.bimestre}
            onChange={handleChange}
            options={BIMESTRES}
          />
        </div>
      </Card>

      {form.turma_id && form.materia_id && form.bimestre && (
        <Card title="Alunos e notas">
          {loading ? (
            <Spinner />
          ) : linhas.length === 0 ? (
            <div className="empty-state">Nenhum aluno encontrado nesta turma.</div>
          ) : (
            <>
              <p className="field-hint" style={{ marginBottom: '1rem' }}>
                {comNota.length} de {linhas.length} aluno(s) com nota neste bimestre.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((l) => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 500 }}>{l.nome}</td>
                        <td>{l.nota !== null && l.nota !== undefined ? l.nota : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
