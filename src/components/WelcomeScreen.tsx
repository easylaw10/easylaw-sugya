import { QUICK_ACTIONS } from '../constants'

interface WelcomeScreenProps {
  onSelect: (message: string) => void
}

export default function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center px-5 pt-10 sm:pt-16 pb-6">
      <h2 className="text-[28px] sm:text-[36px] font-extrabold mb-2 text-center leading-tight tracking-tight text-primary">
        היי, מה הסוגיה שלך?
      </h2>
      <p className="animate-fade-up text-text-secondary text-[14px] sm:text-[15px] mb-10 text-center max-w-xs" style={{ animationDelay: '0.08s' }}>
        אני כאן לעזור לך להכין סוגיה משפטית לראיון ההתמחות
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-lg">
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={action.title}
            onClick={() => onSelect(action.message)}
            className="animate-chip-in flex flex-col items-start gap-2.5 p-4 rounded-xl border border-border/80 bg-white hover:bg-surface-dim hover:border-primary/15 transition-all duration-150 text-right cursor-pointer group active:scale-[0.98]"
            style={{ animationDelay: `${0.12 + i * 0.07}s` }}
          >
            <span className="text-lg leading-none">{action.emoji}</span>
            <div>
              <div className="text-[13px] font-semibold text-primary leading-snug">{action.title}</div>
              <div className="text-[11px] text-text-secondary mt-0.5 leading-snug">{action.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
