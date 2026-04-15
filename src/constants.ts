export const MAX_MESSAGES = 50
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const STORAGE_KEY_COUNTER = 'easylaw-msg-counter'
export const LOGO_URL = 'https://cdn.easylaw.io/assets/1732831883809'
export const COURSE_URL = 'https://courses.easylaw.io/view/628ca1ec7188472e955b6f4d'

export const QUICK_ACTIONS = [
  {
    emoji: '🔍',
    title: 'לחדד סוגיה קיימת',
    subtitle: 'כבר יש לי סוגיה, אני רוצה לשפר אותה',
    message: 'יש לי סוגיה משפטית ואני רוצה לחדד ולשפר אותה',
  },
  {
    emoji: '❓',
    title: 'להתאמן על שאלות',
    subtitle: 'יש לי סוגיה מוכנה, אני רוצה שישאלו אותי שאלות',
    message: 'יש לי סוגיה מוכנה ואני רוצה להתאמן על שאלות שמראיין עלול לשאול',
  },
  {
    emoji: '💡',
    title: 'לבנות סוגיה מאפס',
    subtitle: 'עוד אין לי סוגיה, בואו נבנה אחת ביחד',
    message: 'אין לי עדיין סוגיה משפטית, אני רוצה לבנות אחת מאפס',
  },
] as const
