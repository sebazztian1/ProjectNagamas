import crypto from 'crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'

const COOKIE_NAME = 'dbb_session'
const SECRET = process.env.NUXT_SESSION_PASSWORD || 'dbb_luxe_secret_session_key_32chars_long!'
const SESSION_EXPIRY_DAYS = 7

export interface SessionData {
  userId: number
  username: string
  phone_number: string
  role: 'customer' | 'admin' | 'staff'
  exp: number
}

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET)
  hmac.update(payload)
  return hmac.digest('base64url')
}

export function createSessionToken(data: Omit<SessionData, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + (SESSION_EXPIRY_DAYS * 24 * 60 * 60)
  const fullData: SessionData = { ...data, exp }
  const jsonStr = JSON.stringify(fullData)
  const encodedPayload = Buffer.from(jsonStr).toString('base64url')
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const [encodedPayload, signature] = token.split('.')
    if (!encodedPayload || !signature) return null

    const expectedSignature = sign(encodedPayload)
    if (signature !== expectedSignature) return null

    const jsonStr = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const data: SessionData = JSON.parse(jsonStr)

    // Check expiration
    if (data.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return data
  } catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, data: Omit<SessionData, 'exp'>) {
  const token = createSessionToken(data)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/'
  })
}

export function getSessionFromEvent(event: H3Event): SessionData | null {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null
  return verifySessionToken(token)
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, {
    path: '/'
  })
}
