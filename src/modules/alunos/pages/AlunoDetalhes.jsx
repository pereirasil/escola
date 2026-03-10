import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, PageHeader, DataTable, Spinner, Breadcrumb } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { presencasService } from '../../../services/presencas.service';
import { materiasService } from '../../../services/materias.service';
import { notasService } from '../../../services/notas.service';
import toast from 'react-hot-toast';

export default function AlunoDetalhes() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [resumo, setResumo] = useState({ total: 0, faltas: 0, presentes: 0, frequencia: 100 });
  const [materias, setMaterias] = useState([]);
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [resAluno, resPresencas, resMat, resNotas] = await Promise.all([
          alunosService.buscarPorId(id),
          presencasService.historicoAluno(id),
          materiasService.listar(),
          notasService.buscarPorAluno(id).catch(() => ({ data: [] }))
        ]);
        
        setAluno(resAluno.data);
        setHistorico(resPresencas.data.presencas || []);
        setResumo(resPresencas.data.resumo || { total: 0, faltas: 0, presentes: 0, frequencia: 100 });
        setMaterias(resMat.data || []);
        setNotas(resNotas.data || []);
      } catch (error) {
        toast.error('Erro ao carregar dados do aluno');
      }
    }
    loadData();
  }, [id]);

  const mapStatus = (status) => {
    switch (status) {
      case 'P': return <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Presente</span>;
      case 'F': return <span style={{ color: '#f87171', fontWeight: 'bold' }}>Falta</span>;
      case 'A': return <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Atraso</span>;
      case 'J': return <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Falta Justificada</span>;
      default: return status;
    }
  };

  const getMateriaNome = (materiaId) => {
    const m = materias.find(m => m.id === materiaId);
    return m ? m.name : 'Desconhecida';
  };

  const formatData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
  };

  if (!aluno) return <div className="page"><Spinner /></div>;

  return (
    <div className="page">
      <Breadcrumb items={[
        { label: 'Alunos', to: '/alunos' },
        { label: aluno.name }
      ]} />

      <div className="aluno-detalhes-header">
        {aluno.photo ? (
          <img
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${aluno.photo}`}
            alt={aluno.name}
            className="aluno-detalhes-photo"
          />
        ) : (
          <div className="aluno-detalhes-photo-placeholder">
            {aluno.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <PageHeader title={aluno.name} description={`Matricula/CPF: ${aluno.document || 'Nao informado'}`} />
      </div>

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
            data={notas}
            emptyMessage="Nenhuma nota lançada."
            renderRow={(n) => (
              <tr key={n.id}>
                <td>{getMateriaNome(n.materia_id)}</td>
                <td>{n.bimestre}</td>
                <td>
                  <strong style={{ color: n.nota >= 6 ? '#4ade80' : '#f87171' }}>
                    {n.nota.toFixed(1)}
                  </strong>
                </td>
              </tr>
            )}
          />
        </Card>

        <Card title="Histórico de Presença">
          <DataTable
            columns={['Data', 'Aula', 'Matéria', 'Status']}
            data={historico.slice(0, 15)} // Mostra as últimas 15 pra não ficar gigante
            emptyMessage="Nenhuma chamada."
            renderRow={(h) => (
              <tr key={h.id}>
                <td>{formatData(h.date)}</td>
                <td>{h.lesson}</td>
                <td>{getMateriaNome(h.subject_id)}</td>
                <td>{mapStatus(h.status)}</td>
              </tr>
            )}
          />
        </Card>
      </div>
    </div>
  );
}