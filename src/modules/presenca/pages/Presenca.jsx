import React, { useState, useEffect } from 'react';
import { Card, PageHeader, SelectField, FormInput } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import { materiasService } from '../../../services/materias.service';
import { presencasService } from '../../../services/presencas.service';
import { professoresService } from '../../../services/professores.service';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Presenca() {
  const user = useAuthStore((s) => s.user);
  const [turmas, setTurmas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  const [form, setForm] = useState({
    turma_id: '',
    materia_id: '',
    data: new Date().toISOString().split('T')[0],
    aula: '1ª Aula'
  });

  const [chamada, setChamada] = useState({});

  useEffect(() => {
    async function loadFiltros() {
      try {
        const turmasPromise = user?.role === 'teacher'
          ? professoresService.minhasTurmas()
          : turmasService.listar().then((r) => r.data);
        const [turmasData, resM] = await Promise.all([
          turmasPromise,
          materiasService.listar()
        ]);
        setTurmas(turmasData || []);
        setMaterias(resM.data || []);
      } catch (err) {
        toast.error('Erro ao carregar dados iniciais');
      }
    }
    loadFiltros();
  }, []);

  // Carregar alunos ao mudar a turma
  useEffect(() => {
    if (form.turma_id) {
      carregarAlunos(form.turma_id);
    } else {
      setAlunos([]);
      setChamada({});
    }
  }, [form.turma_id]);

  const carregarAlunos = async (turmaId) => {
    setLoadingAlunos(true);
    try {
      const res = await presencasService.buscarPorTurma(turmaId);
      const listaAlunos = res.data || [];
      setAlunos(listaAlunos);
      
      // Inicializar a chamada com status P (Presente) para todos
      const chamadaInicial = {};
      listaAlunos.forEach(aluno => {
        chamadaInicial[aluno.id] = { status: 'P', observacao: '' };
      });
      setChamada(chamadaInicial);
      
    } catch (err) {
      toast.error('Erro ao carregar alunos da turma');
      setAlunos([]);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const handleChangeForm = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (alunoId, status) => {
    setChamada(prev => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], status }
    }));
  };

  const handleObsChange = (alunoId, observacao) => {
    setChamada(prev => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], observacao }
    }));
  };

  const handleSalvar = async () => {
    if (!form.turma_id || !form.materia_id || !form.data || !form.aula) {
      return toast.error('Preencha todos os campos do filtro antes de salvar.');
    }

    if (alunos.length === 0) {
      return toast.error('Nenhum aluno para registrar presença.');
    }

    const payload = alunos.map(aluno => ({
      aluno_id: aluno.id,
      turma_id: Number(form.turma_id),
      materia_id: Number(form.materia_id),
      data: form.data,
      aula: form.aula,
      status: chamada[aluno.id].status,
      observacao: chamada[aluno.id].observacao
    }));

    try {
      await presencasService.salvarChamada(payload);
      toast.success('Chamada salva com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar a chamada. Pode ser uma duplicidade (já lançada).');
    }
  };

  return (
    <div className="page">
      <PageHeader title="Presença" description="Registro e controle de chamada dos alunos." />
      
      <Card title="Filtros da Chamada">
        <div className="form-grid">
          <SelectField 
            label="Turma" 
            id="turma_id" 
            value={form.turma_id} 
            onChange={handleChangeForm}
            options={turmas.map(t => ({ value: t.id, label: t.name }))}
          />
          <SelectField 
            label="Matéria" 
            id="materia_id" 
            value={form.materia_id} 
            onChange={handleChangeForm}
            options={materias.map(m => ({ value: m.id, label: m.name }))}
          />
          <FormInput 
            label="Data" 
            id="data" 
            type="date" 
            value={form.data} 
            onChange={handleChangeForm} 
          />
          <SelectField 
            label="Aula" 
            id="aula" 
            value={form.aula} 
            onChange={handleChangeForm}
            options={[
              { value: '1ª Aula', label: '1ª Aula' },
              { value: '2ª Aula', label: '2ª Aula' },
              { value: '3ª Aula', label: '3ª Aula' },
              { value: '4ª Aula', label: '4ª Aula' },
              { value: '5ª Aula', label: '5ª Aula' },
              { value: '6ª Aula', label: '6ª Aula' },
            ]}
          />
        </div>
      </Card>

      {form.turma_id && (
        <Card title="Lista de Chamada">
          {loadingAlunos ? (
            <p>Carregando alunos...</p>
          ) : alunos.length === 0 ? (
            <div className="empty-state">Nenhum aluno matriculado nesta turma.</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Aluno</th>
                      <th style={{ textAlign: 'center' }}>Presente</th>
                      <th style={{ textAlign: 'center' }}>Falta</th>
                      <th style={{ textAlign: 'center' }}>Atraso</th>
                      <th style={{ textAlign: 'center' }}>Justificada</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map(aluno => {
                      const statusAtual = chamada[aluno.id]?.status || 'P';
                      const obsAtual = chamada[aluno.id]?.observacao || '';

                      return (
                        <tr key={aluno.id}>
                          <td style={{ fontWeight: '500' }}>{aluno.name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'P'} 
                              onChange={() => handleStatusChange(aluno.id, 'P')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'F'} 
                              onChange={() => handleStatusChange(aluno.id, 'F')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'A'} 
                              onChange={() => handleStatusChange(aluno.id, 'A')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'J'} 
                              onChange={() => handleStatusChange(aluno.id, 'J')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              placeholder="Motivo..." 
                              value={obsAtual}
                              onChange={(e) => handleObsChange(aluno.id, e.target.value)}
                              style={{ 
                                width: '100%', 
                                padding: '0.4rem', 
                                borderRadius: '4px', 
                                border: '1px solid #444', 
                                backgroundColor: '#242424',
                                color: 'white'
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" onClick={handleSalvar} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                Salvar Chamada
              </button>
            </>
          )}
        </Card>
      )}
    </div>
  )
}