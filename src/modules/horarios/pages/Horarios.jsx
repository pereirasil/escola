import React, { useState, useEffect } from 'react';
import { Card, PageHeader, FormInput, SelectField } from '../../../components/ui';
import { horariosService } from '../../../services/horarios.service';
import { turmasService } from '../../../services/turmas.service';
import { professoresService } from '../../../services/professores.service';
import { materiasService } from '../../../services/materias.service';
import toast from 'react-hot-toast';

const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [materias, setMaterias] = useState([]);

  const [form, setForm] = useState({ 
    class_id: '', teacher_id: '', subject_id: '', day_of_week: 'Segunda', start_time: '', end_time: '', room: '' 
  });

  const [filtroTurma, setFiltroTurma] = useState('');

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
      const res = await horariosService.listar(filtroTurma);
      setHorarios(res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar horários.');
    }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadHorarios(); }, [filtroTurma]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await horariosService.criar({
        ...form,
        class_id: Number(form.class_id),
        teacher_id: Number(form.teacher_id),
        subject_id: Number(form.subject_id)
      });
      toast.success('Horário adicionado com sucesso!');
      setForm({ ...form, start_time: '', end_time: '', room: '' });
      loadHorarios();
    } catch (error) {
      toast.error('Erro ao salvar horário.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover este horário?')) {
      try {
        await horariosService.excluir(id);
        toast.success('Horário removido com sucesso!');
        loadHorarios();
      } catch (error) {
        toast.error('Erro ao remover horário.');
      }
    }
  };

  // Montar estrutura de Grade Semanal
  // Pegamos todos os horários únicos de início
  const temposUnicos = Array.from(new Set(horarios.map(h => h.start_time))).sort();

  return (
    <div className="page">
      <PageHeader title="Grade Horária" description="Gestão de horários de aulas e professores" />
      
      <Card title="Cadastrar Novo Horário">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <SelectField 
              label="Turma" 
              id="class_id" 
              required 
              value={form.class_id} 
              onChange={e => setForm({ ...form, class_id: e.target.value })}
              options={turmas.map(t => ({ value: t.id, label: t.name }))}
            />
            
            <SelectField 
              label="Professor" 
              id="teacher_id" 
              required 
              value={form.teacher_id} 
              onChange={e => setForm({ ...form, teacher_id: e.target.value })}
              options={professores.map(p => ({ value: p.id, label: p.name }))}
            />

            <SelectField 
              label="Matéria" 
              id="subject_id" 
              required 
              value={form.subject_id} 
              onChange={e => setForm({ ...form, subject_id: e.target.value })}
              options={materias.map(m => ({ value: m.id, label: m.name }))}
            />

            <SelectField 
              label="Dia da Semana" 
              id="day_of_week" 
              required 
              value={form.day_of_week} 
              onChange={e => setForm({ ...form, day_of_week: e.target.value })}
              options={diasDaSemana.map(d => ({ value: d, label: d }))}
            />

            <FormInput label="Início" id="start_time" type="time" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            <FormInput label="Fim" id="end_time" type="time" required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            <FormInput label="Sala" id="room" placeholder="Ex: Lab 1" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Adicionar à Grade</button>
        </form>
      </Card>

      <Card title="Grade Semanal">
        <div style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
          <SelectField 
            label="Visualizar Grade da Turma:" 
            id="filtroTurma" 
            value={filtroTurma} 
            onChange={e => setFiltroTurma(e.target.value)}
            options={turmas.map(t => ({ value: t.id, label: t.name }))}
          />
        </div>

        {horarios.length === 0 ? (
          <div className="empty-state">Nenhum horário encontrado para a turma selecionada.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ width: '120px', backgroundColor: '#2a2a2a' }}>Horário</th>
                  {diasDaSemana.map(dia => (
                    <th key={dia} style={{ textAlign: 'center', backgroundColor: '#2a2a2a' }}>{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {temposUnicos.map(tempo => {
                  return (
                    <tr key={tempo}>
                      <td style={{ fontWeight: 'bold', borderRight: '1px solid #333' }}>{tempo}</td>
                      {diasDaSemana.map(dia => {
                        const aulasNoHorarioEDia = horarios.filter(h => h.start_time === tempo && h.day_of_week === dia);
                        
                        return (
                          <td key={dia} style={{ textAlign: 'center', verticalAlign: 'top', borderRight: '1px solid #333' }}>
                            {aulasNoHorarioEDia.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {aulasNoHorarioEDia.map(aula => {
                                  const m = materias.find(m => m.id === aula.subject_id);
                                  const p = professores.find(p => p.id === aula.teacher_id);
                                  return (
                                    <div key={aula.id} style={{ backgroundColor: '#242424', padding: '0.5rem', borderRadius: '6px', border: '1px solid #444', position: 'relative', fontSize: '0.85rem' }}>
                                      <strong style={{ display: 'block', color: '#646cff' }}>{m?.name || 'Matéria?'}</strong>
                                      <span style={{ display: 'block', color: '#ccc' }}>{p?.name || 'Prof?'}</span>
                                      {aula.room && <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>Sala: {aula.room}</span>}
                                      <button 
                                        className="btn-danger" 
                                        style={{ marginTop: '0.5rem', width: '100%', padding: '0.2rem' }}
                                        onClick={() => handleDelete(aula.id)}
                                      >
                                        Remover
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span style={{ color: '#555' }}>-</span>
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
    </div>
  );
}