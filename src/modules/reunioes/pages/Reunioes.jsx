import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal } from '../../../components/ui';
import { reunioesService } from '../../../services/reunioes.service';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function Reunioes() {
  const [reunioes, setReunioes] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', scheduled_at: '', description: '', class_id: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      
      if (payload.class_id) {
        payload.class_id = Number(payload.class_id);
      } else {
        payload.class_id = null;
      }
      
      if (editId) {
        await reunioesService.atualizar(editId, payload);
        toast.success('Reunião atualizada com sucesso!');
        setIsModalOpen(false);
      } else {
        await reunioesService.criar(payload);
        toast.success('Reunião agendada com sucesso!');
      }

      setForm({ title: '', scheduled_at: '', description: '', class_id: '' });
      setEditId(null);
      carregarDados();
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
      description: item.description || '',
      class_id: item.class_id || ''
    });
    
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await reunioesService.excluir(deleteTarget);
      toast.success('Reuniao excluida com sucesso!');
      carregarDados();
    } catch (error) {
      toast.error('Erro ao excluir reuniao.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelEdit = () => {
    setForm({ title: '', scheduled_at: '', description: '', class_id: '' });
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

  const getNomeTurma = (classId) => {
    if (!classId) return 'Todas as turmas';
    const turma = turmas.find(t => t.id === classId);
    return turma ? turma.name : 'Desconhecida';
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
            
            <SelectField 
              label="Turma Alvo" 
              id="new-class_id" 
              value={!editId ? form.class_id : ''} 
              onChange={e => !editId && setForm({ ...form, class_id: e.target.value })}
              options={turmas.map(t => ({ value: t.id, label: t.name }))}
            />

            <FormInput
              label="Data e Hora"
              id="new-scheduled_at"
              type="datetime-local"
              value={!editId ? form.scheduled_at : ''}
              onChange={(e) => !editId && setForm({ ...form, scheduled_at: e.target.value })}
            />
            <div className="form-group">
              <label htmlFor="new-description">Descricao</label>
              <textarea
                id="new-description"
                placeholder="Pauta ou detalhes da reuniao"
                value={!editId ? form.description : ''}
                onChange={(e) => !editId && setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading || editId}>
              {loading && !editId ? 'Agendando...' : 'Agendar Reuniao'}
            </button>
          </div>
        </form>
      </Card>

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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Reuniao</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput
                  label="Titulo"
                  id="edit-title"
                  required
                  placeholder="Ex: Reuniao de Pais"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                
                <SelectField 
                  label="Turma Alvo" 
                  id="edit-class_id" 
                  value={form.class_id} 
                  onChange={e => setForm({ ...form, class_id: e.target.value })}
                  options={turmas.map(t => ({ value: t.id, label: t.name }))}
                />

                <FormInput
                  label="Data e Hora"
                  id="edit-scheduled_at"
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
                <div className="form-group">
                  <label htmlFor="edit-description">Descricao</label>
                  <textarea
                    id="edit-description"
                    placeholder="Pauta ou detalhes da reuniao"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Atualizar Reuniao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir reuniao"
        message="Tem certeza que deseja excluir esta reuniao?"
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
