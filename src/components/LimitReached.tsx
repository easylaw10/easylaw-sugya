import { COURSE_URL } from '../constants'

export default function LimitReached() {
  return (
    <div className="animate-msg-in flex flex-col items-center py-10 text-center">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
        <span className="text-lg">🎓</span>
      </div>
      <h3 className="text-[16px] font-bold text-primary mb-1">נגמרו ההודעות</h3>
      <p className="text-text-secondary text-[13px] mb-5 leading-relaxed max-w-[260px]">
        ניצלת את כל 50 ההודעות. לסימולציה מלאה של ראיון התמחות:
      </p>
      <a
        href={COURSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-9 px-5 bg-primary text-accent font-semibold text-[13px] rounded-lg hover:bg-primary-light transition-colors active:scale-[0.97]"
      >
        לסימולציה המלאה
        <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    </div>
  )
}
