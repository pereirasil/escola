import React, { useState, useEffect } from 'react';
import { Card, PageHeader, SelectField, FormInput, Spinner } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import { materiasService } from '../../../services/materias.service';
import { presencasService } from '../../../services/presencas.service';
import { professoresService } from '../../../services/professores.service';
import { useAuthStore } from '../../../store/useAuthStore';
import toast from 'react-hot-toast';

const MSG_SEM_MATERIA_PROFESSOR =
  'Nenhuma matéria vinculada a este professor nesta turma.';

export default function Presenca() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = user?.role === 'teacher';
  const [turmas, setTurmas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
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
        const turmasPromise = isTeacher
          ? professoresService.minhasTurmas()
          : turmasService.listar().then((r) => r.data);
        const turmasData = await turmasPromise;
        setTurmas(turmasData || []);
        if (!isTeacher) {
          const materiasData = await materiasService.listar().then((r) => r.data);
          setMaterias(materiasData || []);
        } else {
          setMaterias([]);
        }
      } catch (err) {
        toast.error('Erro ao carregar dados iniciais');
      }
    }
    loadFiltros();
  }, [isTeacher]);

  useEffect(() => {
    if (!isTeacher) return;
    if (!form.turma_id) {
      setMaterias([]);
      return;
    }
    let cancelled = false;
    setLoadingMaterias(true);
    (async () => {
      try {
        const data = await professoresService.minhasMateriasNaTurma(form.turma_id);
        if (!cancelled) setMaterias(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setMaterias([]);
          toast.error('Erro ao carregar matérias desta turma');
        }
      } finally {
        if (!cancelled) setLoadingMaterias(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isTeacher, form.turma_id]);

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
      
      const chamadaInicial = {};
      listaAlunos.forEach(aluno => {
        chamadaInicial[aluno.id] = { status: '', observacao: '' };
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
    if (id === 'turma_id') {
      setForm((prev) => ({ ...prev, turma_id: value, materia_id: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (alunoId, status) => {
    setChamada(prev => {
      const atual = prev[alunoId]?.status;
      return {
        ...prev,
        [alunoId]: { ...prev[alunoId], status: atual === status ? '' : status }
      };
    });
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

    const semStatus = alunos.filter(a => !chamada[a.id]?.status);
    if (semStatus.length > 0) {
      return toast.error(`Marque o status de todos os alunos. ${semStatus.length === 1 ? 'Falta' : 'Faltam'} ${semStatus.length}.`);
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
            label="Sala" 
            id="turma_id" 
            value={form.turma_id} 
            onChange={handleChangeForm}
            options={turmas.map(t => ({ value: t.id, label: t.room || t.name }))}
          />
          <SelectField
            label="Matéria"
            id="materia_id"
            value={form.materia_id}
            onChange={handleChangeForm}
            disabled={isTeacher && (!form.turma_id || loadingMaterias)}
            options={materias.map((m) => ({ value: m.id, label: m.name }))}
          />
          {isTeacher && form.turma_id && loadingMaterias && (
            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Spinner />
              <span className="field-hint">Carregando matérias…</span>
            </div>
          )}
          {isTeacher && form.turma_id && !loadingMaterias && materias.length === 0 && (
            <p className="field-hint" style={{ gridColumn: '1 / -1', marginTop: '-0.5rem' }}>
              {MSG_SEM_MATERIA_PROFESSOR}
            </p>
          )}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
              <Spinner />
              <span>Carregando alunos…</span>
            </div>
          ) : alunos.length === 0 ? (
            <div className="empty-state">Nenhum aluno encontrado nesta turma.</div>
          ) : (
            <>
              <div className="presenca-legenda" aria-hidden="true">
                <span className="presenca-legenda-item presenca-legenda-item--P">Presente</span>
                <span className="presenca-legenda-item presenca-legenda-item--F">Falta</span>
                <span className="presenca-legenda-item presenca-legenda-item--A">Atraso</span>
                <span className="presenca-legenda-item presenca-legenda-item--J">Justificado</span>
              </div>
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
                      const statusAtual = chamada[aluno.id]?.status || '';
                      const obsAtual = chamada[aluno.id]?.observacao || '';
                      const rowCls = statusAtual
                        ? `presenca-chamada-row presenca-chamada-row--${statusAtual}`
                        : 'presenca-chamada-row';

                      return (
                        <tr key={aluno.id} className={rowCls}>
                          <td style={{ fontWeight: '500' }}>{aluno.name}</td>
                          <td className="presenca-celula-status presenca-celula-status--P" style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'P'} 
                              onChange={() => {}}
                              onClick={() => handleStatusChange(aluno.id, 'P')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td className="presenca-celula-status presenca-celula-status--F" style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'F'} 
                              onChange={() => {}}
                              onClick={() => handleStatusChange(aluno.id, 'F')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td className="presenca-celula-status presenca-celula-status--A" style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'A'} 
                              onChange={() => {}}
                              onClick={() => handleStatusChange(aluno.id, 'A')}
                              style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                          </td>
                          <td className="presenca-celula-status presenca-celula-status--J" style={{ textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`status-${aluno.id}`} 
                              checked={statusAtual === 'J'} 
                              onChange={() => {}}
                              onClick={() => handleStatusChange(aluno.id, 'J')}
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