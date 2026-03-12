import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, FormModal } from '../../../components/ui';
import { reunioesService } from '../../../services/reunioes.service';
import { turmasService } from '../../../services/turmas.service';
import ReuniaoForm from '../components/ReuniaoForm';
import toast from 'react-hot-toast';

export default function Reunioes() {
  const [reunioes, setReunioes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', scheduled_at: '', description: '', class_id: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const carregarDados = async () => {
    try {
      const [resReunioes, resTurmas] = await Promise.all([
        reunioesService.listar(),
        turmasService.listar()
      ]);
      setReunioes(resReunioes.data || []);
      setTurmas(resTurmas.data || []);
    } catch (error) {
      toast.error('Erro ao carregar os dados.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title) {
      toast.error('O título é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...editForm };
      if (!payload.scheduled_at) payload.scheduled_at = null;
      payload.class_id = payload.class_id ? Number(payload.class_id) : null;

      await reunioesService.atualizar(editId, payload);
      toast.success('Reunião atualizada com sucesso!');
      setIsEditModalOpen(false);
      setEditId(null);
      setEditForm({ title: '', scheduled_at: '', description: '', class_id: '' });
      carregarDados();
    } catch (error) {
      toast.error('Erro ao atualizar reunião.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    let formattedDate = '';

    if (item.scheduled_at) {
      const d = new Date(item.scheduled_at);
      if (!isNaN(d.getTime())) {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        formattedDate = (new Date(d - tzoffset)).toISOString().slice(0, 16);
      }
    }

    setEditForm({
      title: item.title || '',
      scheduled_at: formattedDate,
      description: item.description || '',
      class_id: item.class_id || ''
    });

    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await reunioesService.excluir(deleteTarget);
      toast.success('Reunião excluída com sucesso!');
      carregarDados();
    } catch (error) {
      toast.error('Erro ao excluir reunião.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelEdit = () => {
    setEditForm({ title: '', scheduled_at: '', description: '', class_id: '' });
    setEditId(null);
    setIsEditModalOpen(false);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    carregarDados();
  };

  const formatarDataHora = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return dataString;
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  };

  const getNomeTurma = (classId) => {
    if (!classId) return 'Todas as turmas';
    const turma = turmas.find(t => t.id === classId);
    return turma ? turma.name : 'Desconhecida';
  };

  return (
    <div className="page">
      <PageHeader title="Reuniões" description="Agendamento e gestão de reuniões.">
        <button type="button" className="btn-primary" onClick={() => setCreateModalOpen(true)}>
          + Adicionar Reunião
        </button>
      </PageHeader>

      <Card title="Agendamentos">
        <DataTable
          columns={['Título', 'Turma(s)', 'Data e Hora', 'Descrição', 'Ações']}
          data={reunioes}
          emptyMessage="Nenhuma reunião agendada."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>
                <span style={{
                  backgroundColor: item.class_id ? '#3b82f6' : '#4b5563',
                  color: '#fff',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}>
                  {getNomeTurma(item.class_id)}
                </span>
              </td>
              <td>{formatarDataHora(item.scheduled_at)}</td>
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

      <FormModal open={createModalOpen} title="Agendar Nova Reunião" onClose={() => setCreateModalOpen(false)}>
        <ReuniaoForm turmas={turmas} onSuccess={handleCreateSuccess} />
      </FormModal>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Reunião</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput
                  label="Título"
                  id="edit-title"
                  required
                  placeholder="Ex: Reunião de Pais"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />

                <SelectField
                  label="Turma Alvo"
                  id="edit-class_id"
                  value={editForm.class_id}
                  onChange={e => setEditForm({ ...editForm, class_id: e.target.value })}
                  options={turmas.map(t => ({ value: t.id, label: t.name }))}
                />

                <FormInput
                  label="Data e Hora"
                  id="edit-scheduled_at"
                  type="datetime-local"
                  value={editForm.scheduled_at}
                  onChange={(e) => setEditForm({ ...editForm, scheduled_at: e.target.value })}
                />
                <div className="form-group">
                  <label htmlFor="edit-description">Descrição</label>
                  <textarea
                    id="edit-description"
                    placeholder="Pauta ou detalhes da reunião"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Atualizar Reunião'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir reunião"
        message="Tem certeza que deseja excluir esta reunião?"
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
