import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onRequest } from './index.js'

describe('Sports Cloudflare proxy', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rewrites sports image requests and preserves the binary image response', async () => {
    const imageBytes = new Uint8Array([82, 73, 70, 70])
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(imageBytes, {
        status: 200,
        headers: {
          'content-type': 'image/webp',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await onRequest({
      request: new Request('https://example.com/api/sports/images/proxy/card.webp'),
      env: {},
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://streamed.pk/api/images/proxy/card.webp',
      expect.objectContaining({
        method: 'GET',
      }),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/webp')
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual(Array.from(imageBytes))
  })

  it('passes match JSON through the sports API route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 'match-1' }]), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await onRequest({
      request: new Request('https://example.com/api/sports/matches/all'),
      env: {},
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://streamed.pk/api/matches/all',
      expect.objectContaining({
        method: 'GET',
      }),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    await expect(response.json()).resolves.toEqual([{ id: 'match-1' }])
  })
})
