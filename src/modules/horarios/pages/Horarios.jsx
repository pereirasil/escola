import React, { useState, useEffect } from 'react';
import { Card, PageHeader, FormInput, SelectField, ConfirmModal, FormModal } from '../../../components/ui';
import { horariosService } from '../../../services/horarios.service';
import { turmasService } from '../../../services/turmas.service';
import { professoresService } from '../../../services/professores.service';
import { materiasService } from '../../../services/materias.service';
import HorarioForm from '../components/HorarioForm';
import toast from 'react-hot-toast';

const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    class_id: '', teacher_id: '', subject_id: '',
    day_of_week: 'Segunda', start_time: '', end_time: '', room: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [filtroSerie, setFiltroSerie] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      const res = await horariosService.listar();
      setHorarios(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar horários.');
    }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadHorarios(); }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...editForm,
        class_id: Number(editForm.class_id),
        teacher_id: Number(editForm.teacher_id),
        subject_id: Number(editForm.subject_id)
      };
      await horariosService.atualizar(editId, payload);
      toast.success('Horário atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditId(null);
      setEditForm({ class_id: '', teacher_id: '', subject_id: '', day_of_week: 'Segunda', start_time: '', end_time: '', room: '' });
      loadHorarios();
    } catch (error) {
      toast.error('Erro ao atualizar horário.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (aula) => {
    setEditId(aula.id);
    setEditForm({
      class_id: aula.class_id || '',
      teacher_id: aula.teacher_id || '',
      subject_id: aula.subject_id || '',
      day_of_week: aula.day_of_week || 'Segunda',
      start_time: aula.start_time || '',
      end_time: aula.end_time || '',
      room: aula.room || ''
    });
    setIsEditModalOpen(true);
  };

  const cancelEdit = () => {
    setEditForm({ class_id: '', teacher_id: '', subject_id: '', day_of_week: 'Segunda', start_time: '', end_time: '', room: '' });
    setEditId(null);
    setIsEditModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await horariosService.excluir(deleteTarget);
      toast.success('Horário removido com sucesso!');
      loadHorarios();
    } catch (error) {
      toast.error('Erro ao remover horário.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    loadHorarios();
  };

  const seriesUnicas = [...new Set(turmas.map(t => t.grade).filter(Boolean))].sort();
  const classIdsDaSerie = filtroSerie
    ? turmas.filter(t => t.grade === filtroSerie).map(t => t.id)
    : [];
  const horariosFiltrados = filtroSerie
    ? horarios.filter(h => classIdsDaSerie.includes(h.class_id))
    : horarios;
  const temposUnicos = Array.from(new Set(horariosFiltrados.map(h => h.start_time))).sort();

  return (
    <div className="page">
      <PageHeader title="Grade Horária" description="Gestão de horários de aulas e professores">
        <button type="button" className="btn-primary" onClick={() => setCreateModalOpen(true)}>
          + Adicionar Horário
        </button>
      </PageHeader>

      <Card title="Grade Semanal">
        <div style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
          <SelectField
            label="Visualizar Grade por Série:"
            id="filtroSerie"
            value={filtroSerie}
            onChange={e => setFiltroSerie(e.target.value)}
            options={[{ value: '', label: 'Todas as séries' }, ...seriesUnicas.map(s => ({ value: s, label: s }))]}
          />
        </div>

        {horariosFiltrados.length === 0 ? (
          <div className="empty-state">Nenhum horário encontrado para a série selecionada.</div>
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
                        const aulasNoHorarioEDia = horariosFiltrados.filter(h => h.start_time === tempo && h.day_of_week === dia);

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

      <FormModal open={createModalOpen} title="Cadastrar Novo Horário" onClose={() => setCreateModalOpen(false)} size="lg">
        <HorarioForm turmas={turmas} professores={professores} materias={materias} onSuccess={handleCreateSuccess} />
      </FormModal>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-wide">
            <h3>Editar Horário</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <SelectField
                  label="Turma"
                  id="edit-class_id"
                  required
                  value={editForm.class_id}
                  onChange={e => setEditForm({ ...editForm, class_id: e.target.value })}
                  options={turmas.map(t => ({ value: t.id, label: t.name }))}
                />
                <SelectField
                  label="Professor"
                  id="edit-teacher_id"
                  required
                  value={editForm.teacher_id}
                  onChange={e => setEditForm({ ...editForm, teacher_id: e.target.value })}
                  options={professores.map(p => ({ value: p.id, label: p.name }))}
                />
                <SelectField
                  label="Matéria"
                  id="edit-subject_id"
                  required
                  value={editForm.subject_id}
                  onChange={e => setEditForm({ ...editForm, subject_id: e.target.value })}
                  options={materias.map(m => ({ value: m.id, label: m.name }))}
                />
                <SelectField
                  label="Dia da Semana"
                  id="edit-day_of_week"
                  required
                  value={editForm.day_of_week}
                  onChange={e => setEditForm({ ...editForm, day_of_week: e.target.value })}
                  options={diasDaSemana.map(d => ({ value: d, label: d }))}
                />
                <FormInput label="Início" id="edit-start_time" type="time" required value={editForm.start_time} onChange={e => setEditForm({ ...editForm, start_time: e.target.value })} />
                <FormInput label="Fim" id="edit-end_time" type="time" required value={editForm.end_time} onChange={e => setEditForm({ ...editForm, end_time: e.target.value })} />
                <FormInput label="Sala" id="edit-room" placeholder="Ex: Lab 1" value={editForm.room} onChange={e => setEditForm({ ...editForm, room: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Atualizar Horário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Remover horário"
        message="Tem certeza que deseja remover este horário?"
        confirmLabel="Remover"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
