import { describe, expect, it } from 'vitest'
import { sanitizeIframeSrc } from './iframe'

describe('sanitizeIframeSrc', () => {
  it('strips unsupported sandbox-related parameters from embed URLs', () => {
    expect(sanitizeIframeSrc('https://example.com/embed?autoplay=1&sandbox=allow-scripts&foo=bar')).toBe(
      'https://example.com/embed?autoplay=1&foo=bar',
    )
  })

  it('removes allow and fullscreen flags that some browsers reject', () => {
    expect(sanitizeIframeSrc('https://example.com/embed?allow=autoplay&allowfullscreen=true&foo=bar')).toBe(
      'https://example.com/embed?foo=bar',
    )
  })

  it('returns the original value for invalid or non-URL input', () => {
    expect(sanitizeIframeSrc('not-a-valid-url')).toBe('not-a-valid-url')
  })
})
