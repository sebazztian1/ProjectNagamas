import crypto from 'crypto'

// Reserved usernames as defined in design-signup_spec.md Section 2
export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'dbb_luxe',
  'dbbluxe',
  'support',
  'cs',
  'official',
  'owner',
  'staff',
  'system',
  'help',
  'moderator'
])

// Common passwords blocklist (top recurring patterns & Indonesian terms)
export const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'password1234',
  '12345678',
  '123456789',
  '1234567890',
  '123456789012',
  'qwertyuiop',
  'qwerty123456',
  'sayangku123',
  'indonesia123',
  'rahasia1234',
  'admin123456',
  'masuk123456',
  'bismillah123',
  'iloveyou1234'
])

/**
 * Validate username according to design-signup_spec.md:
 * - 3-20 characters
 * - Letters, numbers, `.` and `_`
 * - Cannot start or end with `.` or `_`
 * - No two special characters in a row
 * - Must not be made entirely of digits or contain 8+ digits in a row
 * - Block reserved usernames
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username wajib diisi' }
  }

  const raw = username.trim()
  if (raw.length < 3 || raw.length > 20) {
    return { valid: false, error: 'Gunakan huruf, angka, titik, atau garis bawah (3-20 karakter)' }
  }

  // Must only contain letters, numbers, dot, underscore
  if (!/^[a-zA-Z0-9._]+$/.test(raw)) {
    return { valid: false, error: 'Gunakan huruf, angka, titik, atau garis bawah (3-20 karakter)' }
  }

  // Cannot start or end with dot or underscore
  if (/^[._]/.test(raw) || /[._]$/.test(raw)) {
    return { valid: false, error: 'Username tidak boleh diawali atau diakhiri titik atau garis bawah' }
  }

  // No two special characters in a row
  if (/[._]{2,}/.test(raw)) {
    return { valid: false, error: 'Username tidak boleh memuat dua tanda khusus berurutan' }
  }

  // Must not be made only of digits
  if (/^\d+$/.test(raw)) {
    return { valid: false, error: 'Username tidak boleh hanya terdiri dari angka' }
  }

  // Reject 8+ digits in a row (to prevent looking like a phone number)
  if (/\d{8,}/.test(raw)) {
    return { valid: false, error: 'Username tidak boleh memuat deretan nomor telepon' }
  }

  // Check reserved names (case-insensitive and with dots/underscores removed)
  const lower = raw.toLowerCase()
  const stripped = lower.replace(/[._]/g, '')
  if (RESERVED_USERNAMES.has(lower) || RESERVED_USERNAMES.has(stripped)) {
    return { valid: false, error: 'Username ini tidak tersedia' }
  }

  return { valid: true }
}

/**
 * Validate & normalize Indonesian mobile phone number:
 * Accepts 08..., 628..., +628...
 * Strips spaces, dashes, brackets
 * Normalizes to 628...
 */
export function validateAndNormalizePhone(raw: string): { valid: boolean; normalized?: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Nomor HP wajib diisi' }
  }

  const cleaned = raw.trim().replace(/[\s\-\(\)\.]/g, '')
  const pattern = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
  if (!pattern.test(cleaned)) {
    return { valid: false, error: 'Masukkan nomor HP Indonesia yang valid' }
  }

  let normalized = cleaned
  if (normalized.startsWith('+62')) {
    normalized = normalized.slice(1)
  } else if (normalized.startsWith('0')) {
    normalized = '62' + normalized.slice(1)
  }

  return { valid: true, normalized }
}

/**
 * Check if password has been compromised via Have I Been Pwned API (k-Anonymity)
 * If unreachable, fails open gracefully.
 */
export async function checkPwnedPassword(password: string): Promise<boolean> {
  try {
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'dbb_luxe-auth-check' }
    })
    clearTimeout(timeoutId)

    if (!res.ok) return false
    const text = await res.text()
    const lines = text.split('\n')
    for (const line of lines) {
      const [hashSuffix] = line.trim().split(':')
      if (hashSuffix === suffix) {
        return true
      }
    }
    return false
  } catch {
    // Fail open if HIBP is down or timeout
    return false
  }
}

/**
 * Validate password according to design-password_spec.md:
 * - Minimum 12 characters (length over complexity)
 * - Maximum 128 characters
 * - No forced uppercase/symbol/number composition rules
 * - Must not contain username, normalized phone, local phone (08...), or site name (dbbluxe, dbb_luxe)
 * - Must not be repeated pattern (e.g. aaaaaaaaaaaa) or sequential pattern (123456789012, abcdefghijkl)
 * - Must not be common password or breached password
 */
export async function validatePasswordRules(
  password: string,
  context?: { username?: string; phone?: string; isAdmin?: boolean }
): Promise<{ valid: boolean; error?: string }> {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Kata sandi wajib diisi' }
  }

  // Count characters, not bytes (supports Unicode/emoji)
  const charLength = Array.from(password).length
  const minLength = context?.isAdmin ? 15 : 12

  if (charLength < minLength) {
    return {
      valid: false,
      error: `Kata sandi minimal ${minLength} karakter`
    }
  }

  if (charLength > 128) {
    return { valid: false, error: 'Kata sandi maksimal 128 karakter' }
  }

  const passLower = password.toLowerCase()

  // Common password check
  if (COMMON_PASSWORDS.has(passLower)) {
    return { valid: false, error: 'Kata sandi ini terlalu umum, coba yang lain' }
  }

  // Site name check
  if (passLower.includes('dbbluxe') || passLower.includes('dbb_luxe')) {
    return { valid: false, error: 'Kata sandi tidak boleh memuat username, nomor HP, atau nama situs' }
  }

  // Username check
  if (context?.username && context.username.length >= 3) {
    const userClean = context.username.toLowerCase().replace(/[._]/g, '')
    if (passLower.includes(context.username.toLowerCase()) || passLower.includes(userClean)) {
      return { valid: false, error: 'Kata sandi tidak boleh memuat username, nomor HP, atau nama situs' }
    }
  }

  // Phone number check
  if (context?.phone) {
    const phoneClean = context.phone.replace(/[\s\-\(\)\.]/g, '')
    const digitsOnly = phoneClean.replace(/\D/g, '')
    const localPhone = digitsOnly.startsWith('62') ? '0' + digitsOnly.slice(2) : digitsOnly

    if (
      (digitsOnly.length >= 7 && passLower.includes(digitsOnly)) ||
      (localPhone.length >= 7 && passLower.includes(localPhone))
    ) {
      return { valid: false, error: 'Kata sandi tidak boleh memuat username, nomor HP, atau nama situs' }
    }
  }

  // Repeated character pattern check (e.g. aaaaaaaaaaaa)
  if (/^(.)\1+$/.test(password)) {
    return { valid: false, error: 'Kata sandi ini terlalu umum, coba yang lain' }
  }

  // Sequential pattern check
  const sequentialPatterns = [
    '123456789012',
    '012345678901',
    'abcdefghijkl',
    'qwertyuiopas',
    'asdfghjklzxc'
  ]
  if (sequentialPatterns.some((seq) => passLower.includes(seq))) {
    return { valid: false, error: 'Kata sandi ini terlalu umum, coba yang lain' }
  }

  // Breached password check (HIBP)
  const isBreached = await checkPwnedPassword(password)
  if (isBreached) {
    return { valid: false, error: 'Kata sandi ini pernah bocor di internet, gunakan yang lain' }
  }

  return { valid: true }
}

/**
 * Generate 12-character unambiguous recovery code:
 * Alphabet without 0/O, 1/I/L -> e.g. K7M2-9QXD-4TPA
 */
export function generateRecoveryCode(): string {
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 12; i++) {
    const randIdx = crypto.randomInt(0, chars.length)
    result += chars[randIdx]
  }
  return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}`
}

