import { useState, useEffect } from 'react'
import { Card, Spinner } from '../../../components/ui'
import { professoresService } from '../../../services/professores.service'
import { horariosService } from '../../../services/horarios.service'
import { materiasService } from '../../../services/materias.service'
import toast from 'react-hot-toast'

export default function MinhasTurmas() {
  const [turmas, setTurmas] = useState([])
  const [horarios, setHorarios] = useState([])
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      professoresService.minhasTurmas(),
      horariosService.meusHorarios(),
      materiasService.listar().then((r) => r.data || []),
    ])
      .then(([t, h, m]) => {
        setTurmas(t || [])
        setHorarios(h || [])
        setMaterias(m || [])
      })
      .catch(() => toast.error('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  const getMateriaNome = (subjectId) => {
    const m = materias.find((item) => item.id === subjectId)
    return m ? m.name : '-'
  }

  const getHorariosDaTurma = (classId) =>
    horarios
      .filter((h) => h.class_id === classId)
      .sort((a, b) => {
        const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        const diaA = dias.indexOf(a.day_of_week)
        const diaB = dias.indexOf(b.day_of_week)
        if (diaA !== diaB) return diaA - diaB
        return a.start_time.localeCompare(b.start_time)
      })

  if (loading) {
    return <div className="page"><Spinner /></div>
  }

  return (
    <div className="page">
      <Card title="Minhas Turmas">
        {turmas.length === 0 ? (
          <div className="empty-state">Nenhuma turma atribuída.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {turmas.map((t) => {
              const horariosTurma = getHorariosDaTurma(t.id)
              return (
                <div
                  key={t.id}
                  style={{
                    borderRadius: '8px',
                    borderLeft: '4px solid #646cff',
                    padding: '1rem',
                  }}
                >
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '1.05rem' }}>{t.name}</strong>
                    {t.grade && <span style={{ color: '#888', marginLeft: '0.75rem' }}>{t.grade}</span>}
                    {t.shift && <span style={{ color: '#888', marginLeft: '0.75rem' }}>{t.shift}</span>}
                  </div>

                  {horariosTurma.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.875rem', margin: 0 }}>
                      Nenhum horário vinculado nesta turma.
                    </p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ fontSize: '0.875rem' }}>
                        <thead>
                          <tr>
                            <th>Dia</th>
                            <th>Horário</th>
                            <th>Matéria</th>
                            <th>Sala</th>
                          </tr>
                        </thead>
                        <tbody>
                          {horariosTurma.map((h) => (
                            <tr key={h.id}>
                              <td>{h.day_of_week}</td>
                              <td>{h.start_time} - {h.end_time}</td>
                              <td>{getMateriaNome(h.subject_id)}</td>
                              <td>{h.room || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
