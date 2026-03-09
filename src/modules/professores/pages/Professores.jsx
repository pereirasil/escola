import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, Spinner } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function Professores() {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({ name: '', document: '', phone: '', email: '', subject: '', password: '', confirmPassword: '', class_id: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      const [resP, resT] = await Promise.all([
        professoresService.listar(),
        turmasService.listar()
      ]);
      setProfessores(resP.data || []);
      setTurmas(resT.data || []);
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
      if (class_id) payload.class_ids = [Number(class_id)];
      await professoresService.criar(payload);
      toast.success('Professor cadastrado com sucesso!');
      setForm({ name: '', document: '', phone: '', email: '', subject: '', password: '', confirmPassword: '', class_id: '' });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar professor.');
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
            <SelectField
              label="Turma"
              id="class_id"
              value={form.class_id}
              onChange={e => setForm({ ...form, class_id: e.target.value })}
              options={turmas.map(t => ({ value: t.id, label: t.name }))}
            />
          </div>
          <button type="submit" className="btn-primary">Salvar Professor</button>
        </form>
      </Card>

      <Card title="Lista de Professores">
        {loadingData ? <Spinner /> : (
          <DataTable
            columns={['Nome', 'CPF', 'Telefone', 'E-mail', 'Materias', 'Acoes']}
            data={professores}
            renderRow={(p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.document}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>{p.subject}</td>
                <td>
                  <button className="btn-danger" onClick={() => setDeleteTarget(p.id)}>Excluir</button>
                </td>
              </tr>
            )}
          />
        )}
      </Card>

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