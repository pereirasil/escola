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
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [statusModalLoading, setStatusModalLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page) => {
    try {
      const [resA, resT, resR] = await Promise.all([
        alunosService.listarPaginado(p, 10, statusFilter),
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

  useEffect(() => {
    load(page);
  }, [page, statusFilter]);

  const confirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setStatusModalLoading(true);
    try {
      await alunosService.atualizarStatus(deactivateTarget, 'inactive');
      toast.success('Aluno desativado.');
      setDeactivateTarget(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao desativar aluno.');
    } finally {
      setStatusModalLoading(false);
    }
  };

  const reativar = async (studentId) => {
    setStatusUpdatingId(studentId);
    try {
      await alunosService.atualizarStatus(studentId, 'active');
      toast.success('Aluno reativado.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao reativar aluno.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleStatusSwitch = (student, wantsActive) => {
    const isCurrentlyActive = student.status !== 'inactive';
    if (wantsActive === isCurrentlyActive) return;
    if (wantsActive) {
      reativar(student.id);
      return;
    }
    setDeactivateTarget(student.id);
  }

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
      <PageHeader title="Alunos" description="Gerenciamento de alunos e matrículas">
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          + Adicionar Aluno
        </button>
      </PageHeader>

      <Card title="Lista de Alunos">
        <div className="form-grid" style={{ marginBottom: '1rem', alignItems: 'end' }}>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <span style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
              Situação na lista
            </span>
            <div className="alunos-status-filter-toggle" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                onClick={() => {
                  setStatusFilter('active');
                  setPage(1);
                }}
              >
                Alunos Ativos
              </button>
              <button
                type="button"
                className={statusFilter === 'inactive' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                onClick={() => {
                  setStatusFilter('inactive');
                  setPage(1);
                }}
              >
                Alunos Inativos
              </button>
            </div>
          </div>
        </div>

        {loadingData ? <Spinner /> : (
          <>
            <DataTable
              columns={['Nome', 'CPF/Matrícula', 'Série', 'Sala', 'Faltas', 'Situação', 'Ações']}
              data={alunosFiltrados}
              renderRow={(a) => {
                const t = turmas.find(t => t.id === a.class_id);
                const stats = ranking.find(r => r.aluno_id === a.id);
                const totalFaltas = stats ? stats.faltas : 0;
                const alerta = totalFaltas >= 5;
                const isActive = a.status !== 'inactive';
                const switchBusy =
                  statusUpdatingId === a.id ||
                  (statusModalLoading && deactivateTarget === a.id);

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
                    <td>
                      <label className="student-status-switch">
                        <input
                          type="checkbox"
                          role="switch"
                          aria-checked={isActive}
                          checked={isActive}
                          disabled={switchBusy}
                          onChange={(e) => handleStatusSwitch(a, e.target.checked)}
                        />
                        <span className="student-status-switch-track" aria-hidden>
                          <span className="student-status-switch-thumb" />
                        </span>
                        <span className="student-status-switch-label-text">{isActive ? 'Ativo' : 'Inativo'}</span>
                      </label>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/alunos/${a.id}/editar`}>
                        <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Editar</button>
                      </Link>
                      <Link to={`/alunos/${a.id}`}>
                        <button type="button" className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Histórico</button>
                      </Link>
                    </td>
                  </tr>
                );
              }}
            />
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
                <span className="pagination-info">Página {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Próxima</button>
              </div>
            )}
          </>
        )}
      </Card>

      <FormModal open={modalOpen} title="Cadastrar Novo Aluno" onClose={() => setModalOpen(false)} size="lg">
        <AlunoForm turmas={turmas} onSuccess={handleFormSuccess} />
      </FormModal>

      <ConfirmModal
        open={!!deactivateTarget}
        title="Desativar aluno?"
        message="Este aluno ficará inativo no sistema. O ideal é desativar apenas se o aluno tiver trancado a matrícula ou sido transferido para outra escola."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        danger
        loading={statusModalLoading}
        onConfirm={confirmDeactivate}
        onCancel={() => !statusModalLoading && setDeactivateTarget(null)}
      />
    </div>
  );
}
