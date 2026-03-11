import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal } from '../../../components/ui';
import { calendarEventsService } from '../../../services/calendarEvents.service';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function CalendarEventsPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', series: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [gradesDisponiveis, setGradesDisponiveis] = useState([]);

  const carregarDados = async () => {
    try {
      const [resEventos, resTurmas] = await Promise.all([
        calendarEventsService.listar(),
        turmasService.listar(),
      ]);
      setEventos(resEventos.data || []);
      const turmasData = resTurmas.data || [];
      const grades = [...new Set(turmasData.map(t => t.grade).filter(Boolean))];
      setGradesDisponiveis(grades);
    } catch {
      toast.error('Erro ao carregar dados.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

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
    if (!form.title || !form.date) {
      toast.error('Titulo e data sao obrigatorios.');
      return;
    }
    if (form.series.length === 0) {
      toast.error('Selecione ao menos uma serie.');
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await calendarEventsService.atualizar(editId, form);
        toast.success('Evento atualizado com sucesso!');
        setIsModalOpen(false);
      } else {
        await calendarEventsService.criar(form);
        toast.success('Evento criado com sucesso!');
      }
      setForm({ title: '', description: '', date: '', series: [] });
      setEditId(null);
      carregarDados();
    } catch {
      toast.error(editId ? 'Erro ao atualizar evento.' : 'Erro ao criar evento.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    let series = [];
    try {
      series = typeof item.series === 'string' ? JSON.parse(item.series) : item.series || [];
    } catch {
      series = [];
    }

    setEditId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      date: item.date || '',
      series,
    });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setForm({ title: '', description: '', date: '', series: [] });
    setEditId(null);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await calendarEventsService.excluir(deleteTarget);
      toast.success('Evento excluido com sucesso!');
      carregarDados();
    } catch {
      toast.error('Erro ao excluir evento.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const [year, month, day] = dataString.split('-');
    if (!year || !month || !day) return dataString;
    return `${day}/${month}/${year}`;
  };

  const parseSeries = (val) => {
    try {
      const arr = typeof val === 'string' ? JSON.parse(val) : val || [];
      return arr.join(', ');
    } catch {
      return val || '';
    }
  };

  const seriesOptions = gradesDisponiveis.map(g => ({ value: g, label: g }));

  const renderSeriesSelector = (prefix, selectedSeries) => (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <div className="form-group">
          <label htmlFor={`${prefix}-serie-select`}>Adicionar serie</label>
          <select
            id={`${prefix}-serie-select`}
            onChange={(e) => { addSerie(e.target.value); e.target.value = ''; }}
            defaultValue=""
          >
            <option value="">Selecione uma serie...</option>
            {seriesOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {selectedSeries.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {selectedSeries.map((serie) => (
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
  );

  return (
    <div className="page">
      <PageHeader title="Datas Comemorativas" description="Gerencie as datas comemorativas do calendario escolar." />

      <Card title="Nova Data Comemorativa">
        <form onSubmit={(e) => { setEditId(null); handleSubmit(e); }}>
          <div className="form-grid">
            <FormInput
              label="Titulo"
              id="new-title"
              placeholder="Ex: Dia das Maes"
              required
              value={!editId ? form.title : ''}
              onChange={e => !editId && setForm({ ...form, title: e.target.value })}
            />
            <FormInput
              label="Data"
              id="new-date"
              type="date"
              required
              value={!editId ? form.date : ''}
              onChange={e => !editId && setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Descricao</label>
            <textarea
              placeholder="Descricao do evento (opcional)"
              value={!editId ? form.description : ''}
              onChange={e => !editId && setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Series selecionadas</label>
            {!editId && renderSeriesSelector('new', form.series)}
          </div>
          <button type="submit" className="btn-primary" disabled={loading || editId} style={{ marginTop: '1rem' }}>
            {loading && !editId ? 'Salvando...' : 'Salvar Evento'}
          </button>
        </form>
      </Card>

      <Card title="Eventos Cadastrados">
        <DataTable
          columns={['Titulo', 'Data', 'Series', 'Descricao', 'Acoes']}
          data={eventos}
          renderRow={(item) => (
            <tr key={item.id}>
              <td style={{ fontWeight: 500 }}>{item.title}</td>
              <td>{formatarData(item.date)}</td>
              <td>{parseSeries(item.series)}</td>
              <td>{item.description || '-'}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    onClick={() => setDeleteTarget(item.id)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Evento</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput
                  label="Titulo"
                  id="edit-title"
                  placeholder="Ex: Dia das Maes"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
                <FormInput
                  label="Data"
                  id="edit-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
                <div className="form-group">
                  <label>Descricao</label>
                  <textarea
                    placeholder="Descricao do evento (opcional)"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Series selecionadas</label>
                  {renderSeriesSelector('edit', form.series)}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Atualizar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir evento"
        message="Tem certeza que deseja excluir este evento? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
