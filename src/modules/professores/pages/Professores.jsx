import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, PageHeader, DataTable, FormInput, SelectField, ConfirmModal, Spinner, PhotoUpload } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import { turmasService } from '../../../services/turmas.service';
import { horariosService } from '../../../services/horarios.service';
import { materiasService } from '../../../services/materias.service';
import { maskCpf, maskPhone, maskCep, fetchAddressByCep } from '../../../utils/masks';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Professores() {
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({ name: '', document: '', phone: '', email: '', password: '', confirmPassword: '', cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
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

  const handleCepChange = async (value) => {
    const masked = maskCep(value);
    setForm(prev => ({ ...prev, cep: masked }));
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8) {
      const addr = await fetchAddressByCep(digits);
      if (addr) {
        setForm(prev => ({ ...prev, ...addr }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Senha e confirmacao nao conferem.');
      return;
    }
    try {
      const { confirmPassword, ...payload } = form;
      const res = await professoresService.criar(payload);
      const profId = res.data?.id;
      if (photoFile && profId) {
        await professoresService.uploadFoto(profId, photoFile);
      }
      toast.success('Professor cadastrado com sucesso!');
      setForm({ name: '', document: '', phone: '', email: '', password: '', confirmPassword: '', cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '' });
      setPhotoFile(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar professor.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await professoresService.excluir(deleteTarget);
      toast.success('Professor excluido com sucesso!');
      load();
    } catch (error) {
      toast.error('Erro ao excluir professor.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Professores" description="Gestao do corpo docente" />
      
      <Card title="Cadastrar Novo Professor">
        <form onSubmit={handleSubmit}>
          <PhotoUpload onFileSelect={setPhotoFile} label="Foto do professor" />
          <div className="form-grid">
            <FormInput label="Nome do Professor" id="name" placeholder="Ex: Maria Souza" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <FormInput label="CPF (usuario de acesso)" id="document" placeholder="000.000.000-00" required value={form.document} onChange={e => setForm({ ...form, document: maskCpf(e.target.value) })} maxLength={14} />
            <FormInput label="Senha" id="password" type="password" placeholder="Minimo 6 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <FormInput label="Confirmar senha" id="confirmPassword" type="password" placeholder="Repita a senha" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            <FormInput label="Telefone" id="phone" placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })} maxLength={15} />
            <FormInput label="E-mail" id="email" type="email" placeholder="Ex: maria@escola.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <FormInput label="CEP" id="cep" placeholder="00000-000" value={form.cep} onChange={e => handleCepChange(e.target.value)} maxLength={9} />
            <FormInput label="Estado" id="state" placeholder="Ex: SP" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <FormInput label="Cidade" id="city" placeholder="Ex: Sao Paulo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <FormInput label="Bairro" id="neighborhood" placeholder="Ex: Centro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
            <FormInput label="Rua" id="street" placeholder="Ex: Rua das Flores" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
            <FormInput label="Numero" id="number" placeholder="Ex: 123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
            <FormInput label="Complemento" id="complement" placeholder="Ex: Apto 45" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
          </div>
          <p style={{ fontSize: '0.875rem', color: '#888', margin: '1rem 0' }}>
            Para vincular turmas e materias ao professor, utilize a <Link to="/horarios" style={{ color: '#646cff' }}>Grade Horaria</Link> apos o cadastro.
          </p>
          <button type="submit" className="btn-primary">Salvar Professor</button>
        </form>
      </Card>

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
            label="Filtrar por turma"
            id="filtroTurmaProfessor"
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
            options={turmas.map(t => ({ value: t.id, label: t.name }))}
          />
        </div>
        {loadingData ? <Spinner /> : (
          <>
            <DataTable
              columns={['Nome', 'CPF', 'Telefone', 'E-mail', 'Materias', 'Turmas', 'Acoes']}
              data={professores.filter(p => {
                const matchNome = p.name.toLowerCase().includes(filtroNome.toLowerCase());
                if (!matchNome) return false;
                if (!filtroTurma) return true;
                const classIds = [...new Set(schedules.filter(s => s.teacher_id === p.id).map(s => s.class_id))];
                return classIds.includes(Number(filtroTurma));
              })}
              renderRow={(p) => {
                const teacherSchedules = schedules.filter(s => s.teacher_id === p.id);
                const classIds = [...new Set(teacherSchedules.map(s => s.class_id))];
                const subjectIds = [...new Set(teacherSchedules.map(s => s.subject_id))];
                const nomesTurmas = classIds.map(cid => turmas.find(t => t.id === cid)?.name).filter(Boolean);
                const nomesMaterias = subjectIds.map(sid => materias.find(m => m.id === sid)?.name).filter(Boolean);
                return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.document}</td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td>{nomesMaterias.length > 0 ? nomesMaterias.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vinculo</span>}</td>
                  <td>{nomesTurmas.length > 0 ? nomesTurmas.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vinculo</span>}</td>
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
                <span className="pagination-info">Pagina {page} de {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Proxima</button>
              </div>
            )}
          </>
        )}
      </Card>

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
                  <div><strong>Numero:</strong> {p.number || '-'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Complemento:</strong> {p.complement || '-'}</div>
                </div>
                <div>
                  <strong>Materias:</strong>{' '}
                  {nomesMaterias.length > 0 ? nomesMaterias.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vinculo</span>}
                </div>
                <div>
                  <strong>Turmas:</strong>{' '}
                  {nomesTurmas.length > 0 ? nomesTurmas.join(', ') : <span style={{ color: '#888', fontStyle: 'italic' }}>Sem vinculo</span>}
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
        message="Tem certeza que deseja excluir este professor? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}