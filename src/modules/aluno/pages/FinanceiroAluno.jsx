import { useState, useEffect, useCallback } from 'react'
import { Card, Spinner } from '../../../components/ui'
import { pagamentosService } from '../../../services/pagamentos.service'
import { useAuthStore } from '../../../store/useAuthStore'
import toast from 'react-hot-toast'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const STATUS_LABEL = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Vencido',
}

const STATUS_ROW_CLASS = {
  paid: 'financeiro-row-pago',
  pending: 'financeiro-row-pendente',
  overdue: 'financeiro-row-vencido',
}

function formatarData(str) {
  if (!str) return '-'
  const [y, m, d] = String(str).slice(0, 10).split('-')
  if (!d || !m || !y) return str
  return `${d}/${m}/${y}`
}

function formatarValor(val) {
  if (val == null) return '-'
  const n = typeof val === 'string' ? parseFloat(String(val).replace(',', '.')) : Number(val)
  if (Number.isNaN(n)) return '-'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function FinanceiroAluno() {
  const { user } = useAuthStore()
  const [pagamentos, setPagamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalPagar, setModalPagar] = useState(null)
  const [opcaoModal, setOpcaoModal] = useState(null)
  const [gerandoBoleto, setGerandoBoleto] = useState(false)
  const [gerandoPix, setGerandoPix] = useState(false)
  const [boletoGerado, setBoletoGerado] = useState(null)
  const [pixGerado, setPixGerado] = useState(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await pagamentosService.listar()
      const lista = Array.isArray(res?.data) ? res.data : []
      const filtrados = user?.id ? lista.filter((p) => p.student_id === user.id) : lista
      setPagamentos(filtrados)
    } catch {
      toast.error('Erro ao carregar pagamentos.')
      setPagamentos([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    if (!modalPagar || (!boletoGerado && !pixGerado)) return
    const interval = setInterval(async () => {
      try {
        const res = await pagamentosService.buscarPorId(modalPagar.id)
        const p = res?.data ?? res
        if (p?.status === 'paid') {
          toast.success('Pagamento confirmado!')
          fecharModal()
          carregar()
        }
      } catch {
        // ignora erros de polling
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [modalPagar, boletoGerado, pixGerado, carregar])

  const anoAtual = new Date().getFullYear()
  const pagamentosPorMes = {}
  pagamentos.forEach((p) => {
    const due = p.due_date ? String(p.due_date).slice(0, 7) : ''
    if (due) {
      const [y, m] = due.split('-')
      const mes = parseInt(m, 10)
      if (parseInt(y, 10) === anoAtual && mes >= 1 && mes <= 12) {
        pagamentosPorMes[mes] = p
      }
    }
  })

  const totalPago = pagamentos
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
  const totalAberto = pagamentos
    .filter((p) => p.status !== 'paid')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
  const proximos = pagamentos
    .filter((p) => p.status !== 'paid' && p.due_date)
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
  const proximoVencimento = proximos[0]

  const abrirModalPagar = (pagamento) => {
    setModalPagar(pagamento)
    setOpcaoModal(null)
    setBoletoGerado(null)
    setPixGerado(null)
  }

  const fecharModal = () => {
    setModalPagar(null)
    setOpcaoModal(null)
    setBoletoGerado(null)
    setPixGerado(null)
  }

  const handleGerarBoleto = async () => {
    if (!modalPagar || gerandoBoleto) return
    setGerandoBoleto(true)
    try {
      const res = await pagamentosService.gerarBoleto(modalPagar.id)
      const updated = res?.data ?? res
      setBoletoGerado({
        boleto_url: updated?.invoice?.boleto_url,
        linha_digitavel: updated?.invoice?.linha_digitavel,
      })
      toast.success('Boleto gerado.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao gerar boleto.')
    } finally {
      setGerandoBoleto(false)
    }
  }

  const handleGerarPix = async () => {
    if (!modalPagar || gerandoPix) return
    setGerandoPix(true)
    try {
      const res = await pagamentosService.gerarPix(modalPagar.id)
      const data = res?.data ?? res
      setPixGerado({
        qr_code: data.qr_code,
        qr_code_text: data.qr_code_text,
      })
      toast.success('PIX gerado.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao gerar PIX.')
    } finally {
      setGerandoPix(false)
    }
  }

  const copiarLinha = async () => {
    const txt = boletoGerado?.linha_digitavel
    if (!txt) return
    try {
      await navigator.clipboard.writeText(txt)
      toast.success('Linha digitável copiada.')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const copiarPix = async () => {
    const txt = pixGerado?.qr_code_text
    if (!txt) return
    try {
      await navigator.clipboard.writeText(txt)
      toast.success('Código PIX copiado.')
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const abrirBoleto = () => {
    const url = boletoGerado?.boleto_url || modalPagar?.invoice?.boleto_url
    if (url) window.open(url, '_blank')
    else toast.error('Link do boleto não disponível.')
  }

  const baixarPdf = async (pagamento) => {
    const p = pagamento || modalPagar
    if (!p) return
    try {
      const res = await pagamentosService.buscarBoletoPdf(p.id)
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `boleto-${p.id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF baixado.')
    } catch {
      toast.error('Erro ao baixar PDF.')
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page financeiro-aluno">
      <h1 className="page-title">Financeiro</h1>

      <div className="financeiro-resumo">
        <div className="financeiro-resumo-card financeiro-resumo-pago">
          <span className="financeiro-resumo-label">Total Pago</span>
          <span className="financeiro-resumo-valor">{formatarValor(totalPago)}</span>
        </div>
        <div className="financeiro-resumo-card financeiro-resumo-aberto">
          <span className="financeiro-resumo-label">Total em Aberto</span>
          <span className="financeiro-resumo-valor">{formatarValor(totalAberto)}</span>
        </div>
        <div className="financeiro-resumo-card financeiro-resumo-proximo">
          <span className="financeiro-resumo-label">Próximo Vencimento</span>
          <span className="financeiro-resumo-valor">
            {proximoVencimento ? formatarData(proximoVencimento.due_date) : '-'}
          </span>
        </div>
      </div>

      <Card title={`Mensalidades ${anoAtual}`}>
        <div className="financeiro-table-wrap">
          <table className="financeiro-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => {
                const p = pagamentosPorMes[mes]
                const status = p?.status === 'paid' ? 'paid' : (p?.status === 'overdue' ? 'overdue' : 'pending')
                const rowClass = STATUS_ROW_CLASS[status] || ''
                return (
                  <tr key={mes} className={rowClass}>
                    <td>{MESES[mes - 1]}</td>
                    <td>{p ? formatarData(p.due_date) : '-'}</td>
                    <td>{p ? formatarValor(p.amount) : '-'}</td>
                    <td>{p ? (STATUS_LABEL[status] || p.status) : '-'}</td>
                    <td>
                      {p && p.status === 'paid' && (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => baixarPdf(p)}
                        >
                          Ver recibo
                        </button>
                      )}
                      {p && p.status !== 'paid' && (
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          onClick={() => abrirModalPagar(p)}
                        >
                          Pagar
                        </button>
                      )}
                      {!p && '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {modalPagar && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content financeiro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pagar mensalidade</h3>
              <button type="button" className="modal-close" onClick={fecharModal} aria-label="Fechar">&times;</button>
            </div>
            <div className="modal-body">
              {!opcaoModal ? (
                <div className="financeiro-modal-opcoes">
                  <button
                    type="button"
                    className="financeiro-opcao-btn"
                    onClick={() => setOpcaoModal('boleto')}
                  >
                    Gerar Boleto
                  </button>
                  <button
                    type="button"
                    className="financeiro-opcao-btn"
                    onClick={() => setOpcaoModal('pix')}
                  >
                    Gerar PIX
                  </button>
                </div>
              ) : opcaoModal === 'boleto' ? (
                <div className="financeiro-modal-boleto">
                  {!boletoGerado && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleGerarBoleto}
                      disabled={gerandoBoleto}
                    >
                      {gerandoBoleto ? 'Gerando...' : 'Gerar Boleto'}
                    </button>
                  )}
                  {boletoGerado && (
                    <div className="financeiro-boleto-acoes">
                      <button type="button" className="btn-primary" onClick={abrirBoleto}>
                        Abrir boleto
                      </button>
                      <button type="button" className="btn-secondary" onClick={copiarLinha}>
                        Copiar linha digitável
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => baixarPdf(modalPagar)}>
                        Baixar PDF
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="financeiro-modal-pix">
                  {!pixGerado && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleGerarPix}
                      disabled={gerandoPix}
                    >
                      {gerandoPix ? 'Gerando...' : 'Gerar PIX'}
                    </button>
                  )}
                  {pixGerado && (
                    <div className="financeiro-pix-acoes">
                      {pixGerado.qr_code && (
                        <div className="financeiro-pix-qr">
                          <img
                            src={`data:image/png;base64,${pixGerado.qr_code}`}
                            alt="QR Code PIX"
                            width={200}
                            height={200}
                          />
                        </div>
                      )}
                      {!pixGerado.qr_code && pixGerado.qr_code_text && (
                        <p className="financeiro-pix-copia">Use o código PIX abaixo para pagar.</p>
                      )}
                      <button type="button" className="btn-primary" onClick={copiarPix}>
                        Copiar código PIX
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                className="btn-secondary financeiro-voltar"
                onClick={() => { setOpcaoModal(null); setBoletoGerado(null); setPixGerado(null); }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
