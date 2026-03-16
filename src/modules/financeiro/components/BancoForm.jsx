import React, { useState, useEffect, useCallback } from 'react';
import { FormInput, SelectField, AsyncSearchSelect } from '../../../components/ui';
import { bancoService } from '../../../services/banco.service';
import { unmask } from '../../../utils/masks';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Poupança' },
];

export default function BancoForm({ conta, onSuccess }) {
  const [bancos, setBancos] = useState([]);
  const [form, setForm] = useState({
    bank_code: '',
    bank_name: '',
    agency: '',
    agency_digit: '',
    account: '',
    account_digit: '',
    account_type: 'corrente',
    beneficiary_name: '',
    document: '',
    pix_key: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bancoService.listarBancos().then((lista) => setBancos(lista || [])).catch(() => setBancos([]));
  }, []);

  const searchBancos = useCallback(
    async (query) => {
      const q = (query || '').toLowerCase().trim();
      const list = q
        ? bancos.filter((b) => b.code.includes(q) || b.name.toLowerCase().includes(q))
        : bancos;
      return list.map((b) => ({ value: b.code, label: `${b.code} - ${b.name}`, description: `ISPB: ${b.ispb}` }));
    },
    [bancos]
  );

  useEffect(() => {
    if (conta) {
      setForm({
        bank_code: conta.bank_code || '',
        bank_name: conta.bank_name || '',
        agency: conta.agency || '',
        agency_digit: conta.agency_digit || '',
        account: conta.account || '',
        account_digit: conta.account_digit || '',
        account_type: conta.account_type || 'corrente',
        beneficiary_name: conta.beneficiary_name || '',
        document: conta.document || '',
        pix_key: conta.pix_key || '',
      });
    }
  }, [conta]);

  const handleDocumentChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 14);
    const masked =
      v.length <= 11
        ? v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        : v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    setForm((f) => ({ ...f, document: masked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.bank_code || !form.agency || !form.account || !form.beneficiary_name || !form.document) {
      toast.error('Preencha os campos obrigatórios: banco, agência, conta, titular e CPF/CNPJ.');
      return;
    }

    const doc = unmask(form.document);
    if (doc.length !== 11 && doc.length !== 14) {
      toast.error('CPF deve ter 11 dígitos ou CNPJ 14 dígitos.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        document: doc,
      };
      if (conta) {
        await bancoService.atualizar(conta.id, payload);
        toast.success('Dados bancários atualizados.');
      } else {
        await bancoService.criar(payload);
        toast.success('Dados bancários cadastrados.');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <AsyncSearchSelect
          label="Banco"
          placeholder="Pesquisar banco por nome ou código..."
          selectedLabel={form.bank_code ? `${form.bank_code} - ${form.bank_name}` : null}
          onSearch={searchBancos}
          onSelect={(opt) => {
            const b = bancos.find((x) => x.code === opt.value);
            setForm((f) => ({ ...f, bank_code: opt.value, bank_name: b?.name || '' }));
          }}
          emptyMessage="Nenhum banco encontrado."
        />
        <FormInput
          label="Agência"
          id="agency"
          required
          placeholder="Ex: 1234"
          value={form.agency}
          onChange={(e) => setForm((f) => ({ ...f, agency: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
        />
        <FormInput
          label="Dígito da agência"
          id="agency_digit"
          placeholder="Ex: 1"
          value={form.agency_digit}
          onChange={(e) => setForm((f) => ({ ...f, agency_digit: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
        />
        <FormInput
          label="Conta"
          id="account"
          required
          placeholder="Ex: 12345"
          value={form.account}
          onChange={(e) => setForm((f) => ({ ...f, account: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
        />
        <FormInput
          label="Dígito da conta"
          id="account_digit"
          placeholder="Ex: 7"
          value={form.account_digit}
          onChange={(e) => setForm((f) => ({ ...f, account_digit: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
        />
        <SelectField
          label="Tipo de conta"
          id="account_type"
          value={form.account_type}
          onChange={(e) => setForm((f) => ({ ...f, account_type: e.target.value }))}
          options={ACCOUNT_TYPES}
        />
        <FormInput
          label="Titular (nome completo)"
          id="beneficiary_name"
          required
          placeholder="Nome do titular da conta"
          value={form.beneficiary_name}
          onChange={(e) => setForm((f) => ({ ...f, beneficiary_name: e.target.value }))}
        />
        <FormInput
          label="CPF ou CNPJ do titular"
          id="document"
          required
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
          value={form.document}
          onChange={handleDocumentChange}
        />
        <FormInput
          label="Chave PIX (opcional)"
          id="pix_key"
          placeholder="E-mail, telefone, CPF/CNPJ ou chave aleatória"
          value={form.pix_key}
          onChange={(e) => setForm((f) => ({ ...f, pix_key: e.target.value }))}
        />
      </div>
      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando...' : conta ? 'Atualizar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}
