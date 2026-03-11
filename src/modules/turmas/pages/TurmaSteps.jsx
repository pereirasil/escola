import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb, Card, FormInput, PageHeader, SelectField, Spinner } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import { professoresService } from '../../../services/professores.service';
import { alunosService } from '../../../services/alunos.service';
import { horariosService } from '../../../services/horarios.service';
import { materiasService } from '../../../services/materias.service';
import { maskCep, maskCpf, maskPhone, fetchAddressByCep } from '../../../utils/masks';

const STEP_ITEMS = [
  { id: 1, title: 'Dados da Turma', description: 'Crie a base da turma' },
  { id: 2, title: 'Alunos', description: 'Adicione os alunos da turma' },
  { id: 3, title: 'Horarios', description: 'Monte a grade da turma' },
];

const diasDaSemana = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta'];

const initialTurmaForm = {
  name: '',
  grade: '',
  shift: '',
  room: '',
  school_year: '',
};

const initialAlunoForm = {
  name: '',
  birth_date: '',
  document: '',
  password: '',
  confirmPassword: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_document: '',
  cep: '',
  state: '',
  city: '',
  neighborhood: '',
  street: '',
  number: '',
  complement: '',
};

const initialHorarioForm = {
  teacher_id: '',
  subject_id: '',
  day_of_week: 'Segunda',
  start_time: '',
  end_time: '',
  room: '',
};

export default function TurmaSteps() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const [turmaForm, setTurmaForm] = useState(initialTurmaForm);
  const [alunoForm, setAlunoForm] = useState(initialAlunoForm);
  const [horarioForm, setHorarioForm] = useState(initialHorarioForm);

  const [turmaAtual, setTurmaAtual] = useState(null);
  const [professores, setProfessores] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [editingHorarioId, setEditingHorarioId] = useState(null);
  const [isAlunoModalOpen, setIsAlunoModalOpen] = useState(false);

  const [savingTurma, setSavingTurma] = useState(false);
  const [savingAluno, setSavingAluno] = useState(false);
  const [savingHorario, setSavingHorario] = useState(false);

  const turmaId = turmaAtual?.id;

  const alunosDaTurma = useMemo(
    () => alunos.filter((aluno) => String(aluno.class_id) === String(turmaId)),
    [alunos, turmaId],
  );

  const alunosDisponiveis = useMemo(
    () => alunos.filter((aluno) => !aluno.class_id),
    [alunos],
  );

  const horariosDaTurma = useMemo(
    () =>
      horarios
        .filter((horario) => String(horario.class_id) === String(turmaId))
        .sort((a, b) => {
          if (a.day_of_week === b.day_of_week) return a.start_time.localeCompare(b.start_time);
          return diasDaSemana.indexOf(a.day_of_week) - diasDaSemana.indexOf(b.day_of_week);
        }),
    [horarios, turmaId],
  );

  const professoresDaTurma = useMemo(() => {
    const ids = [...new Set(horariosDaTurma.map((horario) => horario.teacher_id).filter(Boolean))];
    return professores.filter((professor) => ids.includes(professor.id));
  }, [horariosDaTurma, professores]);

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [resProfessores, resAlunos, resMaterias, resHorarios] = await Promise.all([
          professoresService.listar(),
          alunosService.listar(),
          materiasService.listar(),
          horariosService.listar(),
        ]);
        setProfessores(resProfessores.data || []);
        setAlunos(resAlunos.data || []);
        setMaterias(resMaterias.data || []);
        setHorarios(resHorarios.data || []);
      } catch {
        toast.error('Erro ao carregar dados do fluxo.');
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, []);

  const ensureTurmaCreated = () => {
    if (!turmaId) {
      toast.error('Salve os dados da turma antes de continuar.');
      return false;
    }
    return true;
  };

  const refreshTurma = async (id) => {
    const response = await turmasService.buscarPorId(id);
    setTurmaAtual(response.data);
    return response.data;
  };

  const refreshAlunos = async () => {
    const response = await alunosService.listar();
    setAlunos(response.data || []);
  };

  const refreshHorarios = async () => {
    const response = await horariosService.listar();
    setHorarios(response.data || []);
  };

  const resetHorarioForm = () => {
    setEditingHorarioId(null);
    setHorarioForm(initialHorarioForm);
  };

  const handleSalvarTurma = async (event) => {
    event.preventDefault();
    setSavingTurma(true);
    try {
      const response = turmaId
        ? await turmasService.atualizar(turmaId, turmaForm)
        : await turmasService.criar(turmaForm);
      const turmaSalva = response.data;

      setTurmaAtual(turmaSalva);
      setTurmaForm({
        name: turmaSalva.name || '',
        grade: turmaSalva.grade || '',
        shift: turmaSalva.shift || '',
        room: turmaSalva.room || '',
        school_year: turmaSalva.school_year || '',
      });
      setCompleted(false);
      toast.success(turmaId ? 'Turma atualizada com sucesso!' : 'Turma criada. Agora adicione os alunos.');
      setStep(2);
    } catch {
      toast.error('Erro ao salvar os dados da turma.');
    } finally {
      setSavingTurma(false);
    }
  };

  const handleCepChangeAluno = async (value) => {
    const masked = maskCep(value);
    setAlunoForm((current) => ({ ...current, cep: masked }));
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8) {
      const address = await fetchAddressByCep(digits);
      if (address) {
        setAlunoForm((current) => ({ ...current, ...address }));
      }
    }
  };

  const handleCriarAluno = async (event) => {
    event.preventDefault();
    if (!ensureTurmaCreated()) return;
    if (alunoForm.password !== alunoForm.confirmPassword) {
      toast.error('Senha e confirmacao do aluno nao conferem.');
      return;
    }

    setSavingAluno(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = alunoForm;
      await alunosService.criar({ ...payload, class_id: turmaId });
      await refreshAlunos();
      setAlunoForm(initialAlunoForm);
      setIsAlunoModalOpen(false);
      setCompleted(false);
      toast.success('Aluno adicionado a turma.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar aluno.');
    } finally {
      setSavingAluno(false);
    }
  };

  const handleVincularAlunoExistente = async () => {
    if (!ensureTurmaCreated()) return;
    if (!selectedStudentId) {
      toast.error('Selecione um aluno disponivel.');
      return;
    }

    setSavingAluno(true);
    try {
      await alunosService.atualizar(selectedStudentId, { class_id: Number(turmaId) });
      await refreshAlunos();
      setSelectedStudentId('');
      setCompleted(false);
      toast.success('Aluno vinculado a turma.');
      setStep(3);
    } catch {
      toast.error('Erro ao vincular aluno.');
    } finally {
      setSavingAluno(false);
    }
  };

  const handleRemoverAluno = async (alunoId) => {
    setSavingAluno(true);
    try {
      await alunosService.atualizar(alunoId, { class_id: null });
      await refreshAlunos();
      setCompleted(false);
      toast.success('Aluno removido da turma.');
    } catch {
      toast.error('Erro ao remover aluno da turma.');
    } finally {
      setSavingAluno(false);
    }
  };

  const handleCriarHorario = async (event) => {
    event.preventDefault();
    if (!ensureTurmaCreated()) return;
    if (!horarioForm.teacher_id || !horarioForm.subject_id || !horarioForm.start_time || !horarioForm.end_time) {
      toast.error('Preencha professor, materia, horario inicial e final.');
      return;
    }

    setSavingHorario(true);
    try {
      const payload = {
        class_id: Number(turmaId),
        teacher_id: Number(horarioForm.teacher_id),
        subject_id: Number(horarioForm.subject_id),
        day_of_week: horarioForm.day_of_week,
        start_time: horarioForm.start_time,
        end_time: horarioForm.end_time,
        room: horarioForm.room || undefined,
      };

      if (editingHorarioId) {
        await horariosService.atualizar(editingHorarioId, payload);
      } else {
        await horariosService.criar(payload);
      }

      await refreshHorarios();
      resetHorarioForm();
      setCompleted(false);
      toast.success(editingHorarioId ? 'Horario atualizado.' : 'Horario adicionado a turma.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar horario.');
    } finally {
      setSavingHorario(false);
    }
  };

  const handleEditarHorario = (horario) => {
    setEditingHorarioId(horario.id);
    setHorarioForm({
      teacher_id: horario.teacher_id ? String(horario.teacher_id) : '',
      subject_id: horario.subject_id ? String(horario.subject_id) : '',
      day_of_week: horario.day_of_week || 'Segunda',
      start_time: horario.start_time || '',
      end_time: horario.end_time || '',
      room: horario.room || '',
    });
  };

  const handleRemoverHorario = async (horarioId) => {
    setSavingHorario(true);
    try {
      await horariosService.excluir(horarioId);
      await refreshHorarios();
      if (editingHorarioId === horarioId) resetHorarioForm();
      setCompleted(false);
      toast.success('Horario removido.');
    } catch {
      toast.error('Erro ao remover horario.');
    } finally {
      setSavingHorario(false);
    }
  };

  const handleConcluir = async () => {
    if (!ensureTurmaCreated()) return;
    if (alunosDaTurma.length === 0) {
      toast.error('Adicione pelo menos um aluno antes de concluir.');
      setStep(2);
      return;
    }
    if (horariosDaTurma.length === 0) {
      toast.error('Adicione pelo menos um horario antes de concluir.');
      setStep(3);
      return;
    }
    await refreshTurma(turmaId);
    setCompleted(true);
    toast.success('Turma concluida com alunos e horarios.');
  };

  const handleNovaTurma = () => {
    setStep(1);
    setCompleted(false);
    setTurmaAtual(null);
    setTurmaForm(initialTurmaForm);
    setAlunoForm(initialAlunoForm);
    setHorarioForm(initialHorarioForm);
    setSelectedStudentId('');
    setEditingHorarioId(null);
    setIsAlunoModalOpen(false);
  };

  if (loading) {
    return (
      <div className="page">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Turmas', to: '/turmas' }, { label: 'Turma Steps' }]} />

      <PageHeader title="Turma Steps" description="Fluxo guiado para criar a turma com alunos e horarios.">
        <Link to="/turmas" className="btn-secondary">
          Voltar para Turmas
        </Link>
      </PageHeader>

      <div className="steps-shell">
        <Card className="steps-sidebar-card">
          <div className="steps-sidebar">
            {STEP_ITEMS.map((item) => {
              const isActive = item.id === step;
              const isDone = item.id < step || (completed && item.id <= STEP_ITEMS.length);
              const isLocked = item.id > 1 && !turmaId;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`step-chip${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
                  onClick={() => {
                    if (isLocked) return;
                    setStep(item.id);
                  }}
                >
                  <span className="step-chip-number">{isDone ? 'OK' : item.id}</span>
                  <span className="step-chip-content">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="steps-content">
          {step === 1 && (
            <Card title="1. Dados da Turma">
              <form onSubmit={handleSalvarTurma}>
                <div className="form-grid">
                  <FormInput
                    label="Nome da Turma"
                    id="step-class-name"
                    placeholder="Ex: 6o Ano A"
                    required
                    value={turmaForm.name}
                    onChange={(event) => setTurmaForm({ ...turmaForm, name: event.target.value })}
                  />
                  <FormInput
                    label="Serie / Ano"
                    id="step-class-grade"
                    placeholder="Ex: 6o Ano (Ensino Fundamental)"
                    value={turmaForm.grade}
                    onChange={(event) => setTurmaForm({ ...turmaForm, grade: event.target.value })}
                  />
                  <SelectField
                    label="Turno"
                    id="step-class-shift"
                    value={turmaForm.shift}
                    onChange={(event) => setTurmaForm({ ...turmaForm, shift: event.target.value })}
                    options={[
                      { value: 'Manha', label: 'Manha' },
                      { value: 'Tarde', label: 'Tarde' },
                      { value: 'Noite', label: 'Noite' },
                    ]}
                  />
                  <FormInput
                    label="Sala"
                    id="step-class-room"
                    placeholder="Ex: Sala 12"
                    value={turmaForm.room}
                    onChange={(event) => setTurmaForm({ ...turmaForm, room: event.target.value })}
                  />
                  <FormInput
                    label="Ano Letivo"
                    id="step-class-year"
                    placeholder="Ex: 2026"
                    value={turmaForm.school_year}
                    onChange={(event) => setTurmaForm({ ...turmaForm, school_year: event.target.value })}
                  />
                </div>
                <div className="steps-actions">
                  <button type="submit" className="btn-primary" disabled={savingTurma}>
                    {savingTurma ? 'Salvando...' : turmaId ? 'Salvar e seguir' : 'Criar turma e seguir'}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {step === 2 && (
            <>
              <Card title="2. Adicionar aluno existente">
                <div className="form-grid">
                  <SelectField
                    label="Alunos sem turma"
                    id="step-student-existing"
                    value={selectedStudentId}
                    onChange={(event) => setSelectedStudentId(event.target.value)}
                    options={alunosDisponiveis.map((aluno) => ({
                      value: aluno.id,
                      label: `${aluno.name} - ${aluno.document || 'Sem CPF'}`,
                    }))}
                  />
                </div>
                {alunosDisponiveis.length === 0 && (
                  <div className="empty-state" style={{ marginTop: '1rem' }}>
                    Nenhum aluno disponivel sem turma no momento.
                  </div>
                )}
                <div className="steps-actions">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                    Voltar
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleVincularAlunoExistente}
                    disabled={savingAluno || alunosDisponiveis.length === 0 || !selectedStudentId}
                  >
                    {savingAluno ? 'Vinculando...' : 'Adicionar aluno existente'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setIsAlunoModalOpen(true)}>
                    Cadastrar novo aluno
                  </button>
                </div>
              </Card>

              <Card title="Alunos ja vinculados">
                {alunosDaTurma.length === 0 ? (
                  <div className="empty-state">Nenhum aluno adicionado a esta turma ainda.</div>
                ) : (
                  <div className="steps-list">
                    {alunosDaTurma.map((aluno) => (
                      <div key={aluno.id} className="steps-list-item">
                        <div>
                          <strong>{aluno.name}</strong>
                          <small>{aluno.document || 'Sem CPF informado'}</small>
                        </div>
                        <button type="button" className="btn-danger" onClick={() => handleRemoverAluno(aluno.id)} disabled={savingAluno}>
                          Remover da turma
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {step === 3 && (
            <>
              <Card title="3. Montar grade horaria da turma">
                {materias.length === 0 ? (
                  <div className="empty-state">
                    Cadastre ao menos uma materia em <Link to="/materias">Materias</Link> para criar horarios.
                  </div>
                ) : (
                  <form onSubmit={handleCriarHorario}>
                    <p className="page-description" style={{ marginTop: 0 }}>
                      {editingHorarioId
                        ? 'Editando um horario existente desta turma.'
                        : 'Adicione as aulas da turma. O professor passa a ser definido por aqui.'}
                    </p>
                    <div className="form-grid">
                      <SelectField label="Professor" id="step-schedule-teacher" value={horarioForm.teacher_id} onChange={(event) => setHorarioForm({ ...horarioForm, teacher_id: event.target.value })} options={professores.map((professor) => ({ value: professor.id, label: professor.name }))} />
                      <SelectField label="Materia" id="step-schedule-subject" value={horarioForm.subject_id} onChange={(event) => setHorarioForm({ ...horarioForm, subject_id: event.target.value })} options={materias.map((materia) => ({ value: materia.id, label: materia.name }))} />
                      <SelectField label="Dia da semana" id="step-schedule-day" value={horarioForm.day_of_week} onChange={(event) => setHorarioForm({ ...horarioForm, day_of_week: event.target.value })} options={diasDaSemana.map((dia) => ({ value: dia, label: dia }))} />
                      <FormInput label="Inicio" id="step-schedule-start" type="time" value={horarioForm.start_time} onChange={(event) => setHorarioForm({ ...horarioForm, start_time: event.target.value })} />
                      <FormInput label="Fim" id="step-schedule-end" type="time" value={horarioForm.end_time} onChange={(event) => setHorarioForm({ ...horarioForm, end_time: event.target.value })} />
                      <FormInput label="Sala" id="step-schedule-room" placeholder="Ex: Sala 4" value={horarioForm.room} onChange={(event) => setHorarioForm({ ...horarioForm, room: event.target.value })} />
                    </div>
                    <div className="steps-actions">
                      <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                        Voltar
                      </button>
                      <button type="submit" className="btn-primary" disabled={savingHorario}>
                        {savingHorario ? 'Salvando...' : editingHorarioId ? 'Salvar horario' : 'Adicionar horario'}
                      </button>
                      {editingHorarioId && (
                        <button type="button" className="btn-secondary" onClick={resetHorarioForm}>
                          Cancelar edicao
                        </button>
                      )}
                      <button type="button" className="btn-primary" onClick={handleConcluir}>
                        Concluir criacao da turma
                      </button>
                    </div>
                  </form>
                )}
              </Card>

              <Card title="Horarios da turma">
                {horariosDaTurma.length === 0 ? (
                  <div className="empty-state">Nenhum horario definido para esta turma ainda.</div>
                ) : (
                  <div className="steps-list">
                    {horariosDaTurma.map((horario) => {
                      const professor = professores.find((item) => item.id === horario.teacher_id);
                      const materia = materias.find((item) => item.id === horario.subject_id);
                      return (
                        <div key={horario.id} className="steps-list-item">
                          <div>
                            <strong>
                              {horario.day_of_week} {horario.start_time} - {horario.end_time}
                            </strong>
                            <small>
                              {materia?.name || 'Materia'} • {professor?.name || 'Professor'}
                              {horario.room ? ` • Sala ${horario.room}` : ''}
                            </small>
                          </div>
                          <div className="steps-actions" style={{ marginTop: 0 }}>
                            <button type="button" className="btn-secondary" onClick={() => handleEditarHorario(horario)} disabled={savingHorario}>
                              Editar horario
                            </button>
                            <button type="button" className="btn-danger" onClick={() => handleRemoverHorario(horario.id)} disabled={savingHorario}>
                              Remover horario
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {completed && (
                <Card title="Turma concluida">
                  <p className="page-description">
                    A turma foi criada com os vinculos principais. Daqui em diante voce pode usar as telas atuais para editar, incluir e excluir normalmente.
                  </p>
                  <div className="steps-actions">
                    <button type="button" className="btn-secondary" onClick={handleNovaTurma}>
                      Criar outra turma
                    </button>
                    <button type="button" className="btn-primary" onClick={() => navigate('/turmas')}>
                      Ir para lista de turmas
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => navigate('/horarios')}>
                      Gerenciar horarios
                    </button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {isAlunoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAlunoModalOpen(false)}>
          <div className="modal-content modal-content-wide" onClick={(event) => event.stopPropagation()}>
            <h3>Cadastrar novo aluno</h3>
            <form onSubmit={handleCriarAluno}>
              <div className="form-grid">
                <FormInput label="Nome do aluno" id="modal-student-name" required value={alunoForm.name} onChange={(event) => setAlunoForm({ ...alunoForm, name: event.target.value })} />
                <FormInput label="Data de nascimento" id="modal-student-birth-date" type="date" value={alunoForm.birth_date} onChange={(event) => setAlunoForm({ ...alunoForm, birth_date: event.target.value })} />
                <FormInput label="CPF" id="modal-student-document" required maxLength={14} value={alunoForm.document} onChange={(event) => setAlunoForm({ ...alunoForm, document: maskCpf(event.target.value) })} />
                <FormInput label="Senha" id="modal-student-password" type="password" required value={alunoForm.password} onChange={(event) => setAlunoForm({ ...alunoForm, password: event.target.value })} />
                <FormInput label="Confirmar senha" id="modal-student-confirm-password" type="password" required value={alunoForm.confirmPassword} onChange={(event) => setAlunoForm({ ...alunoForm, confirmPassword: event.target.value })} />
                <FormInput label="Nome do responsavel" id="modal-student-guardian-name" value={alunoForm.guardian_name} onChange={(event) => setAlunoForm({ ...alunoForm, guardian_name: event.target.value })} />
                <FormInput label="Telefone do responsavel" id="modal-student-guardian-phone" maxLength={15} value={alunoForm.guardian_phone} onChange={(event) => setAlunoForm({ ...alunoForm, guardian_phone: maskPhone(event.target.value) })} />
                <FormInput label="CPF do responsavel" id="modal-student-guardian-document" maxLength={14} value={alunoForm.guardian_document} onChange={(event) => setAlunoForm({ ...alunoForm, guardian_document: maskCpf(event.target.value) })} />
                <FormInput label="CEP" id="modal-student-cep" maxLength={9} value={alunoForm.cep} onChange={(event) => handleCepChangeAluno(event.target.value)} />
                <FormInput label="Estado" id="modal-student-state" value={alunoForm.state} onChange={(event) => setAlunoForm({ ...alunoForm, state: event.target.value })} />
                <FormInput label="Cidade" id="modal-student-city" value={alunoForm.city} onChange={(event) => setAlunoForm({ ...alunoForm, city: event.target.value })} />
                <FormInput label="Bairro" id="modal-student-neighborhood" value={alunoForm.neighborhood} onChange={(event) => setAlunoForm({ ...alunoForm, neighborhood: event.target.value })} />
                <FormInput label="Rua" id="modal-student-street" value={alunoForm.street} onChange={(event) => setAlunoForm({ ...alunoForm, street: event.target.value })} />
                <FormInput label="Numero" id="modal-student-number" value={alunoForm.number} onChange={(event) => setAlunoForm({ ...alunoForm, number: event.target.value })} />
                <FormInput label="Complemento" id="modal-student-complement" value={alunoForm.complement} onChange={(event) => setAlunoForm({ ...alunoForm, complement: event.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAlunoModalOpen(false)} disabled={savingAluno}>
                  Fechar
                </button>
                <button type="submit" className="btn-primary" disabled={savingAluno}>
                  {savingAluno ? 'Salvando...' : 'Criar aluno na turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
