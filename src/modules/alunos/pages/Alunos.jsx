import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, Spinner, FormModal } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { turmasService } from '../../../services/turmas.service';
import { presencasService } from '../../../services/presencas.service';
import AlunoForm from '../components/AlunoForm';
import toast from 'react-hot-toast';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page) => {
    try {
      const [resA, resT, resR] = await Promise.all([
        alunosService.listarPaginado(p),
        turmasService.listar(),
        presencasService.rankingFaltas().catch(() => ({ data: [] }))
      ]);
      setAlunos(resA.data || []);
      setTotalPages(resA.totalPages || 1);
      setTurmas(resT.data || []);
      setRanking(resR.data || []);
    } catch (error) {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { load(page) }, [page]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await alunosService.excluir(deleteTarget);
      toast.success('Aluno excluido com sucesso!');
      load();
    } catch (error) {
      toast.error('Erro ao excluir aluno.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    load();
  };

  const alunosFiltrados = alunos.filter(a => {
    const matchNome = a.name.toLowerCase().includes(filtroNome.toLowerCase());
    const matchTurma = filtroTurma ? String(a.class_id) === String(filtroTurma) : true;
    return matchNome && matchTurma;
  });

  return (
    <div className="page">
      <PageHeader title="Alunos" description="Gerenciamento de alunos e matriculas">
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          + Adicionar Aluno
        </button>
      </PageHeader>

      <Card title="Lista de Alunos">
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
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

        {loadingData ? <Spinner /> : (
          <>
            <DataTable
              columns={['Nome', 'CPF/Matricula', 'Serie', 'Sala', 'Faltas', 'Acoes']}
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
                    <td>{t?.grade || '-'}</td>
                    <td>{t?.room || '-'}</td>
                    <td>
                      <span style={{ 
                        color: alerta ? '#f87171' : (totalFaltas > 0 ? '#fbbf24' : '#4ade80'),
                        fontWeight: alerta ? 'bold' : 'normal'
                      }}>
                        {totalFaltas}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/alunos/${a.id}/editar`}>
                        <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Editar</button>
                      </Link>
                      <Link to={`/alunos/${a.id}`}>
                        <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Historico</button>
                      </Link>
                      <button type="button" className="btn-danger" onClick={() => setDeleteTarget(a.id)}>Excluir</button>
                    </td>
                  </tr>
                );
              }}
            />
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
                <span className="pagination-info">Pagina {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Proxima</button>
              </div>
            )}
          </>
        )}
      </Card>

      <FormModal open={modalOpen} title="Cadastrar Novo Aluno" onClose={() => setModalOpen(false)} size="lg">
        <AlunoForm turmas={turmas} onSuccess={handleFormSuccess} />
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir aluno"
        message="Tem certeza que deseja excluir este aluno? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
