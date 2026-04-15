import { LOGO_URL } from '../constants'

interface HeaderProps {
  onNewChat: () => void
  onToggleHistory: () => void
  hasHistory: boolean
}

export default function Header({ onNewChat, onToggleHistory, hasHistory }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 sticky top-0 z-10 bg-white/85 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleHistory}
          disabled={!hasHistory}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
            hasHistory ? 'text-primary/60 hover:text-primary hover:bg-surface-dim' : 'text-border'
          }`}
          title="שיחות אחרונות"
        >
          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div className="w-px h-5 bg-border/60" />
        <img src={LOGO_URL} alt="EASYLAW" className="h-6 w-auto" />
        <span className="text-[14px] font-semibold text-primary tracking-tight">הסוגיה המשפטית</span>
      </div>

      <button
        onClick={onNewChat}
        className="flex items-center gap-1.5 h-8 px-3.5 text-[12px] font-medium text-primary/70 hover:text-primary bg-surface-dim hover:bg-border/40 rounded-lg transition-colors cursor-pointer"
        title="שיחה חדשה"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">שיחה חדשה</span>
      </button>
    </header>
  )
}
