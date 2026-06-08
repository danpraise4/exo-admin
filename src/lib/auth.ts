const SESSION_KEY = 'exodus_admin_session'

export const DEMO_EMAIL = 'admin@adminroute.com'
export const DEMO_PASSWORD = 'Test@1234'

export type AdminSession = {
  email: string
  loggedInAt: string
}

export function login(email: string, password: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (normalized === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const session: AdminSession = {
      email: DEMO_EMAIL,
      loggedInAt: new Date().toISOString(),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return true
  }
  return false
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getSession(): AdminSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}
