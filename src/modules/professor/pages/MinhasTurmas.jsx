import { useState, useEffect } from 'react'
import { Card, Spinner } from '../../../components/ui'
import { professoresService } from '../../../services/professores.service'
import toast from 'react-hot-toast'

export default function MinhasTurmas() {
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    professoresService
      .minhasTurmas()
      .then(setTurmas)
      .catch(() => toast.error('Erro ao carregar turmas.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <Card title="Minhas Turmas">
        {loading ? (
          <Spinner />
        ) : turmas.length === 0 ? (
          <div className="empty-state">Nenhuma turma atribuida.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {turmas.map((t) => (
              <li
                key={t.id}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  borderLeft: '4px solid #646cff',
                }}
              >
                <strong>{t.name}</strong>
                {t.grade && <span style={{ color: '#888', marginLeft: '0.5rem' }}>{t.grade}</span>}
                {t.shift && <span style={{ color: '#888', marginLeft: '0.5rem' }}>{t.shift}</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
