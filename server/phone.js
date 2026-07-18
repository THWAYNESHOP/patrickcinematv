export function normalizePhoneNumber(phoneNumber) {
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
