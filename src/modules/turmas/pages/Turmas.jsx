import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ name: '', grade: '', shift: '', room: '', school_year: '' });
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await turmasService.excluir(id);
        toast.success('Turma excluída com sucesso!');
        load();
      } catch (error) {
        toast.error('Erro ao excluir turma.');
      }
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
              placeholder="Ex: 6º Ano A" 
              required 
              value={!editId ? form.name : ''} 
              onChange={e => !editId && setForm({ ...form, name: e.target.value })} 
            />
            
            <div className="form-group">
              <label htmlFor="new-grade">Série / Ano</label>
              <input 
                id="new-grade"
                list="new-grades-list"
                placeholder="Ex: 6º Ano (Ensino Fundamental)" 
                value={!editId ? form.grade : ''} 
                onChange={e => !editId && setForm({ ...form, grade: e.target.value })} 
              />
              <datalist id="new-grades-list">
                <option value="Maternal" />
                <option value="Jardim I" />
                <option value="Jardim II" />
                <option value="Pré-escola" />
                <option value="1º Ano (Ensino Fundamental)" />
                <option value="2º Ano (Ensino Fundamental)" />
                <option value="3º Ano (Ensino Fundamental)" />
                <option value="4º Ano (Ensino Fundamental)" />
                <option value="5º Ano (Ensino Fundamental)" />
                <option value="6º Ano (Ensino Fundamental)" />
                <option value="7º Ano (Ensino Fundamental)" />
                <option value="8º Ano (Ensino Fundamental)" />
                <option value="9º Ano (Ensino Fundamental)" />
                <option value="1º Ano (Ensino Médio)" />
                <option value="2º Ano (Ensino Médio)" />
                <option value="3º Ano (Ensino Médio)" />
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
                    onClick={() => handleDelete(t.id)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Modal de Edição */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e1e1e', // tema escuro
            padding: '2rem',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#fff' }}>Editar Turma</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput 
                  label="Nome da Turma" 
                  id="edit-name" 
                  placeholder="Ex: 6º Ano A" 
                  required 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                />
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="edit-grade" style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#ccc' }}>Série / Ano</label>
                  <input 
                    id="edit-grade"
                    list="edit-grades-list"
                    placeholder="Ex: 6º Ano (Ensino Fundamental)" 
                    value={form.grade} 
                    onChange={e => setForm({ ...form, grade: e.target.value })} 
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #333',
                      backgroundColor: '#242424',
                      color: '#fff'
                    }}
                  />
                  <datalist id="edit-grades-list">
                    <option value="Maternal" />
                    <option value="Jardim I" />
                    <option value="Jardim II" />
                    <option value="Pré-escola" />
                    <option value="1º Ano (Ensino Fundamental)" />
                    <option value="2º Ano (Ensino Fundamental)" />
                    <option value="3º Ano (Ensino Fundamental)" />
                    <option value="4º Ano (Ensino Fundamental)" />
                    <option value="5º Ano (Ensino Fundamental)" />
                    <option value="6º Ano (Ensino Fundamental)" />
                    <option value="7º Ano (Ensino Fundamental)" />
                    <option value="8º Ano (Ensino Fundamental)" />
                    <option value="9º Ano (Ensino Fundamental)" />
                    <option value="1º Ano (Ensino Médio)" />
                    <option value="2º Ano (Ensino Médio)" />
                    <option value="3º Ano (Ensino Médio)" />
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
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
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
    </div>
  );
}
