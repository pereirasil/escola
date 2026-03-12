import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, Spinner, FormModal } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import { turmasService } from '../../../services/turmas.service';
import { horariosService } from '../../../services/horarios.service';
import { materiasService } from '../../../services/materias.service';
import { maskCpf, maskPhone, maskCep } from '../../../utils/masks';
import ProfessorForm from '../components/ProfessorForm';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Professores() {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = page) => {
    try {
      const [resP, resT, resS, resM] = await Promise.all([
        professoresService.listarPaginado(p),
        turmasService.listar(),
        horariosService.listar(),
        materiasService.listar()
      ]);
      setProfessores(resP.data || []);
      setTotalPages(resP.totalPages || 1);
      setTurmas(resT.data || []);
      setSchedules(resS.data || []);
      setMaterias(resM.data || []);
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
      await professoresService.excluir(deleteTarget);
      toast.success('Professor excluído com sucesso!');
      load();
    } catch (error) {
      toast.error('Erro ao excluir professor.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    load();
  };

  return (
    <div className="page">
      <PageHeader title="Professores" description="Gestão do corpo docente">
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          + Adicionar Professor
        </button>
      </PageHeader>

      <Card title="Lista de Professores">
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <FormInput
            label="Filtrar por nome"
            id="filtroNomeProfessor"
            placeholder="Digite o nome..."
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
          />
          <SelectField
            label="Filtrar por série"
            id="filtroSerieProfessor"
            value={filtroSerie}
            onChange={e => setFiltroSerie(e.target.value)}
            options={[...new Set(turmas.map(t => t.grade).filter(Boolean))].sort().map(g => ({ value: g, label: g }))}
          />
        </div>
        {loadingData ? <Spinner /> : (
          <>
            <DataTable
              columns={['Nome', 'CPF', 'Telefone', 'E-mail', 'Matérias', 'Série', 'Sala', 'Ações']}
              data={professores.filter(p => {
                const matchNome = p.name.toLowerCase().includes(filtroNome.toLowerCase());
                if (!matchNome) return false;
                if (!filtroSerie) return true;
                const classIds = [...new Set(schedules.filter(s => s.teacher_id === p.id).map(s => s.class_id))];
                const seriesDoProf = classIds.map(cid => turmas.find(t => t.id === cid)?.grade).filter(Boolean);
                return seriesDoProf.includes(filtroSerie);
              })}
              renderRow={(p) => {
                const teacherSchedules = schedules.filter(s => s.teacher_id === p.id);
                const classIds = [...new Set(teacherSchedules.map(s => s.class_id))];
                const subjectIds = [...new Set(teacherSchedules.map(s => s.subject_id))];
                const turmasVinculadas = classIds.map(cid => turmas.find(t => t.id === cid)).filter(Boolean);
                const nomesMaterias = subjectIds.map(sid => materias.find(m => m.id === sid)?.name).filter(Boolean);
                const series = [...new Set(turmasVinculadas.map(t => t.grade).filter(Boolean))];
                const salas = [...new Set(turmasVinculadas.map(t => t.room).filter(Boolean))];
                return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.document}</td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td>{nomesMaterias.length > 0 ? nomesMaterias.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vínculo</span>}</td>
                  <td>{series.length > 0 ? series.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vínculo</span>}</td>
                  <td>{salas.length > 0 ? salas.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vínculo</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => setViewProfile(p)}>Ver Perfil</button>
                      <Link to={`/professores/${p.id}/editar`} className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', textDecoration: 'none' }}>Editar</Link>
                      <button className="btn-danger" onClick={() => setDeleteTarget(p.id)}>Excluir</button>
                    </div>
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

      <FormModal open={modalOpen} title="Cadastrar Novo Professor" onClose={() => setModalOpen(false)} size="lg">
        <ProfessorForm onSuccess={handleFormSuccess} />
      </FormModal>

      {viewProfile && (() => {
        const p = viewProfile;
        const teacherSchedules = schedules.filter(s => s.teacher_id === p.id);
        const classIds = [...new Set(teacherSchedules.map(s => s.class_id))];
        const subjectIds = [...new Set(teacherSchedules.map(s => s.subject_id))];
        const nomesTurmas = classIds.map(cid => turmas.find(t => t.id === cid)?.name).filter(Boolean);
        const nomesMaterias = subjectIds.map(sid => materias.find(m => m.id === sid)?.name).filter(Boolean);
        const photoUrl = p.photo
          ? (p.photo.startsWith('http') ? p.photo : `${API_URL}/uploads/${p.photo}`)
          : null;
        return (
          <div className="modal-overlay" onClick={() => setViewProfile(null)}>
            <div className="modal-content modal-content-wide" onClick={e => e.stopPropagation()}>
              <h3>Perfil do Professor</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {photoUrl && (
                  <div style={{ textAlign: 'center' }}>
                    <img src={photoUrl} alt={p.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><strong>Nome:</strong> {p.name || '-'}</div>
                  <div><strong>CPF:</strong> {p.document ? maskCpf(p.document) : '-'}</div>
                  <div><strong>Telefone:</strong> {p.phone ? maskPhone(p.phone) : '-'}</div>
                  <div><strong>E-mail:</strong> {p.email || '-'}</div>
                  <div><strong>CEP:</strong> {p.cep ? maskCep(p.cep) : '-'}</div>
                  <div><strong>Estado:</strong> {p.state || '-'}</div>
                  <div><strong>Cidade:</strong> {p.city || '-'}</div>
                  <div><strong>Bairro:</strong> {p.neighborhood || '-'}</div>
                  <div><strong>Rua:</strong> {p.street || '-'}</div>
                  <div><strong>Número:</strong> {p.number || '-'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Complemento:</strong> {p.complement || '-'}</div>
                </div>
                <div>
                  <strong>Matérias:</strong>{' '}
                  {nomesMaterias.length > 0 ? nomesMaterias.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vínculo</span>}
                </div>
                <div>
                  <strong>Turmas:</strong>{' '}
                  {nomesTurmas.length > 0 ? nomesTurmas.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vínculo</span>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setViewProfile(null)}>Fechar</button>
              </div>
            </div>
          </div>
        );
      })()}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir professor"
        message="Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
