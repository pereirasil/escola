import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, PageHeader, FormInput, Spinner, Breadcrumb } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function AlunoEditar() {
  const { id } = useParams();
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ name: '', birth_date: '', document: '', guardian_name: '', guardian_phone: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '', class_id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [resAluno, resTurmas] = await Promise.all([
          alunosService.buscarPorId(id),
          turmasService.listar()
        ]);
        const a = resAluno.data;
        setTurmas(resTurmas.data || []);
        if (a) {
          setForm({
            name: a.name || '',
            birth_date: a.birth_date || '',
            document: a.document || '',
            guardian_name: a.guardian_name || '',
            guardian_phone: a.guardian_phone || '',
            state: a.state || '',
            city: a.city || '',
            neighborhood: a.neighborhood || '',
            street: a.street || '',
            number: a.number || '',
            complement: a.complement || '',
            class_id: a.class_id != null ? String(a.class_id) : ''
          });
        }
      } catch (error) {
        toast.error('Erro ao carregar aluno.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const classId = form.class_id ? Number(form.class_id) : null;
      await alunosService.atualizar(id, {
        name: form.name,
        birth_date: form.birth_date || null,
        document: form.document,
        guardian_name: form.guardian_name || null,
        guardian_phone: form.guardian_phone || null,
        state: form.state || null,
        city: form.city || null,
        neighborhood: form.neighborhood || null,
        street: form.street || null,
        number: form.number || null,
        complement: form.complement || null,
        class_id: classId
      });
      toast.success('Aluno atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><Spinner /></div>;

  return (
    <div className="page">
      <Breadcrumb items={[
        { label: 'Alunos', to: '/alunos' },
        { label: form.name || 'Editar' }
      ]} />

      <PageHeader title="Editar Aluno" description={`Editando: ${form.name || '...'}`} />

      <Card title="Dados do aluno">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome do aluno" id="name" placeholder="Ex: João da Silva" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="Data de nascimento" id="birth_date" type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
            <FormInput label="CPF (usuário de acesso)" id="document" placeholder="Ex: 123.456.789-00" required value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
            <FormInput label="Nome do Responsável" id="guardian_name" placeholder="Ex: Maria da Silva" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} />
            <FormInput label="Telefone do Responsável" id="guardian_phone" placeholder="Ex: (11) 99999-9999" value={form.guardian_phone} onChange={e => setForm({ ...form, guardian_phone: e.target.value })} />
            <FormInput label="Estado" id="state" placeholder="Ex: SP" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <FormInput label="Cidade" id="city" placeholder="Ex: Sao Paulo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <FormInput label="Bairro" id="neighborhood" placeholder="Ex: Centro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
            <FormInput label="Rua" id="street" placeholder="Ex: Rua das Flores" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            <FormInput label="Numero" id="number" placeholder="Ex: 123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
            <FormInput label="Complemento" id="complement" placeholder="Ex: Apto 45" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
            <div className="form-group">
              <label htmlFor="class_id">Turma</label>
              <select
                id="class_id"
                value={form.class_id}
                onChange={e => setForm({ ...form, class_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </Card>
    </div>
  );
}
