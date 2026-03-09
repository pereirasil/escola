import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import toast from 'react-hot-toast';

export default function Professores() {
  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState({ name: '', document: '', phone: '', email: '', subject: '' });

  const load = async () => {
    try {
      const res = await professoresService.listar();
      setProfessores(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar professores.');
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await professoresService.criar(form);
      toast.success('Professor cadastrado com sucesso!');
      setForm({ name: '', document: '', phone: '', email: '', subject: '' });
      load();
    } catch (error) {
      toast.error('Erro ao salvar professor.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await professoresService.excluir(id);
        toast.success('Professor excluído com sucesso!');
        load();
      } catch (error) {
        toast.error('Erro ao excluir professor.');
      }
    }
  };

  return (
    <div className="page">
      <PageHeader title="Professores" description="Gestão do corpo docente" />
      
      <Card title="Cadastrar Novo Professor">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome do Professor" id="name" placeholder="Ex: Maria Souza" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="CPF" id="document" placeholder="Ex: 123.456.789-00" value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
            <FormInput label="Telefone" id="phone" placeholder="Ex: (11) 99999-9999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <FormInput label="E-mail" id="email" type="email" placeholder="Ex: maria@escola.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <FormInput label="Matérias que leciona" id="subject" placeholder="Ex: Matemática, Física" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Salvar Professor</button>
        </form>
      </Card>

      <Card title="Lista de Professores">
        <DataTable
          columns={['Nome', 'CPF', 'Telefone', 'E-mail', 'Matérias', 'Ações']}
          data={professores}
          renderRow={(p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.document}</td>
              <td>{p.phone}</td>
              <td>{p.email}</td>
              <td>{p.subject}</td>
              <td>
                <button className="btn-danger" onClick={() => handleDelete(p.id)}>Excluir</button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}