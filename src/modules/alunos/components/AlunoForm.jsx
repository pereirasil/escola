import React, { useState } from 'react';
import { FormInput, SelectField } from '../../../components/ui';
import { alunosService } from '../../../services/alunos.service';
import { turmasService } from '../../../services/turmas.service';
import { maskCpf, maskPhone, maskCep, fetchAddressByCep } from '../../../utils/masks';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name: '', birth_date: '', document: '', email: '', password: '', confirmPassword: '',
  guardian_name: '', guardian_phone: '', guardian_document: '',
  cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: '',
  class_id: '', _serie: ''
};

export default function AlunoForm({ turmas = [], onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

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
      const { confirmPassword, _serie, ...payload } = form;
      const classId = form.class_id ? Number(form.class_id) : null;
      await alunosService.criar({ ...payload, class_id: classId });
      toast.success('Aluno cadastrado com sucesso!');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao salvar aluno.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <FormInput label="Nome do aluno" id="modal_name" placeholder="Ex: João da Silva" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <FormInput label="Data de nascimento" id="modal_birth_date" type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
        <FormInput label="E-mail" id="modal_email" type="email" placeholder="Ex: aluno@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <FormInput label="CPF (usuário de acesso)" id="modal_document" placeholder="000.000.000-00" required value={form.document} onChange={e => setForm({ ...form, document: maskCpf(e.target.value) })} maxLength={14} />
        <FormInput label="Senha" id="modal_password" type="password" placeholder="Mínimo 6 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <FormInput label="Confirmar senha" id="modal_confirmPassword" type="password" placeholder="Repita a senha" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
        <FormInput label="Nome do Responsável" id="modal_guardian_name" placeholder="Ex: Maria da Silva" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} />
        <FormInput label="CPF do Responsável" id="modal_guardian_document" placeholder="000.000.000-00" value={form.guardian_document} onChange={e => setForm({ ...form, guardian_document: maskCpf(e.target.value) })} maxLength={14} />
        <FormInput label="Telefone do Responsável" id="modal_guardian_phone" placeholder="(00) 00000-0000" value={form.guardian_phone} onChange={e => setForm({ ...form, guardian_phone: maskPhone(e.target.value) })} maxLength={15} />
        <FormInput label="CEP" id="modal_cep" placeholder="00000-000" value={form.cep} onChange={e => handleCepChange(e.target.value)} maxLength={9} />
        <FormInput label="Estado" id="modal_state" placeholder="Ex: SP" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <FormInput label="Cidade" id="modal_city" placeholder="Ex: São Paulo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <FormInput label="Bairro" id="modal_neighborhood" placeholder="Ex: Centro" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} />
        <FormInput label="Rua" id="modal_street" placeholder="Ex: Rua das Flores" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} />
        <FormInput label="Número" id="modal_number" placeholder="Ex: 123" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
        <FormInput label="Complemento" id="modal_complement" placeholder="Ex: Apto 45" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} />
        <SelectField
          label="Série"
          id="modal_serie_filter"
          value={form._serie || ''}
          onChange={e => setForm({ ...form, _serie: e.target.value, class_id: '' })}
          options={[...new Set(turmas.map(t => t.grade).filter(Boolean))].map(g => ({ value: g, label: g }))}
        />
        <SelectField
          label="Sala"
          id="modal_class_id"
          value={form.class_id}
          onChange={e => setForm({ ...form, class_id: e.target.value })}
          options={turmas.filter(t => !form._serie || t.grade === form._serie).map(t => ({ value: t.id, label: t.room || t.name }))}
        />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar Aluno'}
        </button>
      </div>
    </form>
  );
}
