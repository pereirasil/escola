import { useState, useEffect } from 'react'
import { Card, Spinner } from '../../../components/ui'
import { calendarEventsService } from '../../../services/calendarEvents.service'
import toast from 'react-hot-toast'

export default function DatasImportantes() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calendarEventsService
      .listarParaAluno()
      .then((res) => setEventos(res.data || []))
      .catch(() => toast.error('Erro ao carregar datas.'))
      .finally(() => setLoading(false))
  }, [])

  const formatarData = (dataString) => {
    if (!dataString) return '-'
    const [year, month, day] = dataString.split('-')
    if (!year || !month || !day) return dataString
    return `${day}/${month}/${year}`
  }

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <Card title="Datas Importantes">
        {eventos.length === 0 ? (
          <div className="empty-state">Nenhuma data comemorativa para a sua série.</div>
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
