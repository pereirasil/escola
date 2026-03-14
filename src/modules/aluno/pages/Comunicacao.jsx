import { useState, useEffect } from 'react'
import { Card, Spinner, FormInput } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import { communicationService } from '../../../services/communication.service'
import { ChatView } from '../../../components/chat/ChatView'
import toast from 'react-hot-toast'

function formatarData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleString('pt-BR')
}

function truncarTexto(texto, maxLen = 60) {
  if (!texto) return ''
  return texto.length > maxLen ? texto.slice(0, maxLen) + '...' : texto
}

export default function Comunicacao() {
  const [tab, setTab] = useState('aviso')
  const [avisoLista, setAvisoLista] = useState([])
  const [avisoLoading, setAvisoLoading] = useState(true)
  const [conversas, setConversas] = useState([])
  const [conversasLoading, setConversasLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showNovaConversa, setShowNovaConversa] = useState(false)
  const [novaSubject, setNovaSubject] = useState('')
  const [novaMensagem, setNovaMensagem] = useState('')
  const [criando, setCriando] = useState(false)

  const conversasAbertas = conversas.filter((c) => c.status === 'open')
  const conversasEncerradas = conversas.filter((c) => c.status === 'closed')

  const carregarAvisos = () => {
    setAvisoLoading(true)
    alunosService
      .minhasNotificacoes()
      .then(setAvisoLista)
      .catch(() => toast.error('Erro ao carregar avisos.'))
      .finally(() => setAvisoLoading(false))
    alunosService.marcarNotificacoesComoLidas().catch(() => {})
  }

  const carregarConversas = () => {
    setConversasLoading(true)
    communicationService
      .minhasConversas()
      .then((data) => setConversas(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erro ao carregar conversas.'))
      .finally(() => setConversasLoading(false))
  }

  useEffect(() => {
    carregarAvisos()
  }, [])

  useEffect(() => {
    if (tab === 'conversa' || tab === 'historico') carregarConversas()
  }, [tab])

  const handleCriarConversa = async (e) => {
    e.preventDefault()
    if (!novaSubject.trim()) {
      toast.error('Informe o assunto.')
      return
    }
    setCriando(true)
    try {
      const nova = await communicationService.criarConversa({
        subject: novaSubject.trim(),
        initial_message: novaMensagem.trim() || undefined,
      })
      const novaComPreview = {
        ...nova,
        status: 'open',
        last_message: novaMensagem.trim() || null,
      }
      setConversas((prev) => [novaComPreview, ...prev])
      setNovaSubject('')
      setNovaMensagem('')
      setShowNovaConversa(false)
      setSelectedConversation(novaComPreview)
    } catch {
      toast.error('Erro ao criar conversa.')
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="page">
      <Card title="Central de Comunicação">
        <nav className="comunicacao-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'aviso'}
            className={`comunicacao-tab ${tab === 'aviso' ? 'comunicacao-tab-active' : ''}`}
            onClick={() => { setTab('aviso'); setSelectedConversation(null) }}
          >
            Avisos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'conversa'}
            className={`comunicacao-tab ${tab === 'conversa' ? 'comunicacao-tab-active' : ''}`}
            onClick={() => { setTab('conversa'); setSelectedConversation(null) }}
          >
            Conversas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'historico'}
            className={`comunicacao-tab ${tab === 'historico' ? 'comunicacao-tab-active' : ''}`}
            onClick={() => { setTab('historico'); setSelectedConversation(null) }}
          >
            Histórico
          </button>
        </nav>

        {tab === 'aviso' && (
          <section className="comunicacao-aba">
            {avisoLoading ? (
              <Spinner />
            ) : avisoLista.length === 0 ? (
              <div className="empty-state">Nenhum aviso.</div>
            ) : (
              <ul className="comunicacao-aviso-lista">
                {avisoLista.map((n) => (
                  <li
                    key={n.id}
                    className={`comunicacao-aviso-item ${!n.read_at ? 'comunicacao-aviso-item-unread' : ''}`}
                  >
                    <strong>{n.title}</strong>
                    {n.message && <p>{n.message}</p>}
                    <small>{formatarData(n.created_at)}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'conversa' && (
          <section className="comunicacao-aba comunicacao-chat">
            <div className="comunicacao-chat-sidebar">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowNovaConversa(!showNovaConversa)}
              >
                {showNovaConversa ? 'Cancelar' : 'Nova conversa'}
              </button>

              {showNovaConversa && (
                <form onSubmit={handleCriarConversa} className="comunicacao-form">
                  <FormInput
                    label="Assunto"
                    id="subject"
                    value={novaSubject}
                    onChange={(e) => setNovaSubject(e.target.value)}
                    required
                  />
                  <div className="form-group">
                    <label htmlFor="novaMsg">Primeira mensagem (opcional)</label>
                    <textarea
                      id="novaMsg"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={criando}>
                    {criando ? 'Criando...' : 'Iniciar conversa'}
                  </button>
                </form>
              )}

              <h4 className="comunicacao-lista-titulo">Conversas ativas</h4>
              <div className="comunicacao-conversa-lista">
                {conversasLoading ? (
                  <Spinner />
                ) : conversasAbertas.length === 0 ? (
                  <div className="empty-state">Nenhuma conversa ativa.</div>
                ) : (
                  conversasAbertas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`comunicacao-conversa-item ${selectedConversation?.id === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedConversation(c)}
                    >
                      <strong>{c.subject}</strong>
                      {c.last_message && (
                        <span className="comunicacao-conversa-preview">{truncarTexto(c.last_message)}</span>
                      )}
                      <small>{formatarData(c.last_message_at)}</small>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="comunicacao-chat-main">
              {selectedConversation ? (
                <ChatView
                  conversationId={selectedConversation.id}
                  conversation={selectedConversation}
                  onClose={() => setSelectedConversation(null)}
                  onConversationClosed={() => {
                    setSelectedConversation((c) => (c ? { ...c, status: 'closed', closed_at: new Date().toISOString() } : null))
                    carregarConversas()
                  }}
                  isStudent
                />
              ) : (
                <div className="chat-placeholder">
                  Selecione uma conversa ou inicie uma nova.
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'historico' && (
          <section className="comunicacao-aba comunicacao-chat">
            <div className="comunicacao-chat-sidebar">
              <h4 className="comunicacao-lista-titulo">Conversas encerradas</h4>
              <div className="comunicacao-conversa-lista">
                {conversasLoading ? (
                  <Spinner />
                ) : conversasEncerradas.length === 0 ? (
                  <div className="empty-state">Nenhuma conversa encerrada.</div>
                ) : (
                  conversasEncerradas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`comunicacao-conversa-item comunicacao-conversa-item-encerrada ${selectedConversation?.id === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedConversation(c)}
                    >
                      <strong>{c.subject}</strong>
                      <small>{formatarData(c.closed_at)}</small>
                      <span className="comunicacao-status-encerrada">Encerrada</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="comunicacao-chat-main">
              {selectedConversation ? (
                <ChatView
                  conversationId={selectedConversation.id}
                  conversation={selectedConversation}
                  onClose={() => setSelectedConversation(null)}
                  onConversationClosed={() => {}}
                  isStudent
                />
              ) : (
                <div className="chat-placeholder">
                  Selecione uma conversa para visualizar o histórico.
                </div>
              )}
            </div>
          </section>
        )}
      </Card>
    </div>
  )
}
