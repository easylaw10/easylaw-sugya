import type { Conversation, Message, ApiMessage } from './types'

const STORAGE_KEY = 'easylaw-conversations'
const MAX_CONVERSATIONS = 20

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)))
  } catch {
    // QuotaExceededError — trim oldest conversations and retry
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 5)))
    } catch {
      // Still failing — clear history
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

/** Fallback title from first user message */
function fallbackTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user')
  if (!first) return 'שיחה חדשה'
  const text = first.content.trim()
  return text.length > 40 ? text.slice(0, 40) + '...' : text
}

export function getConversations(): Conversation[] {
  return load().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getConversation(id: string): Conversation | undefined {
  return load().find((c) => c.id === id)
}

/** Strip large base64 document content from apiMessages before saving to localStorage */
function stripLargeContent(msgs: ApiMessage[]): ApiMessage[] {
  return msgs.map((m) => ({
    ...m,
    content: m.content.map((block) => {
      if ('source' in block && block.source?.type === 'base64') {
        return { type: 'text' as const, text: '[קובץ שהועלה]' }
      }
      // Truncate very long text blocks (>5000 chars) to save space
      if ('text' in block && block.text.length > 5000) {
        return { ...block, text: block.text.substring(0, 5000) + '\n...[טקסט קוצר]' }
      }
      return block
    }),
  }))
}

export function saveConversation(
  id: string,
  messages: Message[],
  apiMessages: ApiMessage[],
) {
  if (messages.length === 0) return
  const all = load()
  const idx = all.findIndex((c) => c.id === id)
  const now = Date.now()
  const existingTitle = idx >= 0 ? all[idx].title : ''
  const conv: Conversation = {
    id,
    title: existingTitle || fallbackTitle(messages),
    messages,
    apiMessages: stripLargeContent(apiMessages),
    createdAt: idx >= 0 ? all[idx].createdAt : now,
    updatedAt: now,
  }
  if (idx >= 0) {
    all[idx] = conv
  } else {
    all.unshift(conv)
  }
  save(all)
}

export function updateConversationTitle(id: string, title: string) {
  // Only accept short, clean titles
  if (!title || title.length > 40) return
  const all = load()
  const conv = all.find((c) => c.id === id)
  if (conv) {
    conv.title = title
    save(all)
  }
}

export function hasAiTitle(id: string): boolean {
  const conv = load().find((c) => c.id === id)
  if (!conv) return false
  // If title matches the first user message, it's still the fallback
  const firstUser = conv.messages.find((m) => m.role === 'user')
  if (!firstUser) return false
  return !conv.title.startsWith(firstUser.content.substring(0, 20))
}

export function deleteConversation(id: string) {
  save(load().filter((c) => c.id !== id))
}
