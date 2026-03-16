import React, { useState } from 'react';
import { FormInput, SelectField } from '../../../components/ui';
import { pagamentosService } from '../../../services/pagamentos.service';
import toast from 'react-hot-toast';

const INITIAL_FORM = { student_id: '', amount: '', due_date: '', status: 'pending' };

export default function PagamentoForm({ alunos = [], onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.student_id) {
      toast.error('Selecione o aluno.');
      return;
    }

    const amount = parseFloat(String(form.amount).replace(/\./g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        student_id: Number(form.student_id),
        amount,
        due_date: form.due_date || null,
        status: form.status || 'pending',
      };

      await pagamentosService.criar(payload);
      toast.success('Pagamento criado com sucesso! O boleto foi gerado e enviado por e-mail ao aluno.');
      setForm(INITIAL_FORM);
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <SelectField
          label="Aluno"
          id="pagamento_student_id"
          required
          value={form.student_id}
          onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          options={alunos.map((a) => ({ value: a.id, label: a.name }))}
        />
        <FormInput
          label="Valor (R$)"
          id="pagamento_amount"
          type="text"
          required
          placeholder="Ex: 350,00"
          value={form.amount}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            const formatted = v ? (parseInt(v, 10) / 100).toFixed(2).replace('.', ',') : '';
            setForm({ ...form, amount: formatted });
          }}
        />
        <FormInput
          label="Data de vencimento"
          id="pagamento_due_date"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar pagamento e gerar boleto'}
        </button>
      </div>
    </form>
  );
}
