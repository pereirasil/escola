import React, { useState, useEffect } from 'react';
import { Card, PageHeader, FormInput, SelectField, ConfirmModal } from '../../../components/ui';
import { horariosService } from '../../../services/horarios.service';
import { turmasService } from '../../../services/turmas.service';
import { professoresService } from '../../../services/professores.service';
import { materiasService } from '../../../services/materias.service';
import toast from 'react-hot-toast';

const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [form, setForm] = useState({ 
    class_id: '', teacher_id: '', subject_id: '', day_of_week: 'Segunda', start_time: '', end_time: '', room: '' 
  });
  
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filtroTurma, setFiltroTurma] = useState('');

  const loadAll = async () => {
    try {
      const [resT, resP, resM] = await Promise.all([
        turmasService.listar(),
        professoresService.listar(),
        materiasService.listar()
      ]);
      setTurmas(resT.data || []);
      setProfessores(resP.data || []);
      setMaterias(resM.data || []);
    } catch (error) {
      toast.error('Erro ao carregar os dados de dependência.');
    }
  };

  const loadHorarios = async () => {
    try {
      const res = await horariosService.listar(filtroTurma);
      setHorarios(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar horários.');
    }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadHorarios(); }, [filtroTurma]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        class_id: Number(form.class_id),
        teacher_id: Number(form.teacher_id),
        subject_id: Number(form.subject_id)
      };

      if (editId) {
        await horariosService.atualizar(editId, payload);
        toast.success('Horário atualizado com sucesso!');
        setIsModalOpen(false);
      } else {
        await horariosService.criar(payload);
        toast.success('Horário adicionado com sucesso!');
      }
      setForm({ ...form, start_time: '', end_time: '', room: '' });
      setEditId(null);
      loadHorarios();
    } catch (error) {
      toast.error(editId ? 'Erro ao atualizar horário.' : 'Erro ao salvar horário.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (aula) => {
    setEditId(aula.id);
    setForm({
      class_id: aula.class_id || '',
      teacher_id: aula.teacher_id || '',
      subject_id: aula.subject_id || '',
      day_of_week: aula.day_of_week || 'Segunda',
      start_time: aula.start_time || '',
      end_time: aula.end_time || '',
      room: aula.room || ''
    });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setForm({ class_id: '', teacher_id: '', subject_id: '', day_of_week: 'Segunda', start_time: '', end_time: '', room: '' });
    setEditId(null);
    setIsModalOpen(false);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await horariosService.excluir(deleteTarget);
      toast.success('Horario removido com sucesso!');
      loadHorarios();
    } catch (error) {
      toast.error('Erro ao remover horario.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Montar estrutura de Grade Semanal
  // Pegamos todos os horários únicos de início
  const temposUnicos = Array.from(new Set(horarios.map(h => h.start_time))).sort();

  return (
    <div className="page">
      <PageHeader title="Grade Horária" description="Gestão de horários de aulas e professores" />
      
      <Card title="Cadastrar Novo Horário">
        <form onSubmit={(e) => {
          setEditId(null);
          handleSubmit(e);
        }}>
          <div className="form-grid">
            <SelectField 
              label="Turma" 
              id="new-class_id" 
              required 
              value={!editId ? form.class_id : ''} 
              onChange={e => !editId && setForm({ ...form, class_id: e.target.value })}
              options={turmas.map(t => ({ value: t.id, label: t.name }))}
            />
            
            <SelectField 
              label="Professor" 
              id="new-teacher_id" 
              required 
              value={!editId ? form.teacher_id : ''} 
              onChange={e => !editId && setForm({ ...form, teacher_id: e.target.value })}
              options={professores.map(p => ({ value: p.id, label: p.name }))}
            />

            <SelectField 
              label="Matéria" 
              id="new-subject_id" 
              required 
              value={!editId ? form.subject_id : ''} 
              onChange={e => !editId && setForm({ ...form, subject_id: e.target.value })}
              options={materias.map(m => ({ value: m.id, label: m.name }))}
            />

            <SelectField 
              label="Dia da Semana" 
              id="new-day_of_week" 
              required 
              value={!editId ? form.day_of_week : 'Segunda'} 
              onChange={e => !editId && setForm({ ...form, day_of_week: e.target.value })}
              options={diasDaSemana.map(d => ({ value: d, label: d }))}
            />

            <FormInput label="Início" id="new-start_time" type="time" required value={!editId ? form.start_time : ''} onChange={e => !editId && setForm({ ...form, start_time: e.target.value })} />
            <FormInput label="Fim" id="new-end_time" type="time" required value={!editId ? form.end_time : ''} onChange={e => !editId && setForm({ ...form, end_time: e.target.value })} />
            <FormInput label="Sala" id="new-room" placeholder="Ex: Lab 1" value={!editId ? form.room : ''} onChange={e => !editId && setForm({ ...form, room: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || editId}>
            {loading && !editId ? 'Adicionando...' : 'Adicionar à Grade'}
          </button>
        </form>
      </Card>

      <Card title="Grade Semanal">
        <div style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
          <SelectField 
            label="Visualizar Grade da Turma:" 
            id="filtroTurma" 
            value={filtroTurma} 
            onChange={e => setFiltroTurma(e.target.value)}
            options={[{ value: '', label: 'Todas as turmas' }, ...turmas.map(t => ({ value: t.id, label: t.name }))]}
          />
        </div>

        {horarios.length === 0 ? (
          <div className="empty-state">Nenhum horário encontrado para a turma selecionada.</div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderBottom: '2px solid #333', color: '#888', fontWeight: 600, width: '100px' }}>Horário</th>
                  {diasDaSemana.map(dia => (
                    <th key={dia} style={{ padding: '1rem', backgroundColor: '#1a1a1a', borderBottom: '2px solid #333', color: '#888', fontWeight: 600, textAlign: 'center', width: 'calc(100% / 5)' }}>{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {temposUnicos.map(tempo => {
                  return (
                    <tr key={tempo} style={{ borderBottom: '1px solid #2a2a2a' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#ccc', verticalAlign: 'top', borderRight: '1px solid #2a2a2a' }}>
                        {tempo}
                      </td>
                      {diasDaSemana.map(dia => {
                        const aulasNoHorarioEDia = horarios.filter(h => h.start_time === tempo && h.day_of_week === dia);
                        
                        return (
                          <td key={dia} style={{ padding: '0.5rem', verticalAlign: 'top', borderRight: '1px solid #2a2a2a' }}>
                            {aulasNoHorarioEDia.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {aulasNoHorarioEDia.map(aula => {
                                  const m = materias.find(m => m.id === aula.subject_id);
                                  const p = professores.find(p => p.id === aula.teacher_id);
                                  return (
                                    <div key={aula.id} style={{ 
                                      backgroundColor: '#242424', 
                                      padding: '0.75rem', 
                                      borderRadius: '6px', 
                                      border: '1px solid #333',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      textAlign: 'center',
                                      transition: 'border-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#646cff'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                                    >
                                      <strong style={{ color: '#646cff', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{m?.name || 'Matéria?'}</strong>
                                      <span style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{p?.name || 'Prof?'}</span>
                                      {aula.room && <span style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.75rem' }}>Sala: {aula.room}</span>}
                                      
                                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                                        <button 
                                          type="button"
                                          style={{ 
                                            background: 'transparent', 
                                            border: '1px solid #646cff', 
                                            color: '#646cff', 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '4px', 
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            flex: 1
                                          }}
                                          onClick={() => handleEdit(aula)}
                                        >
                                          Editar
                                        </button>
                                        <button 
                                          type="button"
                                          style={{ 
                                            background: 'transparent', 
                                            border: '1px solid #ff4a4a', 
                                            color: '#ff4a4a', 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '4px', 
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            flex: 1
                                          }}
                                          onClick={() => setDeleteTarget(aula.id)}
                                        >
                                          Remover
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', color: '#444', padding: '1rem 0' }}>-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-wide">
            <h3>Editar Horario</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <SelectField 
                  label="Turma" 
                  id="edit-class_id" 
                  required 
                  value={form.class_id} 
                  onChange={e => setForm({ ...form, class_id: e.target.value })}
                  options={turmas.map(t => ({ value: t.id, label: t.name }))}
                />
                
                <SelectField 
                  label="Professor" 
                  id="edit-teacher_id" 
                  required 
                  value={form.teacher_id} 
                  onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                  options={professores.map(p => ({ value: p.id, label: p.name }))}
                />

                <SelectField 
                  label="Materia" 
                  id="edit-subject_id" 
                  required 
                  value={form.subject_id} 
                  onChange={e => setForm({ ...form, subject_id: e.target.value })}
                  options={materias.map(m => ({ value: m.id, label: m.name }))}
                />

                <SelectField 
                  label="Dia da Semana" 
                  id="edit-day_of_week" 
                  required 
                  value={form.day_of_week} 
                  onChange={e => setForm({ ...form, day_of_week: e.target.value })}
                  options={diasDaSemana.map(d => ({ value: d, label: d }))}
                />

                <FormInput label="Inicio" id="edit-start_time" type="time" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                <FormInput label="Fim" id="edit-end_time" type="time" required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                <FormInput label="Sala" id="edit-room" placeholder="Ex: Lab 1" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Atualizar Horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Remover horario"
        message="Tem certeza que deseja remover este horario?"
        confirmLabel="Remover"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}