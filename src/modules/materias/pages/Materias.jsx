import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput } from '../../../components/ui';
import { materiasService } from '../../../services/materias.service';
import toast from 'react-hot-toast';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState({ name: '', duration_minutes: '' });

  const load = async () => {
    try {
      const res = await materiasService.listar();
      setMaterias(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar matérias.');
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await materiasService.criar({ ...form, duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null });
      toast.success('Matéria cadastrada com sucesso!');
      setForm({ name: '', duration_minutes: '' });
      load();
    } catch (error) {
      toast.error('Erro ao salvar matéria.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await materiasService.excluir(id);
        toast.success('Matéria excluída com sucesso!');
        load();
      } catch (error) {
        toast.error('Erro ao excluir matéria.');
      }
    }
  };

  return (
    <div className="page">
      <PageHeader title="Matérias" description="Cadastro das disciplinas escolares" />
      
      <Card title="Cadastrar Nova Matéria">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome da matéria" id="name" placeholder="Ex: Matemática" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="Tempo de aula (min)" id="duration_minutes" placeholder="Ex: 50" type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Salvar Matéria</button>
        </form>
      </Card>

      <Card title="Lista de Matérias">
        <DataTable
          columns={['Nome', 'Duração (minutos)', 'Ações']}
          data={materias}
          renderRow={(m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.duration_minutes || '-'}</td>
              <td>
                <button className="btn-danger" onClick={() => handleDelete(m.id)}>Excluir</button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}