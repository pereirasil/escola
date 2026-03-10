import { useState, useEffect } from 'react'
import { Card, Spinner } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import toast from 'react-hot-toast'

export default function HistoricoEscolar() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alunosService.meuHistorico()
      .then(setDados)
      .catch(() => toast.error('Erro ao carregar historico.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>
  if (!dados) return <div className="page"><div className="empty-state">Nao foi possivel carregar o historico.</div></div>

  const { historico, resumo } = dados

  return (
    <div className="page">
      <Card title="Historico Escolar">
        <div className="historico-resumo">
          <div className="historico-resumo-item">
            <span className="historico-resumo-valor">{resumo.total}</span>
            <span className="historico-resumo-label">Total de aulas</span>
          </div>
          <div className="historico-resumo-item">
            <span className="historico-resumo-valor" style={{ color: '#4ade80' }}>{resumo.presentes}</span>
            <span className="historico-resumo-label">Presencas</span>
          </div>
          <div className="historico-resumo-item">
            <span className="historico-resumo-valor" style={{ color: '#f87171' }}>{resumo.faltas}</span>
            <span className="historico-resumo-label">Faltas</span>
          </div>
          <div className="historico-resumo-item">
            <span className="historico-resumo-valor" style={{ color: '#646cff' }}>{resumo.frequencia}%</span>
            <span className="historico-resumo-label">Frequencia</span>
          </div>
        </div>

        {historico.length === 0 ? (
          <div className="empty-state">Nenhum registro encontrado.</div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>1 Bim</th>
                  <th>2 Bim</th>
                  <th>3 Bim</th>
                  <th>4 Bim</th>
                  <th>Presencas</th>
                  <th>Faltas</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((item) => {
                  const notasMap = {}
                  item.notas.forEach((n) => { notasMap[n.bimestre] = n.nota })

                  return (
                    <tr key={item.materia_id}>
                      <td style={{ fontWeight: 500 }}>{item.materia}</td>
                      <td>{notasMap['1'] != null ? notasMap['1'] : '-'}</td>
                      <td>{notasMap['2'] != null ? notasMap['2'] : '-'}</td>
                      <td>{notasMap['3'] != null ? notasMap['3'] : '-'}</td>
                      <td>{notasMap['4'] != null ? notasMap['4'] : '-'}</td>
                      <td style={{ color: '#4ade80' }}>{item.presencas}</td>
                      <td style={{ color: item.faltas > 0 ? '#f87171' : undefined }}>{item.faltas}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
