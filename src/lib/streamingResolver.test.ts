import { describe, expect, it } from 'vitest'
import { resolveStreamSource } from './streamingResolver'

describe('resolveStreamSource', () => {
  it('returns a normalized HLS source for a movie request', async () => {
    const source = await resolveStreamSource({
      kind: 'movie',
      id: 'demo-movie',
      providers: ['demo-hls'],
    })

    expect(source.streamType).toBe('hls')
    expect(source.streamUrl).toContain('.m3u8')
    expect(source.title).toBeTruthy()
  })

  it('falls back to another provider when the first one is unavailable', async () => {
    const source = await resolveStreamSource({
      kind: 'live',
      id: 'demo-live',
      providers: ['demo-broken', 'demo-hls'],
    })

    expect(source.streamType).toBe('hls')
    expect(source.streamUrl).toContain('.m3u8')
  })
})
