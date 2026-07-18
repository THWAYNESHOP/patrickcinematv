import { describe, it, expect } from 'vitest'
import { normalizePhoneNumber } from './phone.js'

describe('normalizePhoneNumber', () => {
  it('converts 07 numbers to the 254 format expected by Daraja', () => {
    expect(normalizePhoneNumber('0712345678')).toBe('254712345678')
  })

  it('converts 01 numbers to the 254 format expected by Daraja', () => {
    expect(normalizePhoneNumber('0112345678')).toBe('254112345678')
  })

  it('keeps numbers that already include 254', () => {
    expect(normalizePhoneNumber('254712345678')).toBe('254712345678')
  })

  it('strips a leading + and returns a normalized 254 number', () => {
    expect(normalizePhoneNumber('+254712345678')).toBe('254712345678')
  })

  it('rejects values that are too short or contain non-digits', () => {
    expect(normalizePhoneNumber('123')).toBeNull()
    expect(normalizePhoneNumber('07123abc')).toBeNull()
  })
})
