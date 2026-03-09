import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormInput, SelectField } from '../../../components/ui';
import { turmasService } from '../../../services/turmas.service';
import { materiasService } from '../../../services/materias.service';
import { notasService } from '../../../services/notas.service';
import toast from 'react-hot-toast';

export default function Notas() {
  const [turmas, setTurmas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  const [form, setForm] = useState({
    turma_id: '',
    materia_id: '',
    bimestre: '1º Bimestre'
  });

  const [notas, setNotas] = useState({});

  useEffect(() => {
    async function loadFiltros() {
      try {
        const [resT, resM] = await Promise.all([
          turmasService.listar(),
          materiasService.listar()
        ]);
        setTurmas(resT.data || []);
        setMaterias(resM.data || []);
      } catch (err) {
        toast.error('Erro ao carregar dados iniciais');
      }
    }
    loadFiltros();
  }, []);

  // Carregar alunos e notas existentes ao selecionar turma, matéria e bimestre
  useEffect(() => {
    if (form.turma_id && form.materia_id && form.bimestre) {
      carregarAlunosENotas();
    } else {
      setAlunos([]);
      setNotas({});
    }
  }, [form.turma_id, form.materia_id, form.bimestre]);

  const carregarAlunosENotas = async () => {
    setLoadingAlunos(true);
    try {
      const [resAlunos, resNotas] = await Promise.all([
        notasService.buscarAlunosPorTurma(form.turma_id),
        notasService.buscarFiltros(form.turma_id, form.materia_id, form.bimestre)
      ]);
      
      const listaAlunos = resAlunos.data || [];
      const notasSalvas = resNotas.data || [];
      
      setAlunos(listaAlunos);
      
      // Mapeia notas salvas para o estado, ou deixa vazio
      const notasMap = {};
      listaAlunos.forEach(aluno => {
        const notaExistente = notasSalvas.find(n => n.aluno_id === aluno.id);
        notasMap[aluno.id] = notaExistente ? notaExistente.nota : '';
      });
      setNotas(notasMap);
      
    } catch (err) {
      toast.error('Erro ao carregar dados de notas');
      setAlunos([]);
    } finally {
      setLoadingAlunos(false);
    }
  };

  const handleChangeForm = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleNotaChange = (alunoId, valor) => {
    setNotas(prev => ({
      ...prev,
      [alunoId]: valor
    }));
  };

  const handleSalvar = async () => {
    if (alunos.length === 0) {
      return toast.error('Nenhum aluno para registrar nota.');
    }

    // Coleta apenas as notas que foram preenchidas e são números válidos
    const payload = alunos
      .filter(aluno => notas[aluno.id] !== '' && !isNaN(Number(notas[aluno.id])))
      .map(aluno => ({
        aluno_id: aluno.id,
        turma_id: Number(form.turma_id),
        materia_id: Number(form.materia_id),
        bimestre: form.bimestre,
        nota: Number(notas[aluno.id])
      }));

    if (payload.length === 0) {
      return toast.error('Preencha ao menos uma nota válida antes de salvar.');
    }

    try {
      await notasService.salvarNotas(payload);
      toast.success('Notas salvas com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar notas.');
    }
  };

  // Gerar opções de série a partir das turmas cadastradas para o visual, ou usar as próprias turmas no dropdown
  // A solução da imagem pede um filtro de "Série" antes da "Turma".
  // Para simplificar e manter a aderência aos dados reais, usaremos o select de Turma (que já contém a série no nome ex: 6º Ano A)

  return (
    <div className="page">
      <PageHeader title="Lançamento de Notas" description="Registro em lote de notas por turma" />
      
      <Card title="Filtros da Turma e Disciplina">
        <div className="form-grid">
          <SelectField 
            label="Turma" 
            id="turma_id" 
            value={form.turma_id} 
            onChange={handleChangeForm}
            options={turmas.map(t => ({ value: t.id, label: `${t.grade} - ${t.name}` }))}
          />
          <SelectField 
            label="Matéria" 
            id="materia_id" 
            value={form.materia_id} 
            onChange={handleChangeForm}
            options={materias.map(m => ({ value: m.id, label: m.name }))}
          />
          <SelectField 
            label="Bimestre" 
            id="bimestre" 
            value={form.bimestre} 
            onChange={handleChangeForm}
            options={[
              { value: '1º Bimestre', label: '1º Bimestre' },
              { value: '2º Bimestre', label: '2º Bimestre' },
              { value: '3º Bimestre', label: '3º Bimestre' },
              { value: '4º Bimestre', label: '4º Bimestre' },
              { value: 'Recuperação', label: 'Recuperação' },
              { value: 'Exame Final', label: 'Exame Final' }
            ]}
          />
        </div>
      </Card>

      {form.turma_id && form.materia_id && form.bimestre && (
        <Card title="Lista de Alunos">
          {loadingAlunos ? (
            <p>Carregando alunos e notas...</p>
          ) : alunos.length === 0 ? (
            <div className="empty-state">Nenhum aluno matriculado nesta turma.</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70%' }}>Aluno</th>
                      <th style={{ width: '30%' }}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map(aluno => (
                      <tr key={aluno.id}>
                        <td style={{ fontWeight: '500' }}>{aluno.name}</td>
                        <td>
                          <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="10" 
                            placeholder="0.0 a 10.0"
                            value={notas[aluno.id]}
                            onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                            style={{ 
                              width: '100%', 
                              maxWidth: '150px',
                              padding: '0.4rem', 
                              borderRadius: '4px', 
                              border: '1px solid #444', 
                              backgroundColor: '#242424',
                              color: 'white'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" onClick={handleSalvar} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                Salvar Notas
              </button>
            </>
          )}
        </Card>
      )}
    </div>
  );
}