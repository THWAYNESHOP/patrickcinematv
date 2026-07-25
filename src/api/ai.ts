export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AiChatResponse {
  output: string
  provider: 'gemini' | 'grok'
  model: string
}

export async function sendAiMessage(message: string): Promise<AiChatResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: message }),
    })

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '')
      let payload: { error?: unknown } | null = null

      if (bodyText) {
        try {
          payload = JSON.parse(bodyText) as { error?: unknown } | null
        } catch {
          payload = null
        }
      }

      const messageText = typeof payload?.error === 'string'
        ? payload.error
        : bodyText || 'Unable to send AI request.'

      throw new Error(typeof messageText === 'string' ? messageText : JSON.stringify(messageText), { cause: error })
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        throw new Error('The AI service is unreachable. Start the support server with npm start or check the backend port.', { cause: error })
      }

      throw error
    }

    throw new Error('Unable to send AI request.', { cause: error })
  }
}
