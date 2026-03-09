import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader, DataTable, FormInput, SelectField } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { turmasService } from '../../../services/turmas.service';
import { presencasService } from '../../../services/presencas.service';
import toast from 'react-hot-toast';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [form, setForm] = useState({ name: '', birth_date: '', document: '', password: '', confirmPassword: '', guardian_name: '', guardian_phone: '', address: '', class_id: '' });
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');

  const load = async () => {
    try {
      const [resA, resT, resR] = await Promise.all([
        alunosService.listar(),
        turmasService.listar(),
        presencasService.rankingFaltas().catch(() => ({ data: [] }))
      ]);
      setAlunos(resA.data || []);
      setTurmas(resT.data || []);
      setRanking(resR.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados.');
    }
  };

  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let resolvedClassId = null;
      if (form.class_id) {
        const isId = !isNaN(form.class_id);
        if (isId && turmas.find(t => t.id === Number(form.class_id))) {
          resolvedClassId = Number(form.class_id);
        } else {
          const t = turmas.find(t => t.name.toLowerCase() === String(form.class_id).toLowerCase());
          if (t) resolvedClassId = t.id;
        }
      }
      
      if (form.password !== form.confirmPassword) {
        toast.error('Senha e confirmação não conferem.');
        return;
      }
      const { confirmPassword, ...payload } = form;
      await alunosService.criar({ ...payload, class_id: resolvedClassId });
      toast.success('Aluno cadastrado com sucesso!');
      setForm({ name: '', birth_date: '', document: '', password: '', confirmPassword: '', guardian_name: '', guardian_phone: '', address: '', class_id: '' });
      load();
    } catch (error) {
      toast.error('Erro ao salvar aluno.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await alunosService.excluir(id);
        toast.success('Aluno excluído com sucesso!');
        load();
      } catch (error) {
        toast.error('Erro ao excluir aluno.');
      }
    }
  };

  // Aplicação dos filtros
  const alunosFiltrados = alunos.filter(a => {
    const matchNome = a.name.toLowerCase().includes(filtroNome.toLowerCase());
    const matchTurma = filtroTurma ? String(a.class_id) === String(filtroTurma) : true;
    return matchNome && matchTurma;
  });

  return (
    <div className="page">
      <PageHeader title="Alunos" description="Gerenciamento de alunos e matrículas" />
      
      <Card title="Cadastrar Novo Aluno">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput label="Nome do aluno" id="name" placeholder="Ex: João da Silva" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="Data de nascimento" id="birth_date" type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
            <FormInput label="CPF (usuário de acesso)" id="document" placeholder="Ex: 123.456.789-00" required value={form.document} onChange={e => setForm({ ...form, document: e.target.value })} />
            <FormInput label="Senha" id="password" type="password" placeholder="Mínimo 6 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <FormInput label="Confirmar senha" id="confirmPassword" type="password" placeholder="Repita a senha" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            <FormInput label="Nome do Responsável" id="guardian_name" placeholder="Ex: Maria da Silva" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} />
            <FormInput label="Telefone do Responsável" id="guardian_phone" placeholder="Ex: (11) 99999-9999" value={form.guardian_phone} onChange={e => setForm({ ...form, guardian_phone: e.target.value })} />
            <FormInput label="Endereço" id="address" placeholder="Rua, número, bairro" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            
            <div className="form-group">
              <label htmlFor="class_id">Turma</label>
              <input 
                id="class_id"
                list="turmas-list"
                placeholder="Selecione a Turma ou digite"
                value={form.class_id} 
                onChange={e => setForm({ ...form, class_id: e.target.value })} 
              />
              <datalist id="turmas-list">
                {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </datalist>
            </div>
          </div>
          <button type="submit" className="btn-primary">Salvar Aluno</button>
        </form>
      </Card>

      <Card title="Lista de Alunos">
        <div className="form-grid" style={{ marginBottom: '1rem', backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px dashed #333' }}>
          <FormInput 
            label="Filtrar por nome" 
            id="filtroNome" 
            placeholder="Digite o nome..." 
            value={filtroNome} 
            onChange={e => setFiltroNome(e.target.value)} 
          />
          <SelectField 
            label="Filtrar por turma" 
            id="filtroTurma" 
            value={filtroTurma} 
            onChange={e => setFiltroTurma(e.target.value)}
            options={turmas.map(t => ({ value: t.id, label: t.name }))}
          />
        </div>

        <DataTable
          columns={['Nome', 'CPF/Matrícula', 'Turma', 'Faltas', 'Ações']}
          data={alunosFiltrados}
          renderRow={(a) => {
            const t = turmas.find(t => t.id === a.class_id);
            const stats = ranking.find(r => r.aluno_id === a.id);
            const totalFaltas = stats ? stats.faltas : 0;
            const alerta = totalFaltas >= 5;

            return (
              <tr key={a.id}>
                <td>
                  <Link to={`/alunos/${a.id}`} style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>
                    {a.name}
                  </Link>
                </td>
                <td>{a.document}</td>
                <td>{t ? t.name : '-'}</td>
                <td>
                  <span style={{ 
                    color: alerta ? '#f87171' : (totalFaltas > 0 ? '#fbbf24' : '#4ade80'),
                    fontWeight: alerta ? 'bold' : 'normal'
                  }}>
                    {totalFaltas} {alerta && '⚠️'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/alunos/${a.id}/editar`}>
                    <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Editar</button>
                  </Link>
                  <Link to={`/alunos/${a.id}`}>
                    <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Histórico</button>
                  </Link>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(a.id)}>Excluir</button>
                </td>
              </tr>
            );
          }}
        />
      </Card>
    </div>
  );
}