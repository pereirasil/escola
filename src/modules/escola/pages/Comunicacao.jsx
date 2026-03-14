import { useState, useEffect } from 'react'
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

            <div className="comunicacao-conversa-lista">
              {loading ? (
                <Spinner />
              ) : conversas.length === 0 ? (
                <div className="empty-state">Nenhuma conversa.</div>
              ) : (
                conversas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`comunicacao-conversa-item ${selectedConversation?.id === c.id ? 'active' : ''} ${c.status === 'closed' ? 'closed' : ''}`}
                    onClick={() => setSelectedConversation(c)}
                  >
                    <strong>{c.student_name || c.subject}</strong>
                    <span className="conversa-subject">{c.subject}</span>
                    <small>{c.status === 'closed' ? 'Encerrada' : formatarData(c.last_message_at)}</small>
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
    </div>
  )
}
