import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader, DataTable, SelectField, Spinner } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import { presencasService } from '../../../services/presencas.service';
import { professoresService } from '../../../services/professores.service';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function RelatorioPresenca() {
  const user = useAuthStore((s) => s.user);
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState('');
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadFiltros() {
      try {
        const turmasData =
          user.role === 'teacher'
            ? await professoresService.minhasTurmas()
            : (await turmasService.listar()).data || [];
        setTurmas(turmasData || []);
      } catch (err) {
        toast.error('Erro ao carregar turmas');
      }
    }
    loadFiltros();
  }, [user]);

  useEffect(() => {
    if (turmaId) {
      loadRelatorio(turmaId);
    } else {
      setRelatorio([]);
    }
  }, [turmaId]);

  const loadRelatorio = async (id) => {
    setLoading(true);
    try {
      const res = await presencasService.frequenciaTurma(id);
      setRelatorio(res.data || []);
    } catch (err) {
      toast.error('Erro ao carregar relatório');
      setRelatorio([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Resumo de frequência" description="Totais de presença e faltas por aluno na turma" />

      <Card title="Selecione a Turma">
        <div style={{ maxWidth: '300px' }}>
          <SelectField 
            label="Turma"
            id="turma" 
            value={turmaId} 
            onChange={e => setTurmaId(e.target.value)}
            options={turmas.map((t) => ({
              value: t.id,
              label: t.grade && t.name ? `${t.grade} - ${t.name}` : t.room || t.name,
            }))}
          />
        </div>
      </Card>

      {turmaId && (
        <Card title="Frequência da Turma">
          {loading ? (
            <Spinner />
          ) : (
            <DataTable
              columns={['Aluno', 'Presenças', 'Faltas', 'Frequência']}
              data={relatorio}
              emptyMessage="Nenhum dado encontrado para esta turma."
              renderRow={(item) => (
                <tr key={item.aluno_id}>
                  <td>
                    {user?.role === 'teacher' ? (
                      <span style={{ fontWeight: 'bold' }}>{item.nome}</span>
                    ) : (
                      <Link to={`/alunos/${item.aluno_id}`} style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>
                        {item.nome}
                      </Link>
                    )}
                  </td>
                  <td>{item.presencas}</td>
                  <td>
                    <span style={{ color: item.faltas > 3 ? '#f87171' : 'inherit', fontWeight: item.faltas > 3 ? 'bold' : 'normal' }}>
                      {item.faltas}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: item.frequencia < 75 ? '#f87171' : '#4ade80', fontWeight: 'bold' }}>
                      {item.frequencia}%
                    </span>
                  </td>
                </tr>
              )}
            />
          )}
        </Card>
      )}
    </div>
  );
}