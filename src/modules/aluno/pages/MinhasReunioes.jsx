import { useState, useEffect } from 'react'
import { Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

export default function MinhasReunioes() {
  const [loading, setLoading] = useState(true)
  const [reunioes, setReunioes] = useState([])

  useEffect(() => {
    alunosService
      .minhasReunioes()
      .then((data) => setReunioes(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erro ao carregar reuniões.'))
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
      <h2>Reuniões</h2>
      {reunioes.length === 0 ? (
        <p style={{ color: '#666', marginTop: '1rem' }}>
          Não há reuniões agendadas para sua turma ou série.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {reunioes.map((r) => (
            <div
              key={r.id}
              style={{
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                backgroundColor: '#fff',
                width: '100%',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>{r.titulo}</h3>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#555' }}>
                Data: {formatarData(r.data)}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#555' }}>
                Horário: {r.horario || '-'}
              </p>
              {r.local && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#555' }}>
                  Local: {r.local}
                </p>
              )}
              {r.descricao && (
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: '#444', lineHeight: 1.5 }}>
                  {r.descricao}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
