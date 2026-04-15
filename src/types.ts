export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  file?: {
    name: string
    type: string
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  apiMessages: ApiMessage[]
  createdAt: number
  updatedAt: number
}

export interface FileAttachment {
  name: string
  type: 'pdf' | 'docx' | 'txt'
  /** base64 for PDF, plain text for DOCX/TXT */
  content: string
  mediaType?: string
}

export interface ApiMessage {
  role: 'user' | 'assistant'
  content: ApiContent[]
}

export type ApiContent =
  | { type: 'text'; text: string }
  | {
      type: 'document'
      source: {
        type: 'base64'
        media_type: string
        data: string
      }
    }
