export default function TypingIndicator() {
  return (
    <div className="animate-msg-in mb-7">
      <div className="flex items-start gap-2.5 justify-end">
        <img src="https://cdn.easylaw.io/assets/1741075499872" alt="" className="shrink-0 w-6 h-6 rounded-full mt-0.5 object-cover" />
        <div className="flex-1 min-w-0 space-y-2 pt-1">
          <div className="typing-shimmer h-3 w-3/4 rounded" />
          <div className="typing-shimmer h-3 w-1/2 rounded" style={{ animationDelay: '0.15s' }} />
          <div className="typing-shimmer h-3 w-2/3 rounded" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  )
}
