import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequest } from './index'

describe('AI Cloudflare function', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends NEXASTREAM context and parses Gemini candidate text', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            models: [
              {
                name: 'models/gemini-3.6-flash',
                supportedGenerationMethods: ['generateContent'],
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Anatomy of a Fall.\n\n5. **Structuring the Response:** pick one title' }],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    const response = await onRequest({
      request: new Request('https://example.com/api/ai', {
        method: 'POST',
        body: JSON.stringify({
          input: 'What should I watch?',
          messages: [
            { role: 'user', content: 'I want a movie today' },
            { role: 'assistant', content: 'What mood are you in?' },
          ],
        }),
      }),
      env: {
        AI_PROVIDER: 'gemini',
        GEMINI_API_KEY: 'test-gemini-key',
        GEMINI_MODEL: 'gemini-3.6-flash',
      },
    })

    expect(response.status).toBe(200)
    const generateRequestBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body))
    expect(generateRequestBody.systemInstruction.parts[0].text).toContain('NEXASTREAM AI')
    expect(generateRequestBody.contents).toEqual([
      { role: 'user', parts: [{ text: 'I want a movie today' }] },
      { role: 'model', parts: [{ text: 'What mood are you in?' }] },
      { role: 'user', parts: [{ text: 'What should I watch?' }] },
    ])
    await expect(response.json()).resolves.toEqual({
      output: 'Anatomy of a Fall.',
      provider: 'gemini',
      model: 'gemini-3.6-flash',
    })
  })
})
