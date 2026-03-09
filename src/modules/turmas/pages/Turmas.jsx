import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import toast from 'react-hot-toast';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ name: '', grade: '', shift: '', room: '', school_year: '' });

  const load = async () => {
    try {
      const res = await turmasService.listar();
      setTurmas(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar turmas.');
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await turmasService.criar(form);
      toast.success('Turma cadastrada com sucesso!');
      setForm({ name: '', grade: '', shift: '', room: '', school_year: '' });
      load();
    } catch (error) {
      toast.error('Erro ao salvar turma.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await turmasService.excluir(id);
        toast.success('Turma excluída com sucesso!');
        load();
      } catch (error) {
        toast.error('Erro ao excluir turma.');
      }
    }
  };

  return (
    <div className="page">
      <PageHeader title="Turmas" description="Organização das salas de aula" />
      
      <Card title="Cadastrar Nova Turma">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome da Turma" id="name" placeholder="Ex: 6º Ano A" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            
            <div className="form-group">
              <label htmlFor="grade">Série / Ano</label>
              <input 
                id="grade"
                list="grades-list"
                placeholder="Ex: 6º Ano (Ensino Fundamental)" 
                value={form.grade} 
                onChange={e => setForm({ ...form, grade: e.target.value })} 
              />
              <datalist id="grades-list">
                <option value="Maternal" />
                <option value="Jardim I" />
                <option value="Jardim II" />
                <option value="Pré-escola" />
                <option value="1º Ano (Ensino Fundamental)" />
                <option value="2º Ano (Ensino Fundamental)" />
                <option value="3º Ano (Ensino Fundamental)" />
                <option value="4º Ano (Ensino Fundamental)" />
                <option value="5º Ano (Ensino Fundamental)" />
                <option value="6º Ano (Ensino Fundamental)" />
                <option value="7º Ano (Ensino Fundamental)" />
                <option value="8º Ano (Ensino Fundamental)" />
                <option value="9º Ano (Ensino Fundamental)" />
                <option value="1º Ano (Ensino Médio)" />
                <option value="2º Ano (Ensino Médio)" />
                <option value="3º Ano (Ensino Médio)" />
              </datalist>
            </div>

            <SelectField 
              label="Turno" 
              id="shift" 
              value={form.shift} 
              onChange={e => setForm({ ...form, shift: e.target.value })}
              options={[
                { value: 'Manhã', label: 'Manhã' },
                { value: 'Tarde', label: 'Tarde' },
                { value: 'Noite', label: 'Noite' }
              ]}
            />
            
            <FormInput label="Sala" id="room" placeholder="Ex: Sala 12" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
            <FormInput label="Ano Letivo" id="school_year" placeholder="Ex: 2026" value={form.school_year} onChange={e => setForm({ ...form, school_year: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Salvar Turma</button>
        </form>
      </Card>

      <Card title="Lista de Turmas">
        <DataTable
          columns={['Nome', 'Série/Ano', 'Turno', 'Sala', 'Ano Letivo', 'Ações']}
          data={turmas}
          renderRow={(t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.grade}</td>
              <td>{t.shift}</td>
              <td>{t.room}</td>
              <td>{t.school_year}</td>
              <td>
                <button className="btn-danger" onClick={() => handleDelete(t.id)}>Excluir</button>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}