import React, { useState } from 'react';
import { FormInput, SelectField } from '../../../components/ui';
import { horariosService } from '../../../services/horarios.service';
import toast from 'react-hot-toast';

const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const INITIAL_FORM = {
  class_id: '', teacher_id: '', subject_id: '',
  day_of_week: 'Segunda', start_time: '', end_time: '', room: ''
};

export default function HorarioForm({ turmas = [], professores = [], materias = [], onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        class_id: Number(form.class_id),
        teacher_id: Number(form.teacher_id),
        subject_id: Number(form.subject_id)
      };
      await horariosService.criar(payload);
      toast.success('Horário adicionado com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao salvar horário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <SelectField
          label="Turma"
          id="modal_horario_class_id"
          required
          value={form.class_id}
          onChange={e => setForm({ ...form, class_id: e.target.value })}
          options={turmas.map(t => ({ value: t.id, label: t.name }))}
        />
        <SelectField
          label="Professor"
          id="modal_horario_teacher_id"
          required
          value={form.teacher_id}
          onChange={e => setForm({ ...form, teacher_id: e.target.value })}
          options={professores.map(p => ({ value: p.id, label: p.name }))}
        />
        <SelectField
          label="Matéria"
          id="modal_horario_subject_id"
          required
          value={form.subject_id}
          onChange={e => setForm({ ...form, subject_id: e.target.value })}
          options={materias.map(m => ({ value: m.id, label: m.name }))}
        />
        <SelectField
          label="Dia da Semana"
          id="modal_horario_day_of_week"
          required
          value={form.day_of_week}
          onChange={e => setForm({ ...form, day_of_week: e.target.value })}
          options={diasDaSemana.map(d => ({ value: d, label: d }))}
        />
        <FormInput label="Início" id="modal_horario_start_time" type="time" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
        <FormInput label="Fim" id="modal_horario_end_time" type="time" required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
        <FormInput label="Sala" id="modal_horario_room" placeholder="Ex: Lab 1" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Adicionando...' : 'Adicionar a Grade'}
        </button>
      </div>
    </form>
  );
}
