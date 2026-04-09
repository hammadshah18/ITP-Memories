export const ALLOWED_EMAILS = [
  'hammadshah7218@gmail.com',
  'razakhanzada100@gmail.com',
  'aitzazhakro123@gmail.com',
  'hammadmasood179@gmail.com',
] as const

export const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD ?? '12345678'

const EMAIL_TO_FRIEND_NAME: Record<string, string> = {
  'hammadshah7218@gmail.com': 'Hammad Shah',
  'razakhanzada100@gmail.com': 'Raza Khan',
  'aitzazhakro123@gmail.com': 'Aitzaz Hasan',
  'hammadmasood179@gmail.com': 'hammad Masood',
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isEmailAllowed(email: string | null | undefined) {
  if (!email) return false
  return ALLOWED_EMAILS.includes(normalizeEmail(email) as (typeof ALLOWED_EMAILS)[number])
}

export function isValidAdminPassword(password: string | null | undefined) {
  if (!password) return false
  return password === ADMIN_LOGIN_PASSWORD
}

export function getFriendNameByEmail(email: string | null | undefined) {
  if (!email) return null
  return EMAIL_TO_FRIEND_NAME[normalizeEmail(email)] ?? null
}
