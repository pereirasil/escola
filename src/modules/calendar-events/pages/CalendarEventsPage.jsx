import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, FormModal } from '../../../components/ui';
import { calendarEventsService } from '../../../services/calendarEvents.service';
import { turmasService } from '../../../services/turmas.service';
import CalendarEventForm from '../components/CalendarEventForm';
import toast from 'react-hot-toast';

export default function CalendarEventsPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', series: [] });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [gradesDisponiveis, setGradesDisponiveis] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
    setEditForm(prev => {
      if (prev.series.includes(grade)) return prev;
      return { ...prev, series: [...prev.series, grade] };
    });
  };

  const removeSerie = (grade) => {
    setEditForm(prev => ({
      ...prev,
      series: prev.series.filter(s => s !== grade),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.date) {
      toast.error('Título e data são obrigatórios.');
      return;
    }
    if (editForm.series.length === 0) {
      toast.error('Selecione ao menos uma série.');
      return;
    }

    setLoading(true);
    try {
      await calendarEventsService.atualizar(editId, editForm);
      toast.success('Evento atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditId(null);
      setEditForm({ title: '', description: '', date: '', series: [] });
      carregarDados();
    } catch {
      toast.error('Erro ao atualizar evento.');
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
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      date: item.date || '',
      series,
    });
    setIsEditModalOpen(true);
  };

  const cancelEdit = () => {
    setEditForm({ title: '', description: '', date: '', series: [] });
    setEditId(null);
    setIsEditModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await calendarEventsService.excluir(deleteTarget);
      toast.success('Evento excluído com sucesso!');
      carregarDados();
    } catch {
      toast.error('Erro ao excluir evento.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    carregarDados();
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
          <label htmlFor={`${prefix}-serie-select`}>Adicionar série</label>
          <select
            id={`${prefix}-serie-select`}
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
      <PageHeader title="Criar Aviso" description="Gerencie os avisos do calendário escolar.">
        <button type="button" className="btn-primary" onClick={() => setCreateModalOpen(true)}>
          + Adicionar Evento
        </button>
      </PageHeader>

      <Card title="Eventos Cadastrados">
        <DataTable
          columns={['Título', 'Data', 'Séries', 'Descrição', 'Ações']}
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

      <FormModal open={createModalOpen} title="Criar Aviso" onClose={() => setCreateModalOpen(false)}>
        <CalendarEventForm gradesDisponiveis={gradesDisponiveis} onSuccess={handleCreateSuccess} />
      </FormModal>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Evento</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput
                  label="Título"
                  id="edit-title"
                  placeholder="Ex: Dia das Mães"
                  required
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                />
                <FormInput
                  label="Data"
                  id="edit-date"
                  type="date"
                  required
                  value={editForm.date}
                  onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                />
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    placeholder="Descrição do evento (opcional)"
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Séries selecionadas</label>
                  {renderSeriesSelector('edit', editForm.series)}
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
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
