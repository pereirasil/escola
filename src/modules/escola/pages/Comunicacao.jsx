import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, PageHeader, Spinner } from '../../../components/ui'
import { communicationService } from '../../../services/communication.service'
import { alunosService } from '../../../services/alunos.service'
import { ChatView } from '../../../components/chat/ChatView'
import toast from 'react-hot-toast'

function formatarData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleString('pt-BR')
}

export default function ComunicacaoEscola() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversas, setConversas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showNovaConversa, setShowNovaConversa] = useState(false)
  const [alunos, setAlunos] = useState([])
  const [alunosLoading, setAlunosLoading] = useState(false)
  const [novaStudentId, setNovaStudentId] = useState('')
  const [novaSubject, setNovaSubject] = useState('')
  const [novaMensagem, setNovaMensagem] = useState('')
  const [criando, setCriando] = useState(false)
  const [modalEncerradas, setModalEncerradas] = useState(false)

  const conversasAbertas = conversas.filter((c) => c.status === 'open')
  const conversasEncerradas = conversas.filter((c) => c.status === 'closed')

  const carregarConversas = () => {
    setLoading(true)
    communicationService
      .listarConversas()
      .then((data) => setConversas(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erro ao carregar conversas.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    carregarConversas()
  }, [])

  useEffect(() => {
    const conv = searchParams.get('conversation')
    if (!conv || loading) return
    const pendingId = parseInt(conv, 10)
    if (Number.isNaN(pendingId)) return
    const c = conversas.find((x) => x.id === pendingId)
    if (c) setSelectedConversation(c)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('conversation')
        return next
      },
      { replace: true },
    )
  }, [searchParams, loading, conversas, setSearchParams])

  const handleAbrirNovaConversa = () => {
    setShowNovaConversa(true)
    setAlunosLoading(true)
    alunosService
      .listar()
      .then((r) => {
        const data = r?.data ?? r
        const arr = Array.isArray(data) ? data : (data?.data ?? [])
        setAlunos(Array.isArray(arr) ? arr : [])
      })
      .catch(() => toast.error('Erro ao carregar alunos.'))
      .finally(() => setAlunosLoading(false))
  }

  const handleCriarConversa = async (e) => {
    e.preventDefault()
    const studentId = parseInt(novaStudentId, 10)
    if (!studentId || !novaSubject.trim()) {
      toast.error('Selecione o aluno e informe o assunto.')
      return
    }
    setCriando(true)
    try {
      const nova = await communicationService.criarConversaEscola({
        student_id: studentId,
        subject: novaSubject.trim(),
        initial_message: novaMensagem.trim() || undefined,
      })
      setConversas((prev) => [nova, ...prev])
      setNovaStudentId('')
      setNovaSubject('')
      setNovaMensagem('')
      setShowNovaConversa(false)
      setSelectedConversation(nova)
    } catch {
      toast.error('Erro ao criar conversa.')
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="page">
      <PageHeader title="Comunicação" description="Conversas com os alunos" />
      <Card>
        <div className="comunicacao-chat comunicacao-escola">
          <div className="comunicacao-chat-sidebar">
            <button
              type="button"
              className="btn-primary"
              onClick={() => (showNovaConversa ? setShowNovaConversa(false) : handleAbrirNovaConversa())}
            >
              {showNovaConversa ? 'Cancelar' : 'Nova conversa'}
            </button>

            {showNovaConversa && (
              <form onSubmit={handleCriarConversa} className="comunicacao-form">
                <div className="form-group">
                  <label htmlFor="aluno">Aluno</label>
                  <select
                    id="aluno"
                    value={novaStudentId}
                    onChange={(e) => setNovaStudentId(e.target.value)}
                    required
                    disabled={alunosLoading}
                  >
                    <option value="">Selecione...</option>
                    {alunos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Assunto</label>
                  <input
                    id="subject"
                    value={novaSubject}
                    onChange={(e) => setNovaSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="msg">Primeira mensagem (opcional)</label>
                  <textarea
                    id="msg"
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
              {loading ? (
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
                    <strong>{c.student_name || c.subject}</strong>
                    <span className="conversa-subject">{c.subject}</span>
                    <small>{formatarData(c.last_message_at)}</small>
                  </button>
                ))
              )}
            </div>
            <button
              type="button"
              className="btn-secondary comunicacao-btn-encerradas"
              onClick={() => setModalEncerradas(true)}
            >
              Ver conversas encerradas
            </button>
          </div>
          <div className="comunicacao-chat-main">
            {selectedConversation ? (
              <ChatView
                conversationId={selectedConversation.id}
                conversation={selectedConversation}
                onClose={() => setSelectedConversation(null)}
                onConversationClosed={() => {
                  setSelectedConversation((c) => (c ? { ...c, status: 'closed' } : null))
                  carregarConversas()
                }}
                isStudent={false}
              />
            ) : (
              <div className="chat-placeholder">
                Selecione uma conversa ou inicie uma nova.
              </div>
            )}
          </div>
        </div>
      </Card>

      {modalEncerradas && (
        <div className="modal-overlay" onClick={() => setModalEncerradas(false)}>
          <div className="modal-content comunicacao-modal-encerradas" onClick={(e) => e.stopPropagation()}>
            <h3>Conversas encerradas</h3>
            <div className="comunicacao-conversa-lista">
              {conversasEncerradas.length === 0 ? (
                <div className="empty-state">Nenhuma conversa encerrada.</div>
              ) : (
                conversasEncerradas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`comunicacao-conversa-item comunicacao-conversa-item-encerrada ${selectedConversation?.id === c.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedConversation(c)
                      setModalEncerradas(false)
                    }}
                  >
                    <strong>{c.student_name || c.subject}</strong>
                    <span className="conversa-subject">{c.subject}</span>
                    <small>{formatarData(c.closed_at)}</small>
                  </button>
                ))
              )}
            </div>
            <button type="button" className="btn-secondary" onClick={() => setModalEncerradas(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
