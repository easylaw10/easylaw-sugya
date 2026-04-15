interface TypingIndicatorProps {
  status?: string | null
}

export default function TypingIndicator({ status }: TypingIndicatorProps) {
  const label = status || 'חושב...'

  return (
    <div className="animate-msg-in mb-7">
      <div className="flex items-start gap-2.5 justify-end">
        <img
          src="https://cdn.easylaw.io/assets/1741075499872"
          alt=""
          className="shrink-0 w-6 h-6 rounded-full mt-0.5 object-cover"
        />
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Gemini-style spinner + status */}
          <div className="flex items-center gap-2.5">
            <div className="thinking-spinner w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent shrink-0" />
            <span className="text-[13px] text-text-secondary">{label}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
