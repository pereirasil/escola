import React, { useState } from 'react';
import { FormInput } from '../../../components/ui';
import { materiasService } from '../../../services/materias.service';
import toast from 'react-hot-toast';

const INITIAL_FORM = { name: '', duration_minutes: '' };

export default function MateriaForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await materiasService.criar({
        ...form,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null
      });
      toast.success('Materia cadastrada com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao salvar materia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormInput
          label="Nome da materia"
          id="modal_materia_name"
          placeholder="Ex: Matematica"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <FormInput
          label="Tempo de aula (min)"
          id="modal_materia_duration"
          placeholder="Ex: 50"
          type="number"
          value={form.duration_minutes}
          onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
        />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar Materia'}
        </button>
      </div>
    </form>
  );
}
