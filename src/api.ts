import type { ApiMessage, FileAttachment } from './types'

const CHAT_URL = 'https://gtllahbwtojfvuxefwcx.supabase.co/functions/v1/chat'

/**
 * Send messages to the Supabase Edge Function and parse the SSE stream.
 * Calls onChunk with each text delta for live streaming in the UI.
 */
/** Map SSE tool events to Hebrew status labels */
function toolLabel(name: string): string {
  if (name.includes('search_court') || name.includes('law')) return 'מחפש פסיקה...'
  if (name.includes('legislation') || name.includes('section')) return 'מחפש חקיקה...'
  if (name.includes('web_search')) return 'מחפש באינטרנט...'
  return 'מעבד...'
}

export async function sendMessageStream(
  messages: ApiMessage[],
  onChunk: (text: string) => void,
  onStatus?: (status: string | null) => void,
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  let res: Response
  try {
    res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timeout)
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('הבקשה נמשכה יותר מדי זמן. נסו שוב.')
    }
    throw e
  }
  clearTimeout(timeout)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || 'שגיאה בשליחת ההודעה')
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''
  let hasText = false

  // Initial "thinking" status
  onStatus?.('חושב...')

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const event = JSON.parse(data)

          // Tool use started — show what tool is running
          if (event.type === 'content_block_start') {
            const block = event.content_block
            if (block?.type === 'tool_use' || block?.type === 'mcp_tool_use') {
              onStatus?.(toolLabel(block.name || ''))
            }
            if (block?.type === 'web_search_tool_result') {
              onStatus?.('מחפש באינטרנט...')
            }
          }

          // Text delta — clear status, stream text
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            if (!hasText) {
              hasText = true
              onStatus?.(null) // clear status once text flows
            }
            fullText += event.delta.text
            onChunk(fullText)
          }

          // Non-streaming fallback
          if (event.type === 'message' && event.content) {
            onStatus?.(null)
            const textBlocks = event.content.filter((b: { type: string }) => b.type === 'text')
            fullText = textBlocks.map((b: { text: string }) => b.text).join('\n')
            onChunk(fullText)
          }

          if (event.type === 'error') {
            throw new Error(event.error?.message || 'API stream error')
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue
          throw e
        }
      }
    }
  } finally {
    onStatus?.(null)
    reader.releaseLock()
  }

  return fullText
}

/**
 * Generate a short AI title for a conversation based on the first exchange.
 */
export async function generateTitle(
  userMessage: string,
  aiResponse: string,
): Promise<string> {
  try {
    const messages = [
      { role: 'user', content: [{ type: 'text', text: userMessage }] },
      { role: 'assistant', content: [{ type: 'text', text: aiResponse.substring(0, 300) }] },
      { role: 'user', content: [{ type: 'text', text: 'תן שם קצר לסוגיה שדיברנו עליה' }] },
    ]
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, titleOnly: true }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data.title?.replace(/["״׳']/g, '').trim() || ''
  } catch {
    return ''
  }
}

export function buildUserContent(
  text: string,
  file?: FileAttachment,
): ApiMessage['content'] {
  const content: ApiMessage['content'] = []

  if (file) {
    if (file.type === 'pdf') {
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: file.mediaType!,
          data: file.content,
        },
      })
    } else {
      content.push({
        type: 'text',
        text: `[קובץ: ${file.name}]\n\n${file.content}`,
      })
    }
  }

  if (text.trim()) {
    content.push({ type: 'text', text })
  }

  return content
}
