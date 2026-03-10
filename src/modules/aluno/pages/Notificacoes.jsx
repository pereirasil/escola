import { useState, useEffect } from 'react'
import { Card, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

export default function Notificacoes() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alunosService.minhasNotificacoes().then(setLista).catch(() => toast.error('Erro ao carregar notificacoes.')).finally(() => setLoading(false))
    alunosService.marcarNotificacoesComoLidas().catch(() => {})
  }, [])

  return (
    <div className="page">
      <Card title="Notificacoes">
        {loading ? (
          <Spinner />
        ) : lista.length === 0 ? (
          <div className="empty-state">Nenhuma notificacao.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {lista.map((n) => (
              <li key={n.id} style={{ padding: '1rem', marginBottom: '0.5rem', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
                <strong>{n.title}</strong>
                {n.message && <p style={{ margin: '0.5rem 0 0', color: '#aaa' }}>{n.message}</p>}
                <small style={{ color: '#666' }}>{new Date(n.created_at).toLocaleString('pt-BR')}</small>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
