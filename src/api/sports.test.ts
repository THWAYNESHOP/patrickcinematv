import { afterEach, describe, expect, it, vi } from 'vitest'

describe('sports API poster URLs', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('routes streamed poster paths through the Cloudflare sports proxy in production', async () => {
    vi.resetModules()
    vi.stubEnv('MODE', 'production')

    const { normalizeSportsPosterUrl } = await import('./sports')

    expect(normalizeSportsPosterUrl('/api/images/proxy/card.webp')).toBe('/api/sports/images/proxy/card.webp')
    expect(normalizeSportsPosterUrl('/images/proxy/card.webp')).toBe('/api/sports/images/proxy/card.webp')
  })

  it('uses the upstream streamed API host outside production', async () => {
    vi.resetModules()
    vi.stubEnv('MODE', 'test')

    const { normalizeSportsPosterUrl } = await import('./sports')

    expect(normalizeSportsPosterUrl('/api/images/proxy/card.webp')).toBe('https://streamed.pk/api/images/proxy/card.webp')
  })

  it('keeps absolute poster URLs unchanged', async () => {
    vi.resetModules()

    const { normalizeSportsPosterUrl } = await import('./sports')

    expect(normalizeSportsPosterUrl('https://example.com/card.jpg')).toBe('https://example.com/card.jpg')
    expect(normalizeSportsPosterUrl('//example.com/card.jpg')).toBe('https://example.com/card.jpg')
  })
})
