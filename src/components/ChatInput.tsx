import { useState, useRef, useCallback } from 'react'
import type { FileAttachment } from '../types'
import { validateFile, processFile } from '../fileUtils'

interface ChatInputProps {
  onSend: (text: string, file?: FileAttachment) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<FileAttachment | null>(null)
  const [fileError, setFileError] = useState('')
  const [processing, setProcessing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }, [])

  const handleSend = () => {
    if ((!text.trim() && !file) || disabled || processing) return
    onSend(text.trim(), file || undefined)
    setText('')
    setFile(null)
    setFileError('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    e.target.value = ''
    const error = validateFile(f)
    if (error) { setFileError(error); return }
    setFileError('')
    setProcessing(true)
    try { setFile(await processFile(f)) } catch { setFileError('שגיאה בעיבוד הקובץ') }
    setProcessing(false)
  }

  const hasContent = text.trim() || file

  return (
    <div className="px-3 pb-3 pt-1 sm:px-0 sm:pb-4">
      {fileError && (
        <div className="text-red-500 text-[12px] mb-1.5 px-4">{fileError}</div>
      )}

      <div className="relative border border-border rounded-2xl bg-surface-dim/80 focus-within:border-primary/25 focus-within:bg-white transition-colors duration-150 overflow-hidden">
        {file && (
          <div className="flex items-center gap-2 mx-3 mt-2.5 mb-0.5 bg-white rounded-lg px-3 py-1.5 border border-border text-[12px]">
            <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center shrink-0">
              <svg className="w-2.5 h-2.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="truncate text-primary font-medium">{file.name}</span>
            <button onClick={() => setFile(null)} className="mr-auto text-text-secondary/50 hover:text-red-500 transition-colors cursor-pointer">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-end gap-0.5 px-1.5 py-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || processing}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary/60 hover:text-primary/70 hover:bg-white transition-colors disabled:opacity-25 cursor-pointer"
            title="העלאת קובץ"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} className="hidden" />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); adjustHeight() }}
            onKeyDown={handleKeyDown}
            placeholder={processing ? 'מעבד קובץ...' : 'שאלו על הסוגיה שלכם...'}
            disabled={disabled || processing}
            rows={1}
            className="flex-1 resize-none bg-transparent py-1.5 px-1.5 text-[14px] text-text placeholder:text-text-secondary/45 focus:outline-none disabled:opacity-35"
          />

          <button
            onClick={handleSend}
            disabled={!hasContent || disabled || processing}
            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
              hasContent && !disabled && !processing
                ? 'bg-primary text-accent hover:bg-primary-light active:scale-90'
                : 'text-border'
            }`}
            title="שליחה"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-text-secondary/35 text-center mt-1.5 tracking-wide">
        EASYLAW AI עשוי לטעות · מומלץ לבדוק מקורות
      </p>
    </div>
  )
}
