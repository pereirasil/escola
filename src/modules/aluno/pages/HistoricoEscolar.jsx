import { useState, useEffect } from 'react'
import { Card, DataTable, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

const mapStatus = (status) => {
  switch (status) {
    case 'P': return <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Presente</span>
    case 'F': return <span style={{ color: '#f87171', fontWeight: 'bold' }}>Falta</span>
    case 'A': return <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Atraso</span>
    case 'J': return <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Falta Justificada</span>
    default: return status
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

export default function HistoricoEscolar() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alunosService.meuHistorico()
      .then(setDados)
      .catch(() => toast.error('Erro ao carregar histórico.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>
  if (!dados) return <div className="page"><div className="empty-state">Não foi possível carregar o histórico.</div></div>

  const { historico, resumo } = dados

  const todasNotas = []
  const todosRegistros = []

  for (const item of historico) {
    for (const n of item.notas) {
      todasNotas.push({ ...n, materia: item.materia })
    }
    if (item.registros) {
      for (const r of item.registros) {
        todosRegistros.push({ ...r, materia: item.materia })
      }
    }
  }

  todasNotas.sort((a, b) => a.materia.localeCompare(b.materia) || a.bimestre.localeCompare(b.bimestre))
  todosRegistros.sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page">
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <Card>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Frequência Total</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: resumo.frequencia < 75 ? '#f87171' : '#4ade80' }}>
            {resumo.frequencia}%
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Aulas Presentes</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>{resumo.presentes}</div>
        </Card>
        <Card>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>Total de Faltas</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: resumo.faltas > 0 ? '#f87171' : '#888' }}>{resumo.faltas}</div>
        </Card>
      </div>

      <div className="form-grid">
        <Card title="Boletim de Notas">
          <DataTable
            columns={['Matéria', 'Bimestre', 'Nota']}
            data={todasNotas}
            emptyMessage="Nenhuma nota lançada."
            renderRow={(n, idx) => (
              <tr key={idx}>
                <td>{n.materia}</td>
                <td>{n.bimestre}º Bimestre</td>
                <td>
                  <strong style={{ color: n.nota >= 6 ? '#4ade80' : '#f87171' }}>
                    {Number(n.nota).toFixed(1)}
                  </strong>
                </td>
              </tr>
            )}
          />
        </Card>

        <Card title="Histórico de Presença">
          <DataTable
            columns={['Data', 'Horário', 'Aula', 'Matéria', 'Status', 'Observação']}
            data={todosRegistros}
            emptyMessage="Nenhuma chamada registrada."
            renderRow={(r, idx) => (
              <tr key={idx}>
                <td>{formatDate(r.date)}</td>
                <td>{r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '-'}</td>
                <td>{r.lesson || '-'}</td>
                <td>{r.materia}</td>
                <td>{mapStatus(r.status)}</td>
                <td style={{ color: '#888' }}>{r.observation || '-'}</td>
              </tr>
            )}
          />
        </Card>
      </div>
    </div>
  )
}
