import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, ConfirmModal, Spinner } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import { turmasService } from '../../../services/turmas.service';
import { horariosService } from '../../../services/horarios.service';
import toast from 'react-hot-toast';

export default function Professores() {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({ name: '', document: '', phone: '', email: '', subject: '', password: '', confirmPassword: '', class_id: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', document: '', phone: '', email: '', subject: '', class_id: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [resP, resT, resS] = await Promise.all([
        professoresService.listar(),
        turmasService.listar(),
        horariosService.listar()
      ]);
      setProfessores(resP.data || []);
      setTurmas(resT.data || []);
      setSchedules(resS.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Senha e confirmacao nao conferem.');
      return;
    }
    try {
      const { confirmPassword, class_id, ...payload } = form;
      await professoresService.criar({ ...payload, class_id: class_id ? Number(class_id) : undefined });
      toast.success('Professor cadastrado com sucesso!');
      setForm({ name: '', document: '', phone: '', email: '', subject: '', password: '', confirmPassword: '', class_id: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar professor.');
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setEditForm({
      name: p.name || '',
      document: p.document || '',
      phone: p.phone || '',
      email: p.email || '',
      subject: p.subject || '',
      class_id: p.class_id ? String(p.class_id) : '',
      state: p.state || '',
      city: p.city || '',
      neighborhood: p.neighborhood || '',
      street: p.street || '',
      number: p.number || '',
      complement: p.complement || '',
    });
    setIsModalOpen(true);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', document: '', phone: '', email: '', subject: '', class_id: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
    setIsModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        class_id: editForm.class_id ? Number(editForm.class_id) : null,
      };
      await professoresService.atualizar(editId, payload);
      toast.success('Professor atualizado com sucesso!');
      cancelEdit();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar professor.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await professoresService.excluir(deleteTarget);
      toast.success('Professor excluido com sucesso!');
      load();
    } catch (error) {
      toast.error('Erro ao excluir professor.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Professores" description="Gestao do corpo docente" />
      
      <Card title="Cadastrar Novo Professor">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome do Professor" id="name" placeholder="Ex: Maria Souza" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="CPF (usuario de acesso)" id="document" placeholder="Ex: 123.456.789-00" required value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
            <FormInput label="Senha" id="password" type="password" placeholder="Minimo 6 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <FormInput label="Confirmar senha" id="confirmPassword" type="password" placeholder="Repita a senha" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            <FormInput label="Telefone" id="phone" placeholder="Ex: (11) 99999-9999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <FormInput label="E-mail" id="email" type="email" placeholder="Ex: maria@escola.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <FormInput label="Materias que leciona" id="subject" placeholder="Ex: Matematica, Fisica" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <FormInput label="Estado" id="state" placeholder="Ex: SP" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <FormInput label="Cidade" id="city" placeholder="Ex: Sao Paulo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <FormInput label="Bairro" id="neighborhood" placeholder="Ex: Centro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
            <FormInput label="Rua" id="street" placeholder="Ex: Rua das Flores" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            <FormInput label="Numero" id="number" placeholder="Ex: 123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
            <FormInput label="Complemento" id="complement" placeholder="Ex: Apto 45" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
            <div className="form-group">
              <label htmlFor="class_id">Turma</label>
              <select id="class_id" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
                <option value="">Nenhuma</option>
                {turmas.map(t => (
                  <option key={t.id} value={String(t.id)}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Salvar Professor</button>
        </form>
      </Card>

      <Card title="Lista de Professores">
        {loadingData ? <Spinner /> : (
          <DataTable
            columns={['Nome', 'CPF', 'Telefone', 'E-mail', 'Materias', 'Turma', 'Acoes']}
            data={professores}
            renderRow={(p) => {
              const fromSchedules = schedules.filter(s => s.teacher_id === p.id).map(s => s.class_id);
              const fromClasses = turmas.filter(t => t.teacher_id === p.id).map(t => t.id);
              const fromTeacher = p.class_id ? [p.class_id] : [];
              const classIds = [...new Set([...fromSchedules, ...fromClasses, ...fromTeacher])];
              const nomesTurmas = classIds.map(cid => turmas.find(t => t.id === cid)?.name).filter(Boolean);
              return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.document}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>{p.subject}</td>
                <td>{nomesTurmas.length > 0 ? nomesTurmas.join(', ') : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleEdit(p)}>Editar</button>
                    <button className="btn-danger" onClick={() => setDeleteTarget(p.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
              );
            }}
          />
        )}
      </Card>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Professor</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormInput label="Nome" id="edit-name" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                <FormInput label="CPF" id="edit-document" required value={editForm.document} onChange={e => setEditForm({ ...editForm, document: e.target.value })} />
                <FormInput label="Telefone" id="edit-phone" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                <FormInput label="E-mail" id="edit-email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                <FormInput label="Materias" id="edit-subject" value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} />
                <FormInput label="Estado" id="edit-state" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
                <FormInput label="Cidade" id="edit-city" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                <FormInput label="Bairro" id="edit-neighborhood" value={editForm.neighborhood} onChange={e => setEditForm({ ...editForm, neighborhood: e.target.value })} />
                <FormInput label="Rua" id="edit-street" value={editForm.street} onChange={e => setEditForm({ ...editForm, street: e.target.value })} />
                <FormInput label="Numero" id="edit-number" value={editForm.number} onChange={e => setEditForm({ ...editForm, number: e.target.value })} />
                <FormInput label="Complemento" id="edit-complement" value={editForm.complement} onChange={e => setEditForm({ ...editForm, complement: e.target.value })} />
                <div className="form-group">
                  <label htmlFor="edit-class_id">Turma</label>
                  <select id="edit-class_id" value={editForm.class_id} onChange={e => setEditForm({ ...editForm, class_id: e.target.value })}>
                    <option value="">Nenhuma</option>
                    {turmas.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Atualizar Professor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir professor"
        message="Tem certeza que deseja excluir este professor? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}