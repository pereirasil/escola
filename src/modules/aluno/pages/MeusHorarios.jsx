import { useState, useEffect } from 'react'
import { Card, DataTable, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

const ORDEM_DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function MeusHorarios() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alunosService.meusHorarios()
      .then((data) => {
        const sorted = (data || []).sort((a, b) => {
          const diaA = ORDEM_DIAS.indexOf(a.day_of_week)
          const diaB = ORDEM_DIAS.indexOf(b.day_of_week)
          if (diaA !== diaB) return diaA - diaB
          return a.start_time.localeCompare(b.start_time)
        })
        setHorarios(sorted)
      })
      .catch(() => toast.error('Erro ao carregar horários.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <Card title="Meu Horário Semanal">
        <DataTable
          columns={['Dia', 'Horário', 'Sala', 'Matéria', 'Professor']}
          data={horarios}
          emptyMessage="Nenhum horário cadastrado para a sua turma."
          renderRow={(h) => (
            <tr key={h.id}>
              <td>{h.day_of_week}</td>
              <td>{h.start_time} - {h.end_time}</td>
              <td>{h.room || '-'}</td>
              <td>{h.materia}</td>
              <td>{h.professor}</td>
            </tr>
          )}
        />
      </Card>
    </div>
  )
}
