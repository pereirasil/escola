import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, FormModal } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import TurmaForm from '../components/TurmaForm';
import toast from 'react-hot-toast';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', grade: '', shift: '', room: '', school_year: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const load = async () => {
    try {
      const res = await turmasService.listar();
      setTurmas(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar turmas.');
    }
  };

  useEffect(() => { load() }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await turmasService.atualizar(editId, editForm);
      toast.success('Turma atualizada com sucesso!');
      setIsEditModalOpen(false);
      setEditId(null);
      setEditForm({ name: '', grade: '', shift: '', room: '', school_year: '' });
      load();
    } catch (error) {
      toast.error('Erro ao atualizar turma.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditId(t.id);
    setEditForm({
      name: t.name || '',
      grade: t.grade || '',
      shift: t.shift || '',
      room: t.room || '',
      school_year: t.school_year || ''
    });
    setIsEditModalOpen(true);
  };

  const cancelEdit = () => {
    setEditForm({ name: '', grade: '', shift: '', room: '', school_year: '' });
    setEditId(null);
    setIsEditModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await turmasService.excluir(deleteTarget);
      toast.success('Turma excluída com sucesso!');
      load();
    } catch (error) {
      toast.error('Erro ao excluir turma.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Turmas" description="Organização das salas de aula">
        <button type="button" className="btn-primary" onClick={() => setCreateModalOpen(true)}>
          + Adicionar Turma
        </button>
      </PageHeader>

      <Card title="Lista de Turmas">
        <DataTable
          columns={['Nome', 'Série/Ano', 'Turno', 'Sala', 'Ano Letivo', 'Ações']}
          data={turmas}
          renderRow={(t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.grade}</td>
              <td>{t.shift}</td>
              <td>{t.room}</td>
              <td>{t.school_year}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    onClick={() => handleEdit(t)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    onClick={() => setDeleteTarget(t.id)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      <FormModal open={createModalOpen} title="Cadastrar Nova Turma" onClose={() => setCreateModalOpen(false)}>
        <TurmaForm onSuccess={handleCreateSuccess} />
      </FormModal>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Turma</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput
                  label="Nome da Turma"
                  id="edit-name"
                  placeholder="Ex: 6o Ano A"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />

                <div className="form-group">
                  <label htmlFor="edit-grade">Série / Ano</label>
                  <input
                    id="edit-grade"
                    list="edit-grades-list"
                    placeholder="Ex: 6o Ano (Ensino Fundamental)"
                    value={editForm.grade}
                    onChange={e => setEditForm({ ...editForm, grade: e.target.value })}
                  />
                  <datalist id="edit-grades-list">
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
                  id="edit-shift"
                  value={editForm.shift}
                  onChange={e => setEditForm({ ...editForm, shift: e.target.value })}
                  options={[
                    { value: 'Manhã', label: 'Manhã' },
                    { value: 'Tarde', label: 'Tarde' },
                    { value: 'Noite', label: 'Noite' }
                  ]}
                />

                <FormInput
                  label="Sala"
                  id="edit-room"
                  placeholder="Ex: Sala 12"
                  value={editForm.room}
                  onChange={e => setEditForm({ ...editForm, room: e.target.value })}
                />
                <FormInput
                  label="Ano Letivo"
                  id="edit-school_year"
                  placeholder="Ex: 2026"
                  value={editForm.school_year}
                  onChange={e => setEditForm({ ...editForm, school_year: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Atualizar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir turma"
        message="Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
