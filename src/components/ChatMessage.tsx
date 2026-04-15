import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../types'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => { if (copyTimer.current) clearTimeout(copyTimer.current) }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="animate-msg-in flex justify-start mb-5">
        <div className="max-w-[85%] sm:max-w-[70%] bg-user-bubble px-4 py-2.5 rounded-2xl text-text text-[14px] leading-relaxed">
          {message.file && (
            <div className="flex items-center gap-2 mb-2 pb-2 text-[12px] text-text-secondary border-b border-primary/5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">{message.file.name}</span>
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-msg-in mb-7">
      <div className="flex items-start gap-2.5 justify-end">
        <img src="https://cdn.easylaw.io/assets/1741075499872" alt="" className="shrink-0 w-6 h-6 rounded-full mt-0.5 object-cover" />
        <div className="flex-1 min-w-0 text-[14px] text-text leading-relaxed">
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {message.content && (
        <div className="flex items-center gap-0.5 mt-1.5 mr-9">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-text-secondary/40 hover:text-primary/60 hover:bg-surface-dim transition-colors cursor-pointer"
            title="העתק"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button className="p-1.5 rounded-md text-text-secondary/40 hover:text-primary/60 hover:bg-surface-dim transition-colors cursor-pointer" title="אהבתי">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            </svg>
          </button>
          <button className="p-1.5 rounded-md text-text-secondary/40 hover:text-primary/60 hover:bg-surface-dim transition-colors cursor-pointer" title="לא אהבתי">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
