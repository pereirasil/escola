import React, { useState } from 'react';
import { FormInput, SelectField } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

const INITIAL_FORM = { name: '', grade: '', shift: '', room: '', school_year: '' };

export default function TurmaForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await turmasService.criar(form);
      toast.success('Turma cadastrada com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao salvar turma.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormInput
          label="Nome da Turma"
          id="modal_turma_name"
          placeholder="Ex: 6o Ano A"
          required
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <div className="form-group">
          <label htmlFor="modal_turma_grade">Série / Ano</label>
          <input
            id="modal_turma_grade"
            list="modal-grades-list"
            placeholder="Ex: 6o Ano (Ensino Fundamental)"
            value={form.grade}
            onChange={e => setForm({ ...form, grade: e.target.value })}
          />
          <datalist id="modal-grades-list">
            <option value="Maternal" />
            <option value="Jardim I" />
            <option value="Jardim II" />
            <option value="Pré-escola" />
            <option value="1o Ano (Ensino Fundamental)" />
            <option value="2o Ano (Ensino Fundamental)" />
            <option value="3o Ano (Ensino Fundamental)" />
            <option value="4o Ano (Ensino Fundamental)" />
            <option value="5o Ano (Ensino Fundamental)" />
            <option value="6o Ano (Ensino Fundamental)" />
            <option value="7o Ano (Ensino Fundamental)" />
            <option value="8o Ano (Ensino Fundamental)" />
            <option value="9o Ano (Ensino Fundamental)" />
            <option value="1o Ano (Ensino Médio)" />
            <option value="2o Ano (Ensino Médio)" />
            <option value="3o Ano (Ensino Médio)" />
          </datalist>
        </div>

        <SelectField
          label="Turno"
          id="modal_turma_shift"
          value={form.shift}
          onChange={e => setForm({ ...form, shift: e.target.value })}
          options={[
            { value: 'Manhã', label: 'Manhã' },
            { value: 'Tarde', label: 'Tarde' },
            { value: 'Noite', label: 'Noite' }
          ]}
        />

        <FormInput
          label="Sala"
          id="modal_turma_room"
          placeholder="Ex: Sala 12"
          value={form.room}
          onChange={e => setForm({ ...form, room: e.target.value })}
        />
        <FormInput
          label="Ano Letivo"
          id="modal_turma_school_year"
          placeholder="Ex: 2026"
          value={form.school_year}
          onChange={e => setForm({ ...form, school_year: e.target.value })}
        />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar Turma'}
        </button>
      </div>
    </form>
  );
}
