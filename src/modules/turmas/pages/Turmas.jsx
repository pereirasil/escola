import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ name: '', grade: '', shift: '', room: '', school_year: '' });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      const res = await turmasService.listar();
      setTurmas(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar turmas.');
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await turmasService.atualizar(editId, form);
        toast.success('Turma atualizada com sucesso!');
        setIsModalOpen(false);
      } else {
        await turmasService.criar(form);
        toast.success('Turma cadastrada com sucesso!');
      }
      setForm({ name: '', grade: '', shift: '', room: '', school_year: '' });
      setEditId(null);
      load();
    } catch (error) {
      toast.error(editId ? 'Erro ao atualizar turma.' : 'Erro ao salvar turma.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditId(t.id);
    setForm({
      name: t.name || '',
      grade: t.grade || '',
      shift: t.shift || '',
      room: t.room || '',
      school_year: t.school_year || ''
    });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setForm({ name: '', grade: '', shift: '', room: '', school_year: '' });
    setEditId(null);
    setIsModalOpen(false);
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

  return (
    <div className="page">
      <PageHeader title="Turmas" description="Organização das salas de aula" />
      
      <Card title="Cadastrar Nova Turma">
        <form onSubmit={(e) => {
          setEditId(null);
          handleSubmit(e);
        }}>
          <div className="form-grid">
            <FormInput 
              label="Nome da Turma" 
              id="new-name" 
              placeholder="Ex: 6o Ano A" 
              required 
              value={!editId ? form.name : ''} 
              onChange={e => !editId && setForm({ ...form, name: e.target.value })} 
            />
            
            <div className="form-group">
              <label htmlFor="new-grade">Série / Ano</label>
              <input 
                id="new-grade"
                list="new-grades-list"
                placeholder="Ex: 6o Ano (Ensino Fundamental)" 
                value={!editId ? form.grade : ''} 
                onChange={e => !editId && setForm({ ...form, grade: e.target.value })} 
              />
              <datalist id="new-grades-list">
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
              id="new-shift" 
              value={!editId ? form.shift : ''} 
              onChange={e => !editId && setForm({ ...form, shift: e.target.value })}
              options={[
                { value: 'Manhã', label: 'Manhã' },
                { value: 'Tarde', label: 'Tarde' },
                { value: 'Noite', label: 'Noite' }
              ]}
            />
            
            <FormInput 
              label="Sala" 
              id="new-room" 
              placeholder="Ex: Sala 12" 
              value={!editId ? form.room : ''} 
              onChange={e => !editId && setForm({ ...form, room: e.target.value })} 
            />
            <FormInput 
              label="Ano Letivo" 
              id="new-school_year" 
              placeholder="Ex: 2026" 
              value={!editId ? form.school_year : ''} 
              onChange={e => !editId && setForm({ ...form, school_year: e.target.value })} 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || editId}>
            {loading && !editId ? 'Salvando...' : 'Salvar Turma'}
          </button>
        </form>
      </Card>

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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Turma</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput 
                  label="Nome da Turma" 
                  id="edit-name" 
                  placeholder="Ex: 6o Ano A" 
                  required 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                />
                
                <div className="form-group">
                  <label htmlFor="edit-grade">Série / Ano</label>
                  <input 
                    id="edit-grade"
                    list="edit-grades-list"
                    placeholder="Ex: 6o Ano (Ensino Fundamental)" 
                    value={form.grade} 
                    onChange={e => setForm({ ...form, grade: e.target.value })} 
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
                  id="edit-room" 
                  placeholder="Ex: Sala 12" 
                  value={form.room} 
                  onChange={e => setForm({ ...form, room: e.target.value })} 
                />
                <FormInput 
                  label="Ano Letivo" 
                  id="edit-school_year" 
                  placeholder="Ex: 2026" 
                  value={form.school_year} 
                  onChange={e => setForm({ ...form, school_year: e.target.value })} 
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
