import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatSocket } from '../../hooks/useChatSocket'
import { communicationService } from '../../services/communication.service'
import { Spinner, ConfirmModal } from '../ui'
import toast from 'react-hot-toast'

function formatarHora(data) {
  if (!data) return ''
  return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function ChatView({
  conversationId,
  conversation,
  onClose,
  onConversationClosed,
  isStudent,
  isTeacher,
  }) {
  const viewerType = isTeacher ? 'teacher' : isStudent ? 'student' : 'school'
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [inputText, setInputText] = useState('')
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closing, setClosing] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const loadingOlderRef = useRef(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      if (!conversationId) return
      if (pageNum === 1) setLoading(true)
      else {
        loadingOlderRef.current = true
        setLoadingOlder(true)
      }
      try {
        const getMsg =
          viewerType === 'student'
            ? () => communicationService.mensagensConversa(conversationId, pageNum, 30)
            : viewerType === 'teacher'
              ? () => communicationService.mensagensConversaProfessor(conversationId, pageNum, 30)
              : () => communicationService.mensagensConversaEscola(conversationId, pageNum, 30)
        const res = await getMsg()
        const newMessages = res.data || []
        if (append) {
          setMessages((prev) => [...newMessages, ...prev])
        } else {
          setMessages(newMessages)
          if (pageNum === 1) window.dispatchEvent(new CustomEvent('communication:conversation-read'))
        }
        setHasMore(res.totalPages > pageNum)
      } catch {
        toast.error('Erro ao carregar mensagens.')
      } finally {
        setLoading(false)
        loadingOlderRef.current = false
        setLoadingOlder(false)
      }
    },
    [conversationId, viewerType],
  )

  const handleNewMessage = useCallback(
    (msg) => {
      if (!msg || !conversationId) return
      if (msg.sender_type === viewerType) return
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      setTimeout(scrollToBottom, 100)
    },
    [conversationId, viewerType],
  )

  const handleConversationClosed = useCallback(
    (id) => {
      if (id === conversationId && onConversationClosed) onConversationClosed()
    },
    [conversationId, onConversationClosed],
  )

  useChatSocket(conversationId, handleNewMessage, handleConversationClosed)

  useEffect(() => {
    if (conversationId) {
      setPage(1)
      loadMessages(1)
    }
  }, [conversationId, loadMessages])

  useEffect(() => {
    if (!loading && messages.length) scrollToBottom()
  }, [loading, messages.length])

  const handleScroll = () => {
    const el = messagesContainerRef.current
    if (!el || loadingOlderRef.current || !hasMore) return
    if (el.scrollTop < 80) {
      setPage((p) => {
        const next = p + 1
        loadMessages(next, true)
        return next
      })
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const text = inputText.trim()
    if (!text || sending || conversation?.status === 'closed') return
    setSending(true)
    try {
      const send =
        viewerType === 'student'
          ? () => communicationService.enviarMensagem(conversationId, text)
          : viewerType === 'teacher'
            ? () => communicationService.enviarMensagemProfessor(conversationId, text)
            : () => communicationService.enviarMensagemEscola(conversationId, text)
      const saved = await send()
      setMessages((prev) => [...prev, saved])
      setInputText('')
      scrollToBottom()
    } catch {
      toast.error('Erro ao enviar.')
    } finally {
      setSending(false)
    }
  }

  const handleCloseConversation = async () => {
    setClosing(true)
    try {
      const close =
        viewerType === 'student'
          ? () => communicationService.encerrarConversa(conversationId)
          : viewerType === 'teacher'
            ? () => communicationService.encerrarConversaProfessor(conversationId)
            : () => communicationService.encerrarConversaEscola(conversationId)
      await close()
      setShowCloseModal(false)
      onConversationClosed?.()
    } catch {
      toast.error('Erro ao encerrar.')
    } finally {
      setClosing(false)
    }
  }

  const isOwnMessage = (msg) => msg.sender_type === viewerType

  if (!conversationId) return null

  return (
    <div className="chat-view">
      <div className="chat-view-header">
        <button type="button" className="chat-back" onClick={onClose}>
          Voltar
        </button>
        <div className="chat-view-title">
          {conversation?.student_name || conversation?.subject || 'Conversa'}
        </div>
        {conversation?.status !== 'closed' && (
          <button
            type="button"
            className="chat-close-btn"
            onClick={() => setShowCloseModal(true)}
          >
            Encerrar conversa
          </button>
        )}
      </div>

      <div
        className="chat-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loadingOlder && (
          <div className="chat-loading-older">
            <Spinner />
          </div>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${isOwnMessage(msg) ? 'chat-message-own' : 'chat-message-other'}`}
              >
                <div className="chat-message-bubble">
                  <p>{msg.message}</p>
                  <small>{formatarHora(msg.created_at)}</small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {conversation?.status === 'closed' ? (
        <div className="chat-closed-notice">Conversa encerrada</div>
      ) : (
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={sending}
          />
          <button type="submit" className="btn-primary" disabled={sending || !inputText.trim()}>
            Enviar
          </button>
        </form>
      )}

      <ConfirmModal
        open={showCloseModal}
        title="Encerrar conversa"
        message="Tem certeza que deseja encerrar essa conversa?"
        onConfirm={handleCloseConversation}
        onCancel={() => setShowCloseModal(false)}
        confirmLabel={closing ? 'Encerrando...' : 'Encerrar'}
        danger
        loading={closing}
      />
    </div>
  )
}
