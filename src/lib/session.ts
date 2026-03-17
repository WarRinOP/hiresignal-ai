// Session management for HireSignal — rate limiting + scoping

const SESSION_KEY = 'hs_session_id'
const REMAINING_KEY = 'hs_remaining'
export const MAX_ANALYSES = 5

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return genId()
  const stored = localStorage.getItem(SESSION_KEY)
  if (stored) return stored
  const id = genId()
  localStorage.setItem(SESSION_KEY, id)
  localStorage.setItem(REMAINING_KEY, String(MAX_ANALYSES))
  return id
}

export function getStoredRemaining(): number {
  if (typeof window === 'undefined') return MAX_ANALYSES
  const stored = localStorage.getItem(REMAINING_KEY)
  return stored !== null ? parseInt(stored, 10) : MAX_ANALYSES
}

export function setStoredRemaining(n: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REMAINING_KEY, String(n))
  }
}

// ── Admin mode ─────────────────────────────────────
const ADMIN_KEY = 'hs_admin_key'

export function getAdminKey(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(ADMIN_KEY) || ''
}

export function setAdminKey(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_KEY, key)
}

export function clearAdminKey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_KEY)
}

export function isAdminMode(): boolean {
  return getAdminKey().length > 0
}
