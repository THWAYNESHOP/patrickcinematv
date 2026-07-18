export interface SupportEnv {
  DARAJA_ENV?: string
  DARAJA_CONSUMER_KEY?: string
  DARAJA_CONSUMER_SECRET?: string
  DARAJA_BUSINESS_SHORT_CODE?: string
  DARAJA_PASSKEY?: string
  DARAJA_CALLBACK_URL?: string
}

const PLACEHOLDER_PATTERNS = [
  /your_?daraja_?consumer_?key/i,
  /your_?daraja_?consumer_?secret/i,
  /your_?business_?short_?code/i,
  /your_?daraja_?passkey/i,
  /your_?domain/i,
]

export function isPlaceholder(value?: string): boolean {
  return typeof value === 'string' && PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

export function validateEnv(env: SupportEnv): string | null {
  const requiredVars = [
    'DARAJA_CONSUMER_KEY',
    'DARAJA_CONSUMER_SECRET',
    'DARAJA_BUSINESS_SHORT_CODE',
    'DARAJA_PASSKEY',
    'DARAJA_CALLBACK_URL',
  ]

  for (const varName of requiredVars) {
    const value = env[varName as keyof SupportEnv]
    if (!value) {
      return `Missing required environment variable: ${varName}`
    }
    if (isPlaceholder(value)) {
      return `Environment variable ${varName} appears to contain a placeholder value. Update it with a real credential.`
    }
  }

  return null
}

export function normalizePhoneNumber(phoneNumber: unknown): string | null {
  if (typeof phoneNumber !== 'string') return null

  const digits = phoneNumber.replace(/\D/g, '')
  if (!digits) return null

  if (digits.startsWith('254')) {
    return digits.length === 12 ? digits : null
  }

  if (digits.startsWith('0')) {
    const withoutLeadingZero = digits.slice(1)
    const normalized = `254${withoutLeadingZero}`
    return normalized.length === 12 ? normalized : null
  }

  if (digits.startsWith('7') || digits.startsWith('1')) {
    const normalized = `254${digits}`
    return normalized.length === 12 ? normalized : null
  }

  return null
}

export function getTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hour}${minute}${second}`
}

export function getPassword(businessShortCode: string, passkey: string, timestamp: string): string {
  return btoa(`${businessShortCode}${passkey}${timestamp}`)
}

export function getDarajaBase(env: SupportEnv): string {
  return env.DARAJA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'
}

export async function getDarajaAccessToken(env: SupportEnv): Promise<string> {
  const auth = btoa(`${env.DARAJA_CONSUMER_KEY}:${env.DARAJA_CONSUMER_SECRET}`)
  const url = `${getDarajaBase(env)}/oauth/v1/generate?grant_type=client_credentials`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Daraja token request failed: ${response.status} ${body}`)
  }

  const payload = await response.json().catch(() => null)
  if (!payload?.access_token) {
    throw new Error('Daraja token response did not include access_token')
  }

  return payload.access_token
}
