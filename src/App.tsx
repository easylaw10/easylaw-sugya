import { useState, useRef, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import Header from './components/Header'
import WelcomeScreen from './components/WelcomeScreen'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import TypingIndicator from './components/TypingIndicator'
import LimitReached from './components/LimitReached'
import HistoryDrawer from './components/HistoryDrawer'
import { sendMessageStream, buildUserContent, generateTitle } from './api'
import { getMessageCount, incrementMessageCount } from './session'
import { getConversations, getConversation, saveConversation, deleteConversation, updateConversationTitle, hasAiTitle } from './chatHistory'
import { MAX_MESSAGES } from './constants'
import type { Message, ApiMessage, Conversation, FileAttachment } from './types'

export default function App() {
  const [conversationId, setConversationId] = useState<string>(uuid())
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [limitReached, setLimitReached] = useState(() => getMessageCount() >= MAX_MESSAGES)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>(() => getConversations())

  const chatRef = useRef<HTMLDivElement>(null)
  const apiMessages = useRef<ApiMessage[]>([])

  const refreshHistory = useCallback(() => {
    setConversations(getConversations())
  }, [])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }, 50)
  }, [])

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages, loading, streaming, scrollToBottom])

  // Save conversation to localStorage whenever messages change (after streaming ends)
  useEffect(() => {
    if (messages.length > 0 && !streaming && !loading) {
      saveConversation(conversationId, messages, apiMessages.current)
      refreshHistory()
    }
  }, [messages, streaming, loading, conversationId, refreshHistory])

  const handleSend = async (text: string, file?: FileAttachment) => {
    if (limitReached) return

    const count = getMessageCount()
    if (count >= MAX_MESSAGES) {
      setLimitReached(true)
      return
    }

    const userMsg: Message = {
      id: uuid(),
      role: 'user',
      content: text,
      file: file ? { name: file.name, type: file.type } : undefined,
    }
    setMessages((prev) => [...prev, userMsg])

    const apiContent = buildUserContent(text, file)
    apiMessages.current.push({ role: 'user', content: apiContent })
    incrementMessageCount()

    const assistantId = uuid()
    setLoading(true)

    try {
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])
      setLoading(false)
      setStreaming(true)

      const fullText = await sendMessageStream(
        apiMessages.current,
        (textSoFar) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: textSoFar } : m
            )
          )
        },
      )

      apiMessages.current.push({
        role: 'assistant',
        content: [{ type: 'text', text: fullText }],
      })

      // Generate AI title after first exchange, or retry on second if first failed
      const msgCount = apiMessages.current.length
      if (msgCount === 2 || (msgCount === 4 && !hasAiTitle(conversationId))) {
        generateTitle(text, fullText).then((title) => {
          if (title) {
            updateConversationTitle(conversationId, title)
            refreshHistory()
          }
        })
      }
    } catch (err) {
      // Keep user message in apiMessages (it's valid, only the response failed).
      // Remove the empty assistant placeholder from UI and show error as a new message.
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistantId),
        { id: assistantId, role: 'assistant' as const, content: 'סליחה, משהו השתבש. נסו שוב בבקשה.' },
      ])
      console.error(err)
    }
    setLoading(false)
    setStreaming(false)

    if (getMessageCount() >= MAX_MESSAGES) {
      setLimitReached(true)
    }
  }

  const handleNewChat = () => {
    setConversationId(uuid())
    setMessages([])
    apiMessages.current = []
    setLoading(false)
    setStreaming(false)
  }

  const handleSelectConversation = (id: string) => {
    const conv = getConversation(id)
    if (!conv) return
    setConversationId(conv.id)
    setMessages(conv.messages)
    apiMessages.current = conv.apiMessages
    setLoading(false)
    setStreaming(false)
  }

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id)
    refreshHistory()
    // If deleting the active conversation, start a new one
    if (id === conversationId) {
      handleNewChat()
    }
  }

  const showWelcome = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-white">
      <Header
        onNewChat={handleNewChat}
        onToggleHistory={() => setHistoryOpen(true)}
        hasHistory={conversations.length > 0}
      />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onNewChat={handleNewChat}
      />

      <div ref={chatRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          {showWelcome ? (
            <WelcomeScreen onSelect={(msg) => handleSend(msg)} />
          ) : (
            <div className="px-4 sm:px-6 py-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {loading && <TypingIndicator />}
              {limitReached && <LimitReached />}
            </div>
          )}
        </div>
      </div>

      {!limitReached && (
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput onSend={handleSend} disabled={loading || streaming} />
        </div>
      )}
    </div>
  )
}
