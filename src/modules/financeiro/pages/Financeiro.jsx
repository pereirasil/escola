import React, { useState, useEffect } from 'react';
import { Card, PageHeader, DataTable, FormModal, FormInput, SelectField, Spinner, ConfirmModal } from '../../../components/ui';
import { pagamentosService } from '../../../services/pagamentos.service';
import { alunosService } from '../../../services/alunos.service';
import PagamentoForm from '../components/PagamentoForm';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/useAuthStore';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'overdue', label: 'Vencido' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function Financeiro() {
  const { user } = useAuthStore();
  const [pagamentos, setPagamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCriar, setModalCriar] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [pagamentoExcluir, setPagamentoExcluir] = useState(null);
  const [statusForm, setStatusForm] = useState('pending');
  const [enviandoBoletoId, setEnviandoBoletoId] = useState(null);
  const [gerandoBoletoId, setGerandoBoletoId] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [pesquisa, setPesquisa] = useState('');
  const [mpConnected, setMpConnected] = useState(false);
  const [mpConnecting, setMpConnecting] = useState(false);

  const isSchool = user?.role === 'school';

  const load = async () => {
    setLoading(true);
    try {
      const [resPay, resAlunos] = await Promise.all([
        pagamentosService.listar().catch((err) => {
          toast.error('Erro ao carregar pagamentos.');
          return { data: [] };
        }),
        alunosService.listar(),
      ]);
      setPagamentos(Array.isArray(resPay?.data) ? resPay.data : []);
      const alunosList = resAlunos?.data ?? (Array.isArray(resAlunos) ? resAlunos : []);
      setAlunos(Array.isArray(alunosList) ? alunosList : []);
    } catch (error) {
      toast.error('Erro ao carregar dados.');
      setPagamentos([]);
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMpStatus = async () => {
    if (!isSchool) return;
    try {
      const res = await pagamentosService.getMercadoPagoStatus();
      setMpConnected(res?.data?.connected ?? false);
    } catch {
      setMpConnected(false);
    }
  };

  useEffect(() => {
    load();
    loadMpStatus();
  }, []);

  useEffect(() => {
    if (modalCriar) {
      alunosService.listar()
        .then((res) => {
          const arr = res?.data ?? (Array.isArray(res) ? res : []);
          setAlunos(Array.isArray(arr) ? arr : []);
        })
        .catch(() => setAlunos([]));
    }
  }, [modalCriar]);

  const handleCriarSuccess = () => {
    setModalCriar(false);
    load();
  };

  const handleConectarMercadoPago = async () => {
    if (mpConnecting || !isSchool) return;
    setMpConnecting(true);
    try {
      const res = await pagamentosService.getMercadoPagoConnectUrl();
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Erro ao obter URL de conexão.');
        setMpConnecting(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao conectar Mercado Pago.');
      setMpConnecting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mp = params.get('mercadopago');
    if (mp === 'connected') {
      toast.success('Mercado Pago conectado com sucesso.');
      setMpConnected(true);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (mp === 'error') {
      const reason = params.get('reason') || 'Erro ao conectar';
      toast.error(`Falha ao conectar Mercado Pago: ${reason}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleExcluirPagamento = async () => {
    if (!pagamentoExcluir) return;
    try {
      await pagamentosService.excluir(pagamentoExcluir.id);
      toast.success('Pagamento excluído.');
      setPagamentoExcluir(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir pagamento.');
    }
  };

  const handleAtualizarStatus = async () => {
    if (!modalStatus) return;
    try {
      await pagamentosService.atualizar(modalStatus.id, { status: statusForm });
      toast.success('Status atualizado.');
      setModalStatus(null);
      load();
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const handleEnviarBoleto = async (pagamento) => {
    if (enviandoBoletoId) return;
    setEnviandoBoletoId(pagamento.id);
    try {
      await pagamentosService.enviarBoleto(pagamento.id);
      toast.success('Boleto enviado por e-mail.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar boleto.');
    } finally {
      setEnviandoBoletoId(null);
    }
  };

  const handleGerarBoleto = async (pagamento) => {
    if (gerandoBoletoId) return;
    setGerandoBoletoId(pagamento.id);
    try {
      await pagamentosService.gerarBoleto(pagamento.id);
      toast.success('Boleto gerado com sucesso.');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao gerar boleto.');
    } finally {
      setGerandoBoletoId(null);
    }
  };

  const handleVerBoleto = async (pagamento) => {
    const rawUrl = pagamento.invoice?.boleto_url;
    const boletoUrl = rawUrl && !rawUrl.includes('example.com') ? rawUrl : null;
    if (boletoUrl) {
      window.open(boletoUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const res = await pagamentosService.buscarBoletoPdf(pagamento.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      let msg = 'Erro ao abrir boleto.';
      const data = error.response?.data;
      if (data) {
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const json = JSON.parse(text);
            msg = json.message || msg;
          } catch {}
        } else if (typeof data === 'object' && data.message) {
          msg = Array.isArray(data.message) ? data.message[0] : data.message;
        }
      }
      toast.error(msg);
    }
  };

  const formatarValor = (v) => {
    if (v == null || v === undefined) return '-';
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('pt-BR');
    } catch {
      return d;
    }
  };

  const getStatusLabel = (s) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === s);
    return opt?.label || s || '-';
  };

  const getStatusColor = (s) => {
    if (s === 'paid') return { color: '#22c55e' };
    if (s === 'overdue') return { color: '#ef4444' };
    if (s === 'cancelled') return { color: '#94a3b8' };
    return {};
  };

  const pagamentosComPendencia = pagamentos.filter((p) => p.status === 'pending' || p.status === 'overdue');
  const alunosComMaisDeUmaPendencia = [...new Set(pagamentosComPendencia.map((p) => p.student_id))]
    .filter((studentId) => pagamentosComPendencia.filter((p) => p.student_id === studentId).length > 1);

  const pagamentosPorStatus = filtroStatus === 'paid'
    ? pagamentos.filter((p) => p.status === 'paid')
    : filtroStatus === 'pending'
      ? pagamentos.filter((p) => p.status !== 'paid')
      : filtroStatus === 'overdue'
        ? pagamentosComPendencia.filter((p) => alunosComMaisDeUmaPendencia.includes(p.student_id))
        : pagamentos;

  const termoPesquisa = pesquisa.trim().toLowerCase();
  const pagamentosFiltrados = termoPesquisa
    ? pagamentosPorStatus.filter((p) => {
        const alunoNome = (p.student?.name || `Aluno #${p.student_id}`).toLowerCase();
        return alunoNome.includes(termoPesquisa);
      })
    : pagamentosPorStatus;

  return (
    <div className="page">
      <PageHeader
        title="Financeiro"
        description="Boletos, mensalidades e controle de pagamentos."
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isSchool && (
            <button
              type="button"
              className={mpConnected ? 'btn-secondary' : 'btn-primary'}
              onClick={handleConectarMercadoPago}
              disabled={mpConnecting}
            >
              {mpConnecting ? 'Redirecionando...' : mpConnected ? 'Reconectar Mercado Pago' : 'Conectar Mercado Pago'}
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => setModalCriar(true)}
            disabled={isSchool && !mpConnected}
          >
            + Criar pagamento
          </button>
        </div>
      </PageHeader>

      {isSchool && !mpConnected && (
        <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', color: '#92400e' }}>
          Conecte sua conta do Mercado Pago para criar pagamentos e receber boletos/PIX. Clique em &quot;Conectar Mercado Pago&quot; acima.
        </div>
      )}

      <Card title="Pagamentos">
        {!loading && (
          <div style={{ marginBottom: '1rem' }}>
            <FormInput
              label="Pesquisa"
              id="pesquisa_pagamentos"
              type="text"
              placeholder="Buscar por nome do aluno..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ maxWidth: '220px', marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={filtroStatus === 'all' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFiltroStatus('all')}
              >
                Todos
              </button>
              <button
                type="button"
                className={filtroStatus === 'pending' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFiltroStatus('pending')}
              >
                Pendentes
              </button>
              <button
                type="button"
                className={filtroStatus === 'overdue' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFiltroStatus('overdue')}
              >
                Com pendências
              </button>
              <button
                type="button"
                className={filtroStatus === 'paid' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setFiltroStatus('paid')}
              >
                Pagos
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <DataTable
            columns={['Aluno', 'Valor', 'Vencimento', 'Status', 'Boleto', 'Ações']}
            data={pagamentosFiltrados}
            emptyMessage="Nenhum pagamento registrado."
            renderRow={(p) => {
              const alunoNome = p.student?.name || `Aluno #${p.student_id}`;
              const invoice = p.invoice;
              const rawUrl = invoice?.boleto_url;
              const boletoUrl = rawUrl && !rawUrl.includes('example.com') ? rawUrl : null;
              const temBoleto = invoice && (boletoUrl || invoice.barcode);

              return (
                <tr key={p.id}>
                  <td>{alunoNome}</td>
                  <td>{formatarValor(p.amount)}</td>
                  <td>{formatarData(p.due_date)}</td>
                  <td style={getStatusColor(p.status)}>{getStatusLabel(p.status)}</td>
                  <td>
                    {temBoleto ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleVerBoleto(p)}
                      >
                        Ver boleto
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleGerarBoleto(p)}
                        disabled={gerandoBoletoId === p.id}
                      >
                        {gerandoBoletoId === p.id ? 'Gerando...' : 'Gerar'}
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleEnviarBoleto(p)}
                        disabled={enviandoBoletoId === p.id}
                      >
                        {enviandoBoletoId === p.id ? 'Enviando...' : 'Enviar boleto'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => {
                          setModalStatus(p);
                          setStatusForm(p.status || 'pending');
                        }}
                      >
                        Atualizar status
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => setPagamentoExcluir(p)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        )}
      </Card>

      <FormModal
        open={modalCriar}
        title="Criar novo pagamento"
        onClose={() => setModalCriar(false)}
      >
        <PagamentoForm alunos={alunos} onSuccess={handleCriarSuccess} />
      </FormModal>

      <ConfirmModal
        open={!!pagamentoExcluir}
        title="Excluir pagamento"
        message="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={handleExcluirPagamento}
        onCancel={() => setPagamentoExcluir(null)}
      />

      <FormModal
        open={!!modalStatus}
        title="Atualizar status do pagamento"
        onClose={() => setModalStatus(null)}
      >
        <div className="form-grid">
          <SelectField
            label="Status"
            id="status_select"
            value={statusForm}
            onChange={(e) => setStatusForm(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-primary" onClick={handleAtualizarStatus}>
            Salvar
          </button>
        </div>
      </FormModal>
    </div>
  );
}
