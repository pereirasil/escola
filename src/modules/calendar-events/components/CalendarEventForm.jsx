import React, { useState } from 'react';
import { FormInput } from '../../../components/ui';
import { calendarEventsService } from '../../../services/calendarEvents.service';
import toast from 'react-hot-toast';

const INITIAL_FORM = { title: '', description: '', date: '', series: [] };

export default function CalendarEventForm({ gradesDisponiveis = [], onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const addSerie = (grade) => {
    if (!grade) return;
    setForm(prev => {
      if (prev.series.includes(grade)) return prev;
      return { ...prev, series: [...prev.series, grade] };
    });
  };

  const removeSerie = (grade) => {
    setForm(prev => ({
      ...prev,
      series: prev.series.filter(s => s !== grade),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.title || !form.date) {
      toast.error('Título e data são obrigatórios.');
      return;
    }
    if (form.series.length === 0) {
      toast.error('Selecione ao menos uma série.');
      return;
    }

    setSubmitting(true);
    try {
      await calendarEventsService.criar(form);
      toast.success('Evento criado com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch {
      toast.error('Erro ao criar evento.');
    } finally {
      setSubmitting(false);
    }
  };

  const seriesOptions = gradesDisponiveis.map(g => ({ value: g, label: g }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormInput
          label="Título"
          id="modal_event_title"
          placeholder="Ex: Dia das Mães"
          required
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <FormInput
          label="Data"
          id="modal_event_date"
          type="date"
          required
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
        />
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Descrição</label>
        <textarea
          placeholder="Descrição do evento (opcional)"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Séries selecionadas</label>
        <div style={{ marginBottom: '0.75rem' }}>
          <div className="form-group">
            <label htmlFor="modal_event_serie_select">Adicionar série</label>
            <select
              id="modal_event_serie_select"
              onChange={(e) => { addSerie(e.target.value); e.target.value = ''; }}
              defaultValue=""
            >
              <option value="">Selecione uma série...</option>
              {seriesOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        {form.series.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {form.series.map((serie) => (
              <span
                key={serie}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  background: 'rgba(100,108,255,0.15)',
                  border: '1px solid #646cff',
                  color: '#c5c6ff',
                  fontSize: '0.85rem',
                }}
              >
                {serie}
                <button
                  type="button"
                  onClick={() => removeSerie(serie)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '1rem',
                    lineHeight: 1,
                  }}
                  title="Remover"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar Evento'}
        </button>
      </div>
    </form>
  );
}
