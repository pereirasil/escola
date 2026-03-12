import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AsyncSearchSelect, Breadcrumb, Card, FormInput, PageHeader, SelectField, Spinner } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import { professoresService } from '../../../services/professores.service';
import { alunosService } from '../../../services/alunos.service';
import { horariosService } from '../../../services/horarios.service';
import { materiasService } from '../../../services/materias.service';
import { maskCep, maskCpf, maskPhone, fetchAddressByCep } from '../../../utils/masks';

function Icon({ path, size = 18, strokeWidth = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const icons = {
  turma: 'M3 7.5 12 3l9 4.5-9 4.5L3 7.5Zm0 4.5 9 4.5 9-4.5M3 16.5 12 21l9-4.5',
  alunos: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10.5 10v-2a4 4 0 0 0-3-3.87M14.5 3.13a4 4 0 0 1 0 7.75',
  horarios: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm4 8h3v3H9z',
  resumo: 'M9 12h6M9 16h6M14 4H6a2 2 0 0 0-2 2v12l4-2 4 2 4-2 4 2V8l-6-4Z',
  plus: 'M12 5v14M5 12h14',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  arrowLeft: 'M19 12H5M11 19l-7-7 7-7',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12 5 5L20 7',
  edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
  trash: 'M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14',
  userPlus: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10.5 2v6M17 16h6',
};

const STEP_ITEMS = [
  { id: 1, title: 'Dados da Turma', description: 'Preencha os dados principais' },
  { id: 2, title: 'Alunos', description: 'Monte a lista da turma' },
  { id: 3, title: 'Horários', description: 'Defina a grade da turma' },
  { id: 4, title: 'Resumo', description: 'Revise e conclua tudo' },
];

const ALUNO_MODAL_STEPS = [
  { id: 1, title: 'Dados', icon: icons.alunos },
  { id: 2, title: 'Responsável', icon: icons.userPlus },
  { id: 3, title: 'Endereço', icon: icons.turma },
];

const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

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

const STEP_ICONS = {
  1: icons.turma,
  2: icons.alunos,
  3: icons.horarios,
  4: icons.resumo,
};

const buildDraftId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function StepCardHeader({ title, action }) {
  return (
    <div className="steps-card-header">
      <h3 className="card-title">{title}</h3>
      {action ? <div className="steps-card-header-action">{action}</div> : null}
    </div>
  );
}

export default function TurmaSteps() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const [turmaForm, setTurmaForm] = useState(initialTurmaForm);
  const [alunoForm, setAlunoForm] = useState(initialAlunoForm);
  const [horarioForm, setHorarioForm] = useState(initialHorarioForm);

  const [professores, setProfessores] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [alunosDraft, setAlunosDraft] = useState([]);
  const [horariosDraft, setHorariosDraft] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacherLabel, setSelectedTeacherLabel] = useState('');
  const [editingHorarioId, setEditingHorarioId] = useState(null);
  const [isAlunoModalOpen, setIsAlunoModalOpen] = useState(false);
  const [alunoModalStep, setAlunoModalStep] = useState(1);

  const [savingAluno, setSavingAluno] = useState(false);
  const [savingHorario, setSavingHorario] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const alunosCount = alunosDraft.length;
  const horariosCount = horariosDraft.length;

  const alunosDraftById = useMemo(
    () => new Set(alunosDraft.filter((item) => item.source === 'existing').map((item) => item.id)),
    [alunosDraft],
  );

  const horariosDaTurma = useMemo(
    () =>
      [...horariosDraft].sort((a, b) => {
        if (a.day_of_week === b.day_of_week) return a.start_time.localeCompare(b.start_time);
        return diasDaSemana.indexOf(a.day_of_week) - diasDaSemana.indexOf(b.day_of_week);
      }),
    [horariosDraft],
  );

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [resProfessores, , resMaterias] = await Promise.all([
          professoresService.listar(),
          alunosService.listar(),
          materiasService.listar(),
        ]);
        setProfessores(resProfessores.data || []);
        setMaterias(resMaterias.data || []);
      } catch {
        toast.error('Erro ao carregar dados do fluxo.');
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, []);

  const closeAlunoModal = () => {
    setIsAlunoModalOpen(false);
    setAlunoModalStep(1);
    setAlunoForm(initialAlunoForm);
  };

  const searchStudents = async (query) => {
    const results = await alunosService.buscar(query, 20);
    return results
      .filter((aluno) => !alunosDraftById.has(aluno.id))
      .map((aluno) => ({
        value: aluno.id,
        label: aluno.name,
        description: aluno.document || 'Sem CPF',
        raw: aluno,
      }));
  };

  const searchTeachers = async (query) => {
    const results = await professoresService.buscar(query, 20);
    return results.map((professor) => ({
      value: professor.id,
      label: professor.name,
      description: professor.email || professor.document || 'Professor',
    }));
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

  const validateStep1 = () => {
    if (!turmaForm.name.trim()) {
      toast.error('Informe o nome da turma.');
      return false;
    }
    return true;
  };

  const handleNextFromTurma = (event) => {
    event.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleCriarAluno = async (event) => {
    event.preventDefault();
    if (alunoForm.password !== alunoForm.confirmPassword) {
      toast.error('Senha e confirmação do aluno não conferem.');
      return;
    }

    setSavingAluno(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = alunoForm;
      setAlunosDraft((current) => [
        ...current,
        {
          ...payload,
          draftId: buildDraftId('new-student'),
          source: 'new',
        },
      ]);
      closeAlunoModal();
      setCompleted(false);
      toast.success('Aluno preparado para criação no passo final.');
    } finally {
      setSavingAluno(false);
    }
  };

  const handleVincularAlunoExistente = () => {
    if (!selectedStudent?.raw) {
      toast.error('Selecione um aluno.');
      return;
    }

    setAlunosDraft((current) => [
      ...current,
      {
        ...selectedStudent.raw,
        source: 'existing',
      },
    ]);
    setSelectedStudent(null);
    setCompleted(false);
    toast.success('Aluno adicionado ao rascunho da turma.');
  };

  const handleRemoverAluno = (alunoKey) => {
    setAlunosDraft((current) => current.filter((aluno) => (aluno.source === 'new' ? aluno.draftId : aluno.id) !== alunoKey));
    setCompleted(false);
    toast.success('Aluno removido do rascunho.');
  };

  const resetHorarioForm = () => {
    setEditingHorarioId(null);
    setHorarioForm(initialHorarioForm);
    setSelectedTeacherLabel('');
  };

  const handleSalvarHorario = (event) => {
    event.preventDefault();
    if (!horarioForm.teacher_id || !horarioForm.subject_id || !horarioForm.start_time || !horarioForm.end_time) {
      toast.error('Preencha professor, matéria, horário inicial e final.');
      return;
    }

    const professor = professores.find((item) => String(item.id) === String(horarioForm.teacher_id));
    const materia = materias.find((item) => String(item.id) === String(horarioForm.subject_id));

    setSavingHorario(true);
    try {
      const draft = {
        draftId: editingHorarioId || buildDraftId('schedule'),
        teacher_id: Number(horarioForm.teacher_id),
        subject_id: Number(horarioForm.subject_id),
        day_of_week: horarioForm.day_of_week,
        start_time: horarioForm.start_time,
        end_time: horarioForm.end_time,
        room: horarioForm.room || '',
        teacher_name: professor?.name || selectedTeacherLabel || 'Professor',
        subject_name: materia?.name || 'Matéria',
      };

      setHorariosDraft((current) => {
        if (editingHorarioId) {
          return current.map((item) => (item.draftId === editingHorarioId ? draft : item));
        }
        return [...current, draft];
      });

      resetHorarioForm();
      setCompleted(false);
      toast.success(editingHorarioId ? 'Horário atualizado no rascunho.' : 'Horário adicionado ao rascunho.');
    } finally {
      setSavingHorario(false);
    }
  };

  const handleEditarHorario = (horario) => {
    setEditingHorarioId(horario.draftId);
    setHorarioForm({
      teacher_id: horario.teacher_id ? String(horario.teacher_id) : '',
      subject_id: horario.subject_id ? String(horario.subject_id) : '',
      day_of_week: horario.day_of_week || 'Segunda',
      start_time: horario.start_time || '',
      end_time: horario.end_time || '',
      room: horario.room || '',
    });
    setSelectedTeacherLabel(horario.teacher_name || '');
  };

  const handleRemoverHorario = (horarioId) => {
    setHorariosDraft((current) => current.filter((horario) => horario.draftId !== horarioId));
    if (editingHorarioId === horarioId) resetHorarioForm();
    setCompleted(false);
    toast.success('Horário removido do rascunho.');
  };

  const validateBeforeSummary = () => {
    if (!validateStep1()) {
      setStep(1);
      return false;
    }
    if (alunosDraft.length === 0) {
      toast.error('Adicione pelo menos um aluno antes de seguir.');
      setStep(2);
      return false;
    }
    if (horariosDraft.length === 0) {
      toast.error('Adicione pelo menos um horário antes de seguir.');
      setStep(3);
      return false;
    }
    return true;
  };

  const handleGoToSummary = () => {
    if (!validateBeforeSummary()) return;
    setStep(4);
  };

  const handleConcluir = async () => {
    if (!validateBeforeSummary()) return;

    setFinalizing(true);
    try {
      const turmaResponse = await turmasService.criar(turmaForm);
      const turmaId = turmaResponse.data?.id;

      for (const aluno of alunosDraft) {
        const studentId =
          aluno.source === 'new'
            ? (
                await alunosService.criar({
                  name: aluno.name,
                  birth_date: aluno.birth_date,
                  document: aluno.document,
                  password: aluno.password,
                  guardian_name: aluno.guardian_name,
                  guardian_phone: aluno.guardian_phone,
                  guardian_document: aluno.guardian_document,
                  cep: aluno.cep,
                  state: aluno.state,
                  city: aluno.city,
                  neighborhood: aluno.neighborhood,
                  street: aluno.street,
                  number: aluno.number,
                  complement: aluno.complement,
                })
              ).data?.id
            : aluno.id;

        await turmasService.matricularAluno(turmaId, studentId);
      }

      for (const horario of horariosDraft) {
        await horariosService.criar({
          class_id: Number(turmaId),
          teacher_id: Number(horario.teacher_id),
          subject_id: Number(horario.subject_id),
          day_of_week: horario.day_of_week,
          start_time: horario.start_time,
          end_time: horario.end_time,
          room: horario.room || undefined,
        });
      }

      setCompleted(true);
      toast.success('Turma criada com alunos e horários.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao concluir a criação da turma.');
    } finally {
      setFinalizing(false);
    }
  };

  const handleNovaTurma = () => {
    setStep(1);
    setCompleted(false);
    setTurmaForm(initialTurmaForm);
    setAlunoForm(initialAlunoForm);
    setHorarioForm(initialHorarioForm);
    setAlunosDraft([]);
    setHorariosDraft([]);
    setSelectedStudent(null);
    setSelectedTeacherLabel('');
    setEditingHorarioId(null);
    closeAlunoModal();
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
      <Breadcrumb items={[{ label: 'Turmas', to: '/turmas' }, { label: 'Montar Turma' }]} />

      <PageHeader title="Montar Turma" description="Fluxo guiado para montar a turma e salvar tudo apenas no final.">
        <Link to="/turmas" className="btn-outline-primary">
          <span className="inline-icon"><Icon path={icons.arrowLeft} size={16} /></span>
          Voltar para Turmas
        </Link>
      </PageHeader>

      <div className="steps-shell">
        <Card className="steps-sidebar-card">
          <div className="steps-sidebar">
            {STEP_ITEMS.map((item) => {
              const isActive = item.id === step;
              const isDone = item.id < step || (completed && item.id <= STEP_ITEMS.length);
              const isLocked = item.id === 4 && (alunosCount === 0 || horariosCount === 0 || !turmaForm.name.trim());
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
                    <strong>
                      <span className="inline-icon">
                        <Icon path={STEP_ICONS[item.id]} size={16} />
                      </span>
                      {item.title}
                    </strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="steps-content">
          {step === 1 && (
            <Card>
              <StepCardHeader title="1. Dados da Turma" />
              <form onSubmit={handleNextFromTurma}>
                <div className="form-grid">
                  <FormInput
                    label="Nome da Turma"
                    id="step-class-name"
                    placeholder="Ex: 6o Ano A"
                    required
                    value={turmaForm.name}
                    onChange={(event) => setTurmaForm({ ...turmaForm, name: event.target.value })}
                  />
                  <SelectField
                    label="Série / Ano"
                    id="step-class-grade"
                    value={turmaForm.grade}
                    onChange={(event) => setTurmaForm({ ...turmaForm, grade: event.target.value })}
                    options={[
                      { value: 'Maternal', label: 'Maternal' },
                      { value: 'Jardim I', label: 'Jardim I' },
                      { value: 'Jardim II', label: 'Jardim II' },
                      { value: 'Pré-escola', label: 'Pré-escola' },
                      { value: '1o Ano (Ensino Fundamental)', label: '1o Ano (Ensino Fundamental)' },
                      { value: '2o Ano (Ensino Fundamental)', label: '2o Ano (Ensino Fundamental)' },
                      { value: '3o Ano (Ensino Fundamental)', label: '3o Ano (Ensino Fundamental)' },
                      { value: '4o Ano (Ensino Fundamental)', label: '4o Ano (Ensino Fundamental)' },
                      { value: '5o Ano (Ensino Fundamental)', label: '5o Ano (Ensino Fundamental)' },
                      { value: '6o Ano (Ensino Fundamental)', label: '6o Ano (Ensino Fundamental)' },
                      { value: '7o Ano (Ensino Fundamental)', label: '7o Ano (Ensino Fundamental)' },
                      { value: '8o Ano (Ensino Fundamental)', label: '8o Ano (Ensino Fundamental)' },
                      { value: '9o Ano (Ensino Fundamental)', label: '9o Ano (Ensino Fundamental)' },
                      { value: '1o Ano (Ensino Médio)', label: '1o Ano (Ensino Médio)' },
                      { value: '2o Ano (Ensino Médio)', label: '2o Ano (Ensino Médio)' },
                      { value: '3o Ano (Ensino Médio)', label: '3o Ano (Ensino Médio)' },
                    ]}
                  />
                  <SelectField
                    label="Turno"
                    id="step-class-shift"
                    value={turmaForm.shift}
                    onChange={(event) => setTurmaForm({ ...turmaForm, shift: event.target.value })}
                    options={[
                      { value: 'Manhã', label: 'Manhã' },
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
                <div className="steps-actions steps-actions-end">
                  <button type="submit" className="btn-primary">
                    <span className="inline-icon"><Icon path={icons.arrowRight} size={16} /></span>
                    Próximo passo
                  </button>
                </div>
              </form>
            </Card>
          )}

          {step === 2 && (
            <>
              <Card>
                <StepCardHeader
                  title="2. Alunos da turma"
                  action={(
                    <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                      <span className="inline-icon"><Icon path={icons.arrowLeft} size={16} /></span>
                      Voltar
                    </button>
                  )}
                />
                <div className="steps-inline-form">
                  <div className="steps-inline-form-grow">
                    <AsyncSearchSelect
                      label="Buscar aluno"
                      placeholder="Buscar aluno por nome ou CPF"
                      selectedLabel={selectedStudent?.label || ''}
                      onSearch={searchStudents}
                      onSelect={(option) => setSelectedStudent(option)}
                      emptyMessage="Nenhum aluno encontrado."
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary steps-inline-action"
                    onClick={handleVincularAlunoExistente}
                    disabled={!selectedStudent}
                  >
                    <span className="inline-icon"><Icon path={icons.plus} size={16} /></span>
                    Adicionar
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-icon"
                    onClick={() => setIsAlunoModalOpen(true)}
                    title="Cadastrar novo aluno"
                    aria-label="Cadastrar novo aluno"
                  >
                    <span className="inline-icon"><Icon path={icons.userPlus} size={18} /></span>
                  </button>
                </div>
                <div className="steps-actions steps-actions-end">
                  <button type="button" className="btn-primary" onClick={() => setStep(3)}>
                    <span className="inline-icon"><Icon path={icons.arrowRight} size={16} /></span>
                    Próximo passo
                  </button>
                </div>
              </Card>

              <Card title="Alunos no rascunho da turma">
                {alunosDraft.length === 0 ? (
                  <div className="empty-state">Nenhum aluno adicionado ainda.</div>
                ) : (
                  <div className="steps-list">
                    {alunosDraft.map((aluno) => {
                      const alunoKey = aluno.source === 'new' ? aluno.draftId : aluno.id;
                      return (
                        <div key={alunoKey} className="steps-list-item">
                          <div>
                            <strong>{aluno.name}</strong>
                            <small>
                              {aluno.document || 'Sem CPF informado'} {aluno.source === 'new' ? '• Novo cadastro' : '• Existente'}
                            </small>
                          </div>
                          <button type="button" className="btn-danger" onClick={() => handleRemoverAluno(alunoKey)}>
                            <span className="inline-icon"><Icon path={icons.trash} size={16} /></span>
                            Remover
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </>
          )}

          {step === 3 && (
            <>
              <Card>
                <StepCardHeader
                  title="3. Montar grade horária da turma"
                  action={(
                    <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                      <span className="inline-icon"><Icon path={icons.arrowLeft} size={16} /></span>
                      Voltar
                    </button>
                  )}
                />
                {materias.length === 0 ? (
                  <div className="empty-state">
                    Cadastre ao menos uma matéria em <Link to="/materias">Matérias</Link> para criar horários.
                  </div>
                ) : (
                  <form onSubmit={handleSalvarHorario}>
                    <p className="page-description" style={{ marginTop: 0 }}>
                      Monte a grade no rascunho. Nada será salvo no banco antes da confirmação final.
                    </p>
                    <div className="steps-inline-form steps-inline-form-top">
                      <div className="steps-inline-form-grow">
                        <AsyncSearchSelect
                          label="Professor"
                          placeholder="Buscar professor por nome, CPF ou e-mail"
                          selectedLabel={selectedTeacherLabel}
                          onSearch={searchTeachers}
                          onSelect={(option) => {
                            setHorarioForm({ ...horarioForm, teacher_id: String(option.value) });
                            setSelectedTeacherLabel(option.label);
                          }}
                          emptyMessage="Nenhum professor encontrado."
                        />
                      </div>
                      <button type="submit" className="btn-primary steps-inline-action" disabled={savingHorario}>
                        <span className="inline-icon"><Icon path={editingHorarioId ? icons.edit : icons.plus} size={16} /></span>
                        {savingHorario ? 'Salvando...' : editingHorarioId ? 'Salvar' : 'Adicionar'}
                      </button>
                      {editingHorarioId && (
                        <button type="button" className="btn-secondary btn-icon" onClick={resetHorarioForm} title="Cancelar edição" aria-label="Cancelar edição">
                          <span className="inline-icon"><Icon path={icons.close} size={18} /></span>
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <SelectField
                        label="Matéria"
                        id="step-schedule-subject"
                        value={horarioForm.subject_id}
                        onChange={(event) => setHorarioForm({ ...horarioForm, subject_id: event.target.value })}
                        options={materias.map((materia) => ({ value: materia.id, label: materia.name }))}
                      />
                      <SelectField
                        label="Dia da semana"
                        id="step-schedule-day"
                        value={horarioForm.day_of_week}
                        onChange={(event) => setHorarioForm({ ...horarioForm, day_of_week: event.target.value })}
                        options={diasDaSemana.map((dia) => ({ value: dia, label: dia }))}
                      />
                      <FormInput
                        label="Início"
                        id="step-schedule-start"
                        type="time"
                        value={horarioForm.start_time}
                        onChange={(event) => setHorarioForm({ ...horarioForm, start_time: event.target.value })}
                      />
                      <FormInput
                        label="Fim"
                        id="step-schedule-end"
                        type="time"
                        value={horarioForm.end_time}
                        onChange={(event) => setHorarioForm({ ...horarioForm, end_time: event.target.value })}
                      />
                      <FormInput
                        label="Sala"
                        id="step-schedule-room"
                        placeholder="Ex: Sala 4"
                        value={horarioForm.room}
                        onChange={(event) => setHorarioForm({ ...horarioForm, room: event.target.value })}
                      />
                    </div>
                    <div className="steps-actions steps-actions-end">
                      <button type="button" className="btn-primary" onClick={handleGoToSummary}>
                        <span className="inline-icon"><Icon path={icons.arrowRight} size={16} /></span>
                        Próximo passo
                      </button>
                    </div>
                  </form>
                )}
              </Card>

              <Card title="Horários no rascunho">
                {horariosDaTurma.length === 0 ? (
                  <div className="empty-state">Nenhum horário definido ainda.</div>
                ) : (
                  <div className="steps-list">
                    {horariosDaTurma.map((horario) => (
                      <div key={horario.draftId} className="steps-list-item">
                        <div>
                          <strong>
                            {horario.day_of_week} {horario.start_time} - {horario.end_time}
                          </strong>
                          <small>
                            {horario.subject_name} • {horario.teacher_name}
                            {horario.room ? ` • Sala ${horario.room}` : ''}
                          </small>
                        </div>
                        <div className="steps-actions" style={{ marginTop: 0 }}>
                          <button type="button" className="btn-secondary" onClick={() => handleEditarHorario(horario)}>
                            <span className="inline-icon"><Icon path={icons.edit} size={16} /></span>
                            Editar
                          </button>
                          <button type="button" className="btn-danger" onClick={() => handleRemoverHorario(horario.draftId)}>
                            <span className="inline-icon"><Icon path={icons.trash} size={16} /></span>
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {step === 4 && (
            <>
              <Card>
                <StepCardHeader
                  title="4. Resumo da criação"
                  action={(
                    <button type="button" className="btn-secondary" onClick={() => setStep(3)} disabled={finalizing}>
                      <span className="inline-icon"><Icon path={icons.arrowLeft} size={16} /></span>
                      Voltar
                    </button>
                  )}
                />
                <div className="steps-list">
                  <div className="steps-list-item">
                    <div>
                      <strong>{turmaForm.name || 'Turma sem nome'}</strong>
                      <small>
                        {turmaForm.grade || 'Série não informada'} • {turmaForm.shift || 'Turno não informado'}
                        {turmaForm.room ? ` • Sala ${turmaForm.room}` : ''}
                        {turmaForm.school_year ? ` • Ano letivo ${turmaForm.school_year}` : ''}
                      </small>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title={`Alunos selecionados (${alunosDraft.length})`}>
                {alunosDraft.length === 0 ? (
                  <div className="empty-state">Nenhum aluno selecionado.</div>
                ) : (
                  <div className="steps-list">
                    {alunosDraft.map((aluno) => (
                      <div key={aluno.source === 'new' ? aluno.draftId : aluno.id} className="steps-list-item">
                        <div>
                          <strong>{aluno.name}</strong>
                          <small>{aluno.document || 'Sem CPF informado'}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title={`Horários escolhidos (${horariosDaTurma.length})`}>
                {horariosDaTurma.length === 0 ? (
                  <div className="empty-state">Nenhum horário selecionado.</div>
                ) : (
                  <div className="steps-list">
                    {horariosDaTurma.map((horario) => (
                      <div key={horario.draftId} className="steps-list-item">
                        <div>
                          <strong>
                            {horario.subject_name} • {horario.day_of_week}
                          </strong>
                          <small>
                            {horario.start_time} - {horario.end_time} • {horario.teacher_name}
                            {horario.room ? ` • Sala ${horario.room}` : ''}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Confirmação final">
                <p className="page-description">
                  Revise os dados acima. A turma, as matrículas e os horários serão criados somente ao clicar em concluir.
                </p>
                <div className="steps-actions steps-actions-end">
                  <button type="button" className="btn-primary" onClick={handleConcluir} disabled={finalizing}>
                    <span className="inline-icon"><Icon path={icons.check} size={16} /></span>
                    {finalizing ? 'Concluindo...' : 'Concluir criação da turma'}
                  </button>
                </div>
              </Card>

              {completed && (
                <Card title="Turma concluída">
                  <p className="page-description">
                    Tudo foi salvo no banco com sucesso. Agora você pode usar as telas atuais para editar, incluir e excluir normalmente.
                  </p>
                  <div className="steps-actions">
                    <button type="button" className="btn-secondary" onClick={handleNovaTurma}>
                      <span className="inline-icon"><Icon path={icons.plus} size={16} /></span>
                      Criar outra turma
                    </button>
                    <button type="button" className="btn-primary" onClick={() => navigate('/turmas')}>
                      <span className="inline-icon"><Icon path={icons.arrowRight} size={16} /></span>
                      Ir para lista de turmas
                    </button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {isAlunoModalOpen && (
        <div className="modal-overlay" onClick={closeAlunoModal}>
          <div className="modal-content modal-content-wide" onClick={(event) => event.stopPropagation()}>
            <h3>Cadastrar novo aluno</h3>
            <form onSubmit={handleCriarAluno}>
              <div className="modal-stepper">
                {ALUNO_MODAL_STEPS.map((item) => {
                  const active = item.id === alunoModalStep;
                  const done = item.id < alunoModalStep;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`modal-step-chip${active ? ' active' : ''}${done ? ' done' : ''}`}
                      onClick={() => setAlunoModalStep(item.id)}
                    >
                      <span className="modal-step-chip-number">{done ? 'OK' : item.id}</span>
                      <span className="modal-step-chip-label">
                        <span className="inline-icon"><Icon path={item.icon} size={14} /></span>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {alunoModalStep === 1 && (
                <div className="form-grid">
                  <FormInput label="Nome do aluno" id="modal-student-name" required value={alunoForm.name} onChange={(event) => setAlunoForm({ ...alunoForm, name: event.target.value })} />
                  <FormInput label="Data de nascimento" id="modal-student-birth-date" type="date" value={alunoForm.birth_date} onChange={(event) => setAlunoForm({ ...alunoForm, birth_date: event.target.value })} />
                  <FormInput label="CPF" id="modal-student-document" required maxLength={14} value={alunoForm.document} onChange={(event) => setAlunoForm({ ...alunoForm, document: maskCpf(event.target.value) })} />
                  <FormInput label="Senha" id="modal-student-password" type="password" required value={alunoForm.password} onChange={(event) => setAlunoForm({ ...alunoForm, password: event.target.value })} />
                  <FormInput label="Confirmar senha" id="modal-student-confirm-password" type="password" required value={alunoForm.confirmPassword} onChange={(event) => setAlunoForm({ ...alunoForm, confirmPassword: event.target.value })} />
                </div>
              )}

              {alunoModalStep === 2 && (
                <div className="form-grid">
                  <FormInput label="Nome do responsável" id="modal-student-guardian-name" value={alunoForm.guardian_name} onChange={(event) => setAlunoForm({ ...alunoForm, guardian_name: event.target.value })} />
                  <FormInput label="Telefone do responsável" id="modal-student-guardian-phone" maxLength={15} value={alunoForm.guardian_phone} onChange={(event) => setAlunoForm({ ...alunoForm, guardian_phone: maskPhone(event.target.value) })} />
                  <FormInput label="CPF do responsável" id="modal-student-guardian-document" maxLength={14} value={alunoForm.guardian_document} onChange={(event) => setAlunoForm({ ...alunoForm, guardian_document: maskCpf(event.target.value) })} />
                </div>
              )}

              {alunoModalStep === 3 && (
                <div className="form-grid">
                  <FormInput label="CEP" id="modal-student-cep" maxLength={9} value={alunoForm.cep} onChange={(event) => handleCepChangeAluno(event.target.value)} />
                  <FormInput label="Estado" id="modal-student-state" value={alunoForm.state} onChange={(event) => setAlunoForm({ ...alunoForm, state: event.target.value })} />
                  <FormInput label="Cidade" id="modal-student-city" value={alunoForm.city} onChange={(event) => setAlunoForm({ ...alunoForm, city: event.target.value })} />
                  <FormInput label="Bairro" id="modal-student-neighborhood" value={alunoForm.neighborhood} onChange={(event) => setAlunoForm({ ...alunoForm, neighborhood: event.target.value })} />
                  <FormInput label="Rua" id="modal-student-street" value={alunoForm.street} onChange={(event) => setAlunoForm({ ...alunoForm, street: event.target.value })} />
                  <FormInput label="Número" id="modal-student-number" value={alunoForm.number} onChange={(event) => setAlunoForm({ ...alunoForm, number: event.target.value })} />
                  <FormInput label="Complemento" id="modal-student-complement" value={alunoForm.complement} onChange={(event) => setAlunoForm({ ...alunoForm, complement: event.target.value })} />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeAlunoModal} disabled={savingAluno}>
                  <span className="inline-icon"><Icon path={icons.close} size={16} /></span>
                  Fechar
                </button>
                {alunoModalStep > 1 && (
                  <button type="button" className="btn-secondary" onClick={() => setAlunoModalStep(alunoModalStep - 1)} disabled={savingAluno}>
                    <span className="inline-icon"><Icon path={icons.arrowLeft} size={16} /></span>
                    Voltar
                  </button>
                )}
                {alunoModalStep < ALUNO_MODAL_STEPS.length ? (
                  <button type="button" className="btn-primary" onClick={() => setAlunoModalStep(alunoModalStep + 1)} disabled={savingAluno}>
                    <span className="inline-icon"><Icon path={icons.arrowRight} size={16} /></span>
                    Próximo
                  </button>
                ) : (
                  <button type="submit" className="btn-primary" disabled={savingAluno}>
                    <span className="inline-icon"><Icon path={icons.check} size={16} /></span>
                    {savingAluno ? 'Salvando...' : 'Adicionar ao rascunho'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
