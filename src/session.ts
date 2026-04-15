import { STORAGE_KEY_COUNTER } from './constants'

export function getMessageCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY_COUNTER) || '0', 10)
}

export function incrementMessageCount(): number {
  const count = getMessageCount() + 1
  localStorage.setItem(STORAGE_KEY_COUNTER, String(count))
  return count
}
