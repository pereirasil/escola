import { useState, useEffect, useMemo } from 'react'
import { Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DIAS_GRADE = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
const DIAS_GRADE_ABREV = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']

function AulaCard({ aula }) {
  return (
    <div className="meus-horarios-aula-card">
      <div className="meus-horarios-aula-materia">{aula?.materia ?? '-'}</div>
      <div className="meus-horarios-aula-horario">
        {aula?.start_time ?? '-'} - {aula?.end_time ?? '-'}
      </div>
      <div className="meus-horarios-aula-meta">
        {aula?.room ? `Sala ${aula.room}` : 'Sala não informada'}
      </div>
      <div className="meus-horarios-aula-professor">
        {aula?.professor ?? '-'}
      </div>
    </div>
  )
}

export default function MeusHorarios() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alunosService.meusHorarios()
      .then((data) => {
        const sorted = (data || []).sort((a, b) => {
          const diaA = DIAS_SEMANA.indexOf(a.day_of_week)
          const diaB = DIAS_SEMANA.indexOf(b.day_of_week)
          if (diaA !== diaB) return diaA - diaB
          return (a.start_time || '').localeCompare(b.start_time || '')
        })
        setHorarios(sorted)
      })
      .catch(() => toast.error('Erro ao carregar horários.'))
      .finally(() => setLoading(false))
  }, [])

  const diaAtual = useMemo(() => DIAS_SEMANA[new Date().getDay()], [])
  const diaInicialGrade = useMemo(
    () => (DIAS_GRADE.includes(diaAtual) ? diaAtual : DIAS_GRADE[0]),
    [diaAtual],
  )
  const [diaSelecionado, setDiaSelecionado] = useState(diaInicialGrade)

  const aulasHoje = useMemo(
    () => horarios.filter((h) => h.day_of_week === diaAtual),
    [horarios, diaAtual],
  )
  const horariosPorDia = useMemo(() => {
    const mapa = {}
    for (const dia of DIAS_GRADE) {
      mapa[dia] = horarios.filter((h) => h.day_of_week === dia)
    }
    return mapa
  }, [horarios])

  if (loading) return <div className="page"><Spinner /></div>

  if (horarios.length === 0) {
    return (
      <div className="page">
        <div className="meus-horarios-empty">
          Nenhum horário cadastrado para sua turma.
        </div>
      </div>
    )
  }

  return (
    <div className="page meus-horarios-page">
      <section className="meus-horarios-hoje">
        <h2 className="meus-horarios-section-title">Hoje - {diaAtual}</h2>
        {aulasHoje.length > 0 ? (
          <div className="meus-horarios-hoje-cards">
            {aulasHoje.map((aula) => (
              <AulaCard key={aula.id} aula={aula} />
            ))}
          </div>
        ) : (
          <div className="meus-horarios-vazio-dia">
            Não há aulas para hoje.
          </div>
        )}
      </section>

      <section className="meus-horarios-grade">
        <h2 className="meus-horarios-section-title">Grade semanal</h2>
        <div className="meus-horarios-grade-tabs" role="tablist" aria-label="Selecionar dia da semana">
          {DIAS_GRADE.map((dia, idx) => (
            <button
              key={dia}
              type="button"
              role="tab"
              aria-selected={diaSelecionado === dia}
              aria-controls={`grade-dia-${dia}`}
              id={`tab-${dia}`}
              className={`meus-horarios-grade-tab ${diaSelecionado === dia ? 'meus-horarios-grade-tab-active' : ''}`}
              onClick={() => setDiaSelecionado(dia)}
            >
              {DIAS_GRADE_ABREV[idx]}
            </button>
          ))}
        </div>
        <div className="meus-horarios-grade-mobile">
          <div
            id={`grade-dia-${diaSelecionado}`}
            className="meus-horarios-grade-mobile-painel"
            role="tabpanel"
            aria-labelledby={`tab-${diaSelecionado}`}
          >
            <h3 className="meus-horarios-dia-titulo">{diaSelecionado}</h3>
            {(horariosPorDia[diaSelecionado] || []).length > 0 ? (
              <div className="meus-horarios-grade-cards">
                {(horariosPorDia[diaSelecionado] || []).map((aula) => (
                  <AulaCard key={aula.id} aula={aula} />
                ))}
              </div>
            ) : (
              <div className="meus-horarios-vazio-dia">Nenhuma aula neste dia.</div>
            )}
          </div>
        </div>
        <div className="meus-horarios-grade-grid">
          {DIAS_GRADE.map((dia) => (
            <div key={dia} className="meus-horarios-grade-coluna">
              <h3 className="meus-horarios-dia-titulo">{dia}</h3>
              <div className="meus-horarios-grade-cards">
                {(horariosPorDia[dia] || []).map((aula) => (
                  <AulaCard key={aula.id} aula={aula} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
