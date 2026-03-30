import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, PageHeader, DataTable, Spinner, Breadcrumb } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { presencasService } from '../../../services/presencas.service';
import { materiasService } from '../../../services/materias.service';
import { notasService } from '../../../services/notas.service';
import toast from 'react-hot-toast';

function sanitizeFilename(name) {
  return (name || 'aluno')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'aluno';
}

export default function AlunoDetalhes() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [resumo, setResumo] = useState({ total: 0, faltas: 0, presentes: 0, frequencia: 100 });
  const [materias, setMaterias] = useState([]);
  const [notas, setNotas] = useState([]);
  const [exportandoBoletimPdf, setExportandoBoletimPdf] = useState(false);
  const [exportandoPresencaPdf, setExportandoPresencaPdf] = useState(false);

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

  const exportarBoletimPdf = async () => {
    if (!aluno) return;
    setExportandoBoletimPdf(true);
    try {
      const res = await alunosService.baixarBoletimPdf(id);
      const blob = res.data;
      if (blob.type && blob.type.includes('application/json')) {
        const text = await blob.text();
        const j = JSON.parse(text);
        throw new Error(j.message || 'Erro ao gerar PDF');
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boletim-${sanitizeFilename(aluno.name)}-${id}.pdf`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF do boletim baixado.');
    } catch (error) {
      let msg = 'Erro ao exportar PDF.';
      const d = error.response?.data;
      if (d instanceof Blob) {
        try {
          const t = await d.text();
          const j = JSON.parse(t);
          if (j.message) msg = j.message;
        } catch {
          /* ignore */
        }
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setExportandoBoletimPdf(false);
    }
  };

  const exportarPresencaPdf = async () => {
    if (!aluno) return;
    setExportandoPresencaPdf(true);
    try {
      const res = await alunosService.baixarPresencaPdf(id);
      const blob = res.data;
      if (blob.type && blob.type.includes('application/json')) {
        const text = await blob.text();
        const j = JSON.parse(text);
        throw new Error(j.message || 'Erro ao gerar PDF');
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presenca-${sanitizeFilename(aluno.name)}-${id}.pdf`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF do histórico de presença baixado.');
    } catch (error) {
      let msg = 'Erro ao exportar PDF.';
      const d = error.response?.data;
      if (d instanceof Blob) {
        try {
          const t = await d.text();
          const j = JSON.parse(t);
          if (j.message) msg = j.message;
        } catch {
          /* ignore */
        }
      } else if (error.message) {
        msg = error.message;
      }
      toast.error(msg);
    } finally {
      setExportandoPresencaPdf(false);
    }
  };

  if (!aluno) return <div className="page"><Spinner /></div>;

  return (
    <div className="page">
      <Breadcrumb items={[
        { label: 'Alunos', to: '/alunos' },
        { label: aluno.name }
      ]} />

      <div className="aluno-detalhes-header">
        <PageHeader
          title={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {aluno.name}
              {aluno.status === 'inactive' && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(248, 113, 113, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(248, 113, 113, 0.4)',
                  }}
                >
                  Inativo
                </span>
              )}
            </span>
          }
          description={`Matrícula/CPF: ${aluno.document || 'Não informado'}`}
        />
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
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <h3 className="card-title" style={{ margin: 0 }}>Boletim de Notas</h3>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              disabled={exportandoBoletimPdf}
              onClick={exportarBoletimPdf}
            >
              {exportandoBoletimPdf ? 'Gerando PDF…' : 'Exportar PDF'}
            </button>
          </div>
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

        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <h3 className="card-title" style={{ margin: 0 }}>Histórico de Presença</h3>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              disabled={exportandoPresencaPdf}
              onClick={exportarPresencaPdf}
            >
              {exportandoPresencaPdf ? 'Gerando PDF…' : 'Exportar PDF'}
            </button>
          </div>
          <DataTable
            columns={['Data', 'Aula', 'Matéria', 'Status', 'Observação']}
            data={historico}
            emptyMessage="Nenhuma chamada."
            renderRow={(h) => (
              <tr key={h.id}>
                <td>{formatData(h.date)}</td>
                <td>{h.lesson}</td>
                <td>{getMateriaNome(h.subject_id)}</td>
                <td>{mapStatus(h.status)}</td>
                <td style={{ color: '#888' }}>{h.observation || '-'}</td>
              </tr>
            )}
          />
        </Card>
      </div>
    </div>
  );
}