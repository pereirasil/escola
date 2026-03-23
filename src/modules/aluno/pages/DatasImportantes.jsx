import { useQuery } from '@tanstack/react-query'
import { Card, Spinner } from '../../../components/ui'
import { calendarEventsService } from '../../../services/calendarEvents.service'
import { useAuthStore } from '../../../store/useAuthStore'

export default function DatasImportantes() {
  const studentId = useAuthStore((s) => s.studentId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['aluno', 'datas-importantes', studentId],
    queryFn: () => calendarEventsService.listarParaAluno(),
    enabled: !!studentId,
  })
  const eventos = data?.data || []

  const formatarData = (dataString) => {
    if (!dataString) return '-'
    const [year, month, day] = dataString.split('-')
    if (!year || !month || !day) return dataString
    return `${day}/${month}/${year}`
  }

  if (isLoading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <Card title="Datas Importantes">
        {eventos.length === 0 ? (
          <div className="empty-state">Nenhum aviso para a sua série.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {eventos.map((ev) => (
              <li
                key={ev.id}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  borderLeft: '4px solid #646cff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{ev.title}</strong>
                  <span style={{ color: '#646cff', fontWeight: 500 }}>{formatarData(ev.date)}</span>
                </div>
                {ev.description && (
                  <p style={{ margin: '0.5rem 0 0', color: '#666' }}>{ev.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
