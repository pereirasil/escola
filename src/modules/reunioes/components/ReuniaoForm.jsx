import React, { useState } from 'react';
import { FormInput, SelectField } from '../../../components/ui';
import { reunioesService } from '../../../services/reunioes.service';
import toast from 'react-hot-toast';

const INITIAL_FORM = { title: '', scheduled_at: '', description: '', class_id: '' };

export default function ReuniaoForm({ turmas = [], onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.title) {
      toast.error('O título é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.scheduled_at) payload.scheduled_at = null;
      payload.class_id = payload.class_id ? Number(payload.class_id) : null;

      await reunioesService.criar(payload);
      toast.success('Reunião agendada com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao agendar reunião.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormInput
          label="Título"
          id="modal_reuniao_title"
          required
          placeholder="Ex: Reunião de Pais"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <SelectField
          label="Turma Alvo"
          id="modal_reuniao_class_id"
          value={form.class_id}
          onChange={e => setForm({ ...form, class_id: e.target.value })}
          options={turmas.map(t => ({ value: t.id, label: t.name }))}
        />
        <FormInput
          label="Data e Hora"
          id="modal_reuniao_scheduled_at"
          type="datetime-local"
          value={form.scheduled_at}
          onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
        />
        <div className="form-group">
          <label htmlFor="modal_reuniao_description">Descrição</label>
          <textarea
            id="modal_reuniao_description"
            placeholder="Pauta ou detalhes da reunião"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Agendando...' : 'Agendar Reunião'}
        </button>
      </div>
    </form>
  );
}
