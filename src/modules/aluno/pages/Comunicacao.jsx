import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, Spinner, FormInput } from '../../../components/ui'
import { alunosService } from '../../../services/alunos.service'
import { communicationService } from '../../../services/communication.service'
import { ChatView } from '../../../components/chat/ChatView'
import { useAuthStore } from '../../../store/useAuthStore'
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
  const studentId = useAuthStore((s) => s.studentId)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('aviso')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showNovaConversa, setShowNovaConversa] = useState(false)
  const [showNovaConversaProfessor, setShowNovaConversaProfessor] = useState(false)
  const [professores, setProfessores] = useState([])
  const [professoresLoading, setProfessoresLoading] = useState(false)
  const [novaSubject, setNovaSubject] = useState('')
  const [novaMensagem, setNovaMensagem] = useState('')
  const [novaTeacherId, setNovaTeacherId] = useState('')
  const [criando, setCriando] = useState(false)
  const [modalEncerradasSecretaria, setModalEncerradasSecretaria] = useState(false)
  const [modalEncerradasProfessor, setModalEncerradasProfessor] = useState(false)

  const { data: avisoLista = [], isLoading: avisoLoading } = useQuery({
    queryKey: ['aluno', 'comunicacao-aviso', studentId],
    queryFn: async () => {
      const lista = await alunosService.minhasNotificacoes()
      alunosService.marcarNotificacoesComoLidas().catch(() => {})
      return lista || []
    },
    enabled: !!studentId,
  })

  const { data: tabCountsData, refetch: refetchTabCounts } = useQuery({
    queryKey: ['aluno', 'comunicacao-tab-counts', studentId],
    queryFn: async () => {
      const [notif, conv] = await Promise.all([
        alunosService.contarNotificacoesNaoLidas(),
        communicationService.contarNaoLidasAlunoPorTipo(),
      ])
      return { aviso: notif?.count ?? 0, secretaria: conv?.school ?? 0, professor: conv?.teacher ?? 0 }
    },
    enabled: !!studentId,
  })
  const tabCounts = tabCountsData ?? { aviso: 0, secretaria: 0, professor: 0 }

  const { data: conversasRaw, isLoading: conversasLoading, refetch: refetchConversas } = useQuery({
    queryKey: ['aluno', 'comunicacao-conversas', studentId],
    queryFn: () => communicationService.minhasConversas(),
    enabled: !!studentId && tab === 'secretaria',
  })
  const conversas = Array.isArray(conversasRaw) ? conversasRaw : []

  const { data: conversasProfessorRaw, isLoading: conversasProfessorLoading, refetch: refetchConversasProfessor } = useQuery({
    queryKey: ['aluno', 'comunicacao-conversas-professor', studentId],
    queryFn: () => communicationService.listarConversasProfessorAluno(),
    enabled: !!studentId && tab === 'professor',
  })
  const conversasProfessor = Array.isArray(conversasProfessorRaw) ? conversasProfessorRaw : []

  const conversasSecretaria = conversas.filter((c) => c.conversation_type === 'school')
  const conversasSecretariaAbertas = conversasSecretaria.filter((c) => c.status === 'open')
  const conversasSecretariaEncerradas = conversasSecretaria.filter((c) => c.status === 'closed')
  const conversasProfessorAbertas = conversasProfessor.filter((c) => c.status === 'open')
  const conversasProfessorEncerradas = conversasProfessor.filter((c) => c.status === 'closed')

  useEffect(() => {
    const onConversationRead = () => refetchTabCounts()
    const onUnreadChanged = () => refetchTabCounts()
    window.addEventListener('communication:conversation-read', onConversationRead)
    window.addEventListener('communication:unread-changed', onUnreadChanged)
    const interval = setInterval(refetchTabCounts, 60000)
    return () => {
      window.removeEventListener('communication:conversation-read', onConversationRead)
      window.removeEventListener('communication:unread-changed', onUnreadChanged)
      clearInterval(interval)
    }
  }, [refetchTabCounts])

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
        conversation_type: 'school',
        last_message: novaMensagem.trim() || null,
      }
      queryClient.invalidateQueries({ queryKey: ['aluno', 'comunicacao-conversas', studentId] })
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

  const handleAbrirNovaConversaProfessor = () => {
    setShowNovaConversaProfessor(true)
    setProfessoresLoading(true)
    alunosService
      .meusProfessores()
      .then((data) => setProfessores(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erro ao carregar professores.'))
      .finally(() => setProfessoresLoading(false))
  }

  const handleCriarConversaProfessor = async (e) => {
    e.preventDefault()
    const teacherId = parseInt(novaTeacherId, 10)
    if (!teacherId || !novaSubject.trim()) {
      toast.error('Selecione o professor e informe o assunto.')
      return
    }
    setCriando(true)
    try {
      const nova = await communicationService.criarConversaProfessorAluno({
        teacher_id: teacherId,
        subject: novaSubject.trim(),
        initial_message: novaMensagem.trim() || undefined,
      })
      const novaComPreview = {
        ...nova,
        status: 'open',
        conversation_type: 'teacher',
        last_message: novaMensagem.trim() || null,
      }
      queryClient.invalidateQueries({ queryKey: ['aluno', 'comunicacao-conversas-professor', studentId] })
      setNovaTeacherId('')
      setNovaSubject('')
      setNovaMensagem('')
      setShowNovaConversaProfessor(false)
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
            {tabCounts.aviso > 0 && (
              <span className="comunicacao-tab-badge" aria-label={`${tabCounts.aviso} não lidos`}>
                {tabCounts.aviso > 99 ? '99+' : tabCounts.aviso}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'secretaria'}
            className={`comunicacao-tab ${tab === 'secretaria' ? 'comunicacao-tab-active' : ''}`}
            onClick={() => { setTab('secretaria'); setSelectedConversation(null) }}
          >
            Secretaria
            {tabCounts.secretaria > 0 && (
              <span className="comunicacao-tab-badge" aria-label={`${tabCounts.secretaria} não lidas`}>
                {tabCounts.secretaria > 99 ? '99+' : tabCounts.secretaria}
              </span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'professor'}
            className={`comunicacao-tab ${tab === 'professor' ? 'comunicacao-tab-active' : ''}`}
            onClick={() => { setTab('professor'); setSelectedConversation(null) }}
          >
            Professor
            {tabCounts.professor > 0 && (
              <span className="comunicacao-tab-badge" aria-label={`${tabCounts.professor} não lidas`}>
                {tabCounts.professor > 99 ? '99+' : tabCounts.professor}
              </span>
            )}
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

        {tab === 'secretaria' && (
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
                ) : conversasSecretariaAbertas.length === 0 ? (
                  <div className="empty-state">Nenhuma conversa ativa.</div>
                ) : (
                  conversasSecretariaAbertas.map((c) => (
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
              <button
                type="button"
                className="btn-secondary comunicacao-btn-encerradas"
                onClick={() => setModalEncerradasSecretaria(true)}
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
                    setSelectedConversation((c) => (c ? { ...c, status: 'closed', closed_at: new Date().toISOString() } : null))
                    refetchConversas()
                    refetchTabCounts()
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

        {modalEncerradasSecretaria && (
          <div className="modal-overlay" onClick={() => setModalEncerradasSecretaria(false)}>
            <div className="modal-content comunicacao-modal-encerradas" onClick={(e) => e.stopPropagation()}>
              <h3>Conversas encerradas - Secretaria</h3>
              <div className="comunicacao-conversa-lista">
                {conversasSecretariaEncerradas.length === 0 ? (
                  <div className="empty-state">Nenhuma conversa encerrada.</div>
                ) : (
                  conversasSecretariaEncerradas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`comunicacao-conversa-item comunicacao-conversa-item-encerrada ${selectedConversation?.id === c.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedConversation(c)
                        setModalEncerradasSecretaria(false)
                      }}
                    >
                      <strong>{c.subject}</strong>
                      <small>{formatarData(c.closed_at)}</small>
                    </button>
                  ))
                )}
              </div>
              <button type="button" className="btn-secondary" onClick={() => setModalEncerradasSecretaria(false)}>
                Fechar
              </button>
            </div>
          </div>
        )}

        {tab === 'professor' && (
          <section className="comunicacao-aba comunicacao-chat">
            <div className="comunicacao-chat-sidebar">
              <button
                type="button"
                className="btn-primary"
                onClick={() => (showNovaConversaProfessor ? setShowNovaConversaProfessor(false) : handleAbrirNovaConversaProfessor())}
              >
                {showNovaConversaProfessor ? 'Cancelar' : 'Nova conversa'}
              </button>

              {showNovaConversaProfessor && (
                <form onSubmit={handleCriarConversaProfessor} className="comunicacao-form">
                  <div className="form-group">
                    <label htmlFor="professor">Professor</label>
                    <select
                      id="professor"
                      value={novaTeacherId}
                      onChange={(e) => setNovaTeacherId(e.target.value)}
                      required
                      disabled={professoresLoading}
                    >
                      <option value="">Selecione...</option>
                      {professores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormInput
                    label="Assunto"
                    id="subject-prof"
                    value={novaSubject}
                    onChange={(e) => setNovaSubject(e.target.value)}
                    required
                  />
                  <div className="form-group">
                    <label htmlFor="novaMsgProf">Primeira mensagem (opcional)</label>
                    <textarea
                      id="novaMsgProf"
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
                {conversasProfessorLoading ? (
                  <Spinner />
                ) : conversasProfessorAbertas.length === 0 ? (
                  <div className="empty-state">Nenhuma conversa ativa.</div>
                ) : (
                  conversasProfessorAbertas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`comunicacao-conversa-item ${selectedConversation?.id === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedConversation(c)}
                    >
                      <strong>{c.teacher_name || c.subject}</strong>
                      <span className="conversa-subject">{c.subject}</span>
                      {c.last_message && (
                        <span className="comunicacao-conversa-preview">{truncarTexto(c.last_message)}</span>
                      )}
                      <small>{formatarData(c.last_message_at)}</small>
                    </button>
                  ))
                )}
              </div>
              <button
                type="button"
                className="btn-secondary comunicacao-btn-encerradas"
                onClick={() => setModalEncerradasProfessor(true)}
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
                    setSelectedConversation((c) => (c ? { ...c, status: 'closed', closed_at: new Date().toISOString() } : null))
                    refetchConversasProfessor()
                    refetchTabCounts()
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

        {modalEncerradasProfessor && (
          <div className="modal-overlay" onClick={() => setModalEncerradasProfessor(false)}>
            <div className="modal-content comunicacao-modal-encerradas" onClick={(e) => e.stopPropagation()}>
              <h3>Conversas encerradas - Professor</h3>
              <div className="comunicacao-conversa-lista">
                {conversasProfessorEncerradas.length === 0 ? (
                  <div className="empty-state">Nenhuma conversa encerrada.</div>
                ) : (
                  conversasProfessorEncerradas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`comunicacao-conversa-item comunicacao-conversa-item-encerrada ${selectedConversation?.id === c.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedConversation(c)
                        setModalEncerradasProfessor(false)
                      }}
                    >
                      <strong>{c.teacher_name || c.subject}</strong>
                      <small>{formatarData(c.closed_at)}</small>
                    </button>
                  ))
                )}
              </div>
              <button type="button" className="btn-secondary" onClick={() => setModalEncerradasProfessor(false)}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
