import { useEffect } from 'react'
import type { Conversation } from '../types'

interface HistoryDrawerProps {
  open: boolean
  onClose: () => void
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNewChat: () => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'עכשיו'
  if (mins < 60) return `לפני ${mins} דק׳`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `לפני ${hours} שע׳`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'אתמול'
  if (days < 7) return `לפני ${days} ימים`
  return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
}

export default function HistoryDrawer({
  open, onClose, conversations, activeId, onSelect, onDelete, onNewChat,
}: HistoryDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-primary/15 backdrop-blur-[2px] z-40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[272px] max-w-[82vw] bg-white z-50 shadow-2xl shadow-primary/10 flex flex-col transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/60">
          <span className="text-[14px] font-semibold text-primary">שיחות אחרונות</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-dim text-text-secondary/60 hover:text-primary transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => { onNewChat(); onClose() }}
            className="w-full flex items-center justify-center gap-1.5 h-9 text-[12px] font-medium text-primary/70 rounded-lg border border-border/80 hover:bg-surface-dim transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            שיחה חדשה
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          {conversations.length === 0 ? (
            <p className="text-text-secondary/40 text-[12px] text-center mt-10">אין שיחות שמורות</p>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    conv.id === activeId
                      ? 'bg-accent/8 border border-accent/15'
                      : 'hover:bg-surface-dim border border-transparent'
                  }`}
                  onClick={() => { onSelect(conv.id); onClose() }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-primary truncate leading-tight">{conv.title}</div>
                    <div className="text-[10px] text-text-secondary/50 mt-0.5">
                      {timeAgo(conv.updatedAt)} · {conv.messages.filter(m => m.role === 'user').length} הודעות
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id) }}
                    className="shrink-0 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-text-secondary/30 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    title="מחק"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
