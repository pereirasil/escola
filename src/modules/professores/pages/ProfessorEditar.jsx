import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, PageHeader, FormInput, Spinner, Breadcrumb, PhotoUpload, SelectField, ConfirmModal } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import { turmasService } from '../../../services/turmas.service';
import { horariosService } from '../../../services/horarios.service';
import { materiasService } from '../../../services/materias.service';
import { maskCpf, maskPhone, maskCep, fetchAddressByCep } from '../../../utils/masks';
import toast from 'react-hot-toast';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ProfessorEditar() {
  const { id } = useParams();
  const [turmas, setTurmas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [form, setForm] = useState({ name: '', document: '', phone: '', email: '', cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newSchedule, setNewSchedule] = useState({ class_id: '', subject_id: '', day_of_week: '', start_time: '', end_time: '', room: '' });
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [savingSchedule, setSavingSchedule] = useState(false);

  const loadData = async () => {
    try {
      const [resProf, resTurmas, resSchedules, resMaterias] = await Promise.all([
        professoresService.buscarPorId(id),
        turmasService.listar(),
        horariosService.listar(),
        materiasService.listar()
      ]);
      const p = resProf.data;
      const allTurmas = resTurmas.data || [];
      const allSchedules = resSchedules.data || [];
      const allMaterias = resMaterias.data || [];

      setTurmas(allTurmas);
      setMaterias(allMaterias);
      setTeacherSchedules(allSchedules.filter(s => s.teacher_id === Number(id)));

      if (p) {
        setCurrentPhoto(p.photo || null);
        setForm({
          name: p.name || '',
          document: p.document ? maskCpf(p.document) : '',
          phone: p.phone ? maskPhone(p.phone) : '',
          email: p.email || '',
          cep: p.cep ? maskCep(p.cep) : '',
          state: p.state || '',
          city: p.city || '',
          neighborhood: p.neighborhood || '',
          street: p.street || '',
          number: p.number || '',
          complement: p.complement || '',
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar professor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleCepChange = async (value) => {
    const masked = maskCep(value);
    setForm(prev => ({ ...prev, cep: masked }));
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8) {
      const addr = await fetchAddressByCep(digits);
      if (addr) {
        setForm(prev => ({ ...prev, ...addr }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await professoresService.atualizar(id, form);
      if (photoFile) {
        await professoresService.uploadFoto(id, photoFile);
      }
      toast.success('Professor atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.class_id || !newSchedule.subject_id || !newSchedule.day_of_week || !newSchedule.start_time || !newSchedule.end_time) {
      toast.error('Preencha turma, matéria, dia, início e fim.');
      return;
    }
    setAddingSchedule(true);
    try {
      await horariosService.criar({
        class_id: Number(newSchedule.class_id),
        subject_id: Number(newSchedule.subject_id),
        teacher_id: Number(id),
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        room: newSchedule.room || undefined,
      });
      toast.success('Horário adicionado!');
      setNewSchedule({ class_id: '', subject_id: '', day_of_week: '', start_time: '', end_time: '', room: '' });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar horário.');
    } finally {
      setAddingSchedule(false);
    }
  };

  const handleRemoveSchedule = async () => {
    if (!removeTarget) return;
    try {
      await horariosService.excluir(removeTarget);
      toast.success('Horário removido!');
      await loadData();
    } catch (error) {
      toast.error('Erro ao remover horário.');
    } finally {
      setRemoveTarget(null);
    }
  };

  const startEditing = (s) => {
    setEditingId(s.id);
    setEditingData({
      class_id: s.class_id,
      subject_id: s.subject_id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      room: s.room || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSaveSchedule = async () => {
    if (!editingData.class_id || !editingData.subject_id || !editingData.day_of_week || !editingData.start_time || !editingData.end_time) {
      toast.error('Preencha turma, matéria, dia, início e fim.');
      return;
    }
    setSavingSchedule(true);
    try {
      await horariosService.atualizar(editingId, {
        class_id: Number(editingData.class_id),
        subject_id: Number(editingData.subject_id),
        teacher_id: Number(id),
        day_of_week: editingData.day_of_week,
        start_time: editingData.start_time,
        end_time: editingData.end_time,
        room: editingData.room || undefined,
      });
      toast.success('Horário atualizado!');
      setEditingId(null);
      setEditingData({});
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar horário.');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) return <div className="page"><Spinner /></div>;

  return (
    <div className="page">
      <Breadcrumb items={[
        { label: 'Professores', to: '/professores' },
        { label: form.name || 'Editar' }
      ]} />

      <PageHeader title="Editar Professor" description={`Editando: ${form.name || '...'}`} />

      <Card title="Dados do professor">
        <form onSubmit={handleSubmit}>
          <PhotoUpload currentPhoto={currentPhoto} onFileSelect={setPhotoFile} label="Foto do professor" />
          <div className="form-grid">
            <FormInput label="Nome do Professor" id="name" placeholder="Ex: Maria Souza" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="CPF" id="document" placeholder="000.000.000-00" required value={form.document} onChange={e => setForm({ ...form, document: maskCpf(e.target.value) })} maxLength={14} />
            <FormInput label="Telefone" id="phone" placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })} maxLength={15} />
            <FormInput label="E-mail" id="email" type="email" placeholder="Ex: maria@escola.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <FormInput label="CEP" id="cep" placeholder="00000-000" value={form.cep} onChange={e => handleCepChange(e.target.value)} maxLength={9} />
            <FormInput label="Estado" id="state" placeholder="Ex: SP" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <FormInput label="Cidade" id="city" placeholder="Ex: São Paulo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <FormInput label="Bairro" id="neighborhood" placeholder="Ex: Centro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
            <FormInput label="Rua" id="street" placeholder="Ex: Rua das Flores" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            <FormInput label="Número" id="number" placeholder="Ex: 123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
            <FormInput label="Complemento" id="complement" placeholder="Ex: Apto 45" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar dados'}
          </button>
        </form>
      </Card>

      <Card title="Turmas e Horários">
        {teacherSchedules.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Matéria</th>
                  <th>Dia</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Sala</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {teacherSchedules.map(s => {
                  const isEditing = editingId === s.id;
                  const cellStyle = { padding: '0.25rem 0.35rem' };
                  const inputStyle = { width: '100%', padding: '0.3rem 0.4rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' };
                  const selectStyle = { ...inputStyle, cursor: 'pointer' };

                  if (isEditing) {
                    return (
                      <tr key={s.id}>
                        <td style={cellStyle}>
                          <select style={selectStyle} value={editingData.class_id} onChange={e => setEditingData({ ...editingData, class_id: Number(e.target.value) })}>
                            {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </td>
                        <td style={cellStyle}>
                          <select style={selectStyle} value={editingData.subject_id} onChange={e => setEditingData({ ...editingData, subject_id: Number(e.target.value) })}>
                            {materias.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </td>
                        <td style={cellStyle}>
                          <select style={selectStyle} value={editingData.day_of_week} onChange={e => setEditingData({ ...editingData, day_of_week: e.target.value })}>
                            {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td style={cellStyle}>
                          <input type="time" style={inputStyle} value={editingData.start_time} onChange={e => setEditingData({ ...editingData, start_time: e.target.value })} />
                        </td>
                        <td style={cellStyle}>
                          <input type="time" style={inputStyle} value={editingData.end_time} onChange={e => setEditingData({ ...editingData, end_time: e.target.value })} />
                        </td>
                        <td style={cellStyle}>
                          <input type="text" style={inputStyle} placeholder="Sala" value={editingData.room} onChange={e => setEditingData({ ...editingData, room: e.target.value })} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button type="button" className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={handleSaveSchedule} disabled={savingSchedule}>
                              {savingSchedule ? '...' : 'Salvar'}
                            </button>
                            <button type="button" className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={cancelEditing} disabled={savingSchedule}>
                              Cancelar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={s.id}>
                      <td>{turmas.find(t => t.id === s.class_id)?.name || '-'}</td>
                      <td>{materias.find(m => m.id === s.subject_id)?.name || '-'}</td>
                      <td>{s.day_of_week}</td>
                      <td>{s.start_time}</td>
                      <td>{s.end_time}</td>
                      <td>{s.room || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => startEditing(s)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => setRemoveTarget(s.id)}
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.875rem' }}>
            Nenhum horário vinculado a este professor.
          </p>
        )}

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Adicionar horário</h4>
          <div className="form-grid">
            <SelectField
              label="Turma"
              id="new-class"
              value={newSchedule.class_id}
              onChange={e => setNewSchedule({ ...newSchedule, class_id: e.target.value })}
              options={turmas.map(t => ({ value: t.id, label: t.name }))}
            />
            <SelectField
              label="Matéria"
              id="new-subject"
              value={newSchedule.subject_id}
              onChange={e => setNewSchedule({ ...newSchedule, subject_id: e.target.value })}
              options={materias.map(m => ({ value: m.id, label: m.name }))}
            />
            <SelectField
              label="Dia da semana"
              id="new-day"
              value={newSchedule.day_of_week}
              onChange={e => setNewSchedule({ ...newSchedule, day_of_week: e.target.value })}
              options={DIAS_SEMANA.map(d => ({ value: d, label: d }))}
            />
            <FormInput
              label="Início"
              id="new-start"
              type="time"
              value={newSchedule.start_time}
              onChange={e => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
            />
            <FormInput
              label="Fim"
              id="new-end"
              type="time"
              value={newSchedule.end_time}
              onChange={e => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
            />
            <FormInput
              label="Sala (opcional)"
              id="new-room"
              placeholder="Ex: Sala 3"
              value={newSchedule.room}
              onChange={e => setNewSchedule({ ...newSchedule, room: e.target.value })}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleAddSchedule}
            disabled={addingSchedule}
            style={{ marginTop: '0.5rem' }}
          >
            {addingSchedule ? 'Adicionando...' : 'Adicionar horário'}
          </button>
        </div>
      </Card>

      <ConfirmModal
        open={!!removeTarget}
        title="Remover horário"
        message="Tem certeza que deseja remover este horário do professor?"
        confirmLabel="Remover"
        danger
        onConfirm={handleRemoveSchedule}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
