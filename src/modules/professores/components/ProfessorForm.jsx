import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormInput, SelectField } from '../../../components/ui';
import { professoresService } from '../../../services/professores.service';
import { maskCpf, maskPhone, maskCep, fetchAddressByCep } from '../../../utils/masks';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name: '', document: '', phone: '', email: '',
  password: '', confirmPassword: '',
  cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
  serie: '', sala: ''
};

export default function ProfessorForm({ turmas = [], onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const seriesOptions = useMemo(() => {
    const grades = [...new Set(turmas.map(t => t.grade).filter(Boolean))].sort();
    return grades.map(g => ({ value: g, label: g }));
  }, [turmas]);

  const salasOptions = useMemo(() => {
    const filtered = form.serie ? turmas.filter(t => t.grade === form.serie) : turmas;
    const rooms = [...new Set(filtered.map(t => t.room).filter(Boolean))].sort();
    return rooms.map(r => ({ value: r, label: r }));
  }, [turmas, form.serie]);

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
    if (submitting) return;

    if (form.password !== form.confirmPassword) {
      toast.error('Senha e confirmação não conferem.');
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, serie, sala, ...payload } = form;
      let classId = null;
      if (serie && sala) {
        const turma = turmas.find(t => t.grade === serie && t.room === sala);
        classId = turma?.id || null;
      }
      await professoresService.criar({ ...payload, ...(classId && { class_id: classId }) });
      toast.success('Professor cadastrado com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar professor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormInput label="Nome do Professor" id="modal_prof_name" placeholder="Ex: Maria Souza" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <FormInput label="CPF (usuário de acesso)" id="modal_prof_document" placeholder="000.000.000-00" required value={form.document} onChange={e => setForm({ ...form, document: maskCpf(e.target.value) })} maxLength={14} />
        <FormInput label="Senha" id="modal_prof_password" type="password" placeholder="Mínimo 6 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <FormInput label="Confirmar senha" id="modal_prof_confirmPassword" type="password" placeholder="Repita a senha" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
        <FormInput label="Telefone" id="modal_prof_phone" placeholder="(00) 00000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })} maxLength={15} />
        <FormInput label="E-mail" id="modal_prof_email" type="email" placeholder="Ex: maria@escola.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <FormInput label="CEP" id="modal_prof_cep" placeholder="00000-000" value={form.cep} onChange={e => handleCepChange(e.target.value)} maxLength={9} />
        <FormInput label="Estado" id="modal_prof_state" placeholder="Ex: SP" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <FormInput label="Cidade" id="modal_prof_city" placeholder="Ex: São Paulo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <FormInput label="Bairro" id="modal_prof_neighborhood" placeholder="Ex: Centro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
        <FormInput label="Rua" id="modal_prof_street" placeholder="Ex: Rua das Flores" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
        <FormInput label="Número" id="modal_prof_number" placeholder="Ex: 123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
        <FormInput label="Complemento" id="modal_prof_complement" placeholder="Ex: Apto 45" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
        <SelectField label="Série" id="modal_prof_serie" value={form.serie} onChange={e => setForm(prev => ({ ...prev, serie: e.target.value, sala: '' }))} options={seriesOptions} />
        <SelectField label="Sala" id="modal_prof_sala" value={form.sala} onChange={e => setForm(prev => ({ ...prev, sala: e.target.value }))} options={salasOptions} />
      </div>
      <p style={{ fontSize: '0.875rem', color: '#888', margin: '1rem 0' }}>
        Para vincular turmas e matérias ao professor, utilize a <Link to="/horarios" style={{ color: '#646cff' }}>Grade Horária</Link> após o cadastro.
      </p>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar Professor'}
        </button>
      </div>
    </form>
  );
}
