import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onRequest } from './index.js'

describe('TMDB Cloudflare proxy', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses VITE_TMDB_API_KEY when TMDB_API_KEY is not provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ results: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await onRequest({
      request: new Request('https://example.com/api/tmdb/movie/popular?language=en-US&page=1'),
      env: { VITE_TMDB_API_KEY: 'fallback-key' },
    })

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('api_key=fallback-key'),
      expect.objectContaining({ method: 'GET' }),
    )
  })
})
