import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput } from '../../../components/ui';
import { reunioesService } from '../../../services/reunioes.service';
import toast from 'react-hot-toast';

export default function Reunioes() {
  const [reunioes, setReunioes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', scheduled_at: '', description: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const carregarReunioes = async () => {
    try {
      const res = await reunioesService.listar();
      setReunioes(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar reuniões.');
    }
  };

  useEffect(() => {
    carregarReunioes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('O título é obrigatório.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.scheduled_at) {
        payload.scheduled_at = null;
      }
      
      if (editId) {
        await reunioesService.atualizar(editId, payload);
        toast.success('Reunião atualizada com sucesso!');
        setIsModalOpen(false);
      } else {
        await reunioesService.criar(payload);
        toast.success('Reunião agendada com sucesso!');
      }

      setForm({ title: '', scheduled_at: '', description: '' });
      setEditId(null);
      carregarReunioes();
    } catch (error) {
      toast.error(editId ? 'Erro ao atualizar reunião.' : 'Erro ao agendar reunião.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    let formattedDate = '';
    
    if (item.scheduled_at) {
      // Ajustar para formato aceito pelo input datetime-local: YYYY-MM-DDTHH:mm
      const d = new Date(item.scheduled_at);
      if (!isNaN(d.getTime())) {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        formattedDate = (new Date(d - tzoffset)).toISOString().slice(0, 16);
      }
    }
    
    setForm({
      title: item.title || '',
      scheduled_at: formattedDate,
      description: item.description || ''
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta reunião?')) {
      return;
    }

    try {
      await reunioesService.excluir(id);
      toast.success('Reunião excluída com sucesso!');
      carregarReunioes();
    } catch (error) {
      toast.error('Erro ao excluir reunião.');
    }
  };

  const cancelEdit = () => {
    setForm({ title: '', scheduled_at: '', description: '' });
    setEditId(null);
    setIsModalOpen(false);
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

  return (
    <div className="page">
      <PageHeader title="Reuniões" description="Agendamento e gestão de reuniões." />

      <Card title="Agendar Nova Reunião">
        <form onSubmit={(e) => {
          setEditId(null); // Ensure it's create mode
          handleSubmit(e);
        }}>
          <div className="form-grid">
            <FormInput
              label="Título"
              id="new-title"
              required
              placeholder="Ex: Reunião de Pais"
              value={!editId ? form.title : ''}
              onChange={(e) => !editId && setForm({ ...form, title: e.target.value })}
            />
            <FormInput
              label="Data e Hora"
              id="new-scheduled_at"
              type="datetime-local"
              value={!editId ? form.scheduled_at : ''}
              onChange={(e) => !editId && setForm({ ...form, scheduled_at: e.target.value })}
            />
            <FormInput
              label="Descrição"
              id="new-description"
              placeholder="Pauta ou detalhes da reunião"
              value={!editId ? form.description : ''}
              onChange={(e) => !editId && setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading || editId}>
              {loading && !editId ? 'Agendando...' : 'Agendar Reunião'}
            </button>
          </div>
        </form>
      </Card>

      <Card title="Agendamentos">
        <DataTable
          columns={['Título', 'Data e Hora', 'Descrição', 'Ações']}
          data={reunioes}
          emptyMessage="Nenhuma reunião agendada."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
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
                    onClick={() => handleDelete(item.id)}
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
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#fff' }}>Editar Reunião</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput
                  label="Título"
                  id="edit-title"
                  required
                  placeholder="Ex: Reunião de Pais"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <FormInput
                  label="Data e Hora"
                  id="edit-scheduled_at"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
                <FormInput
                  label="Descrição"
                  id="edit-description"
                  placeholder="Pauta ou detalhes da reunião"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
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
    </div>
  );
}
