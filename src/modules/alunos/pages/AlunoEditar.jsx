import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, PageHeader, FormInput } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function AlunoEditar() {
  const { id } = useParams();
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ name: '', birth_date: '', document: '', guardian_name: '', guardian_phone: '', address: '', class_id: '' });
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
            address: a.address || '',
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
      let resolvedClassId = null;
      if (form.class_id) {
        const num = Number(form.class_id);
        if (!isNaN(num) && turmas.find(t => t.id === num)) {
          resolvedClassId = num;
        } else {
          const t = turmas.find(t => t.name.toLowerCase() === String(form.class_id).toLowerCase());
          if (t) resolvedClassId = t.id;
        }
      }
      await alunosService.atualizar(id, {
        name: form.name,
        birth_date: form.birth_date || null,
        document: form.document,
        guardian_name: form.guardian_name || null,
        guardian_phone: form.guardian_phone || null,
        address: form.address || null,
        class_id: resolvedClassId
      });
      toast.success('Aluno atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page">Carregando...</div>;

  return (
    <div className="page">
      <Link to="/alunos" style={{ color: '#646cff', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Voltar para Alunos
      </Link>

      <PageHeader title="Editar Aluno" description={`Editando: ${form.name || '...'}`} />

      <Card title="Dados do aluno">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome do aluno" id="name" placeholder="Ex: João da Silva" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="Data de nascimento" id="birth_date" type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
            <FormInput label="CPF (usuário de acesso)" id="document" placeholder="Ex: 123.456.789-00" required value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
            <FormInput label="Nome do Responsável" id="guardian_name" placeholder="Ex: Maria da Silva" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} />
            <FormInput label="Telefone do Responsável" id="guardian_phone" placeholder="Ex: (11) 99999-9999" value={form.guardian_phone} onChange={e => setForm({ ...form, guardian_phone: e.target.value })} />
            <FormInput label="Endereço" id="address" placeholder="Rua, número, bairro" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
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
