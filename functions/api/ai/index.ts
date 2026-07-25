const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type AiProvider = 'gemini' | 'grok'

interface AiEnv {
  AI_PROVIDER?: string
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string
  GROK_API_KEY?: string
  GROK_MODEL?: string
}

function getProvider(env: AiEnv): AiProvider {
  const provider = env.AI_PROVIDER?.trim().toLowerCase()
  return provider === 'grok' ? 'grok' : 'gemini'
}

function validateEnv(env: AiEnv): string | null {
  const provider = getProvider(env)

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      return 'GEMINI_API_KEY is not configured.'
    }
  } else {
    if (!env.GROK_API_KEY) {
      return 'GROK_API_KEY is not configured.'
    }
  }

  return null
}

function collectText(value: unknown, seen = new WeakSet()): string[] {
  const texts: string[] = []

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length) {
      texts.push(trimmed)
    }
    return texts
  }

  if (typeof value !== 'object' || value === null) {
    return texts
  }

  if (seen.has(value)) {
    return texts
  }
  seen.add(value)

  if (Array.isArray(value)) {
    for (const item of value) {
      texts.push(...collectText(item, seen))
    }
    return texts
  }

  const obj = value as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    texts.push(...collectText(obj[key], seen))
  }

  return texts
}

function parseTextFromResponse(data: unknown): string | null {
  if (typeof data === 'string') {
    const trimmed = data.trim()
    return trimmed.length ? trimmed : null
  }

  const texts = collectText(data)
  const output = texts.join(' ').trim()
  return output.length ? output : null
}

async function callGemini(env: AiEnv, input: string) {
  const configured = env.GEMINI_MODEL?.trim()

  const requestBodyBase = (text: string) => ({
    contents: [
      {
        parts: [
          { text },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  })

  const isTextModel = (modelId: string) => {
    const normalized = modelId.toLowerCase()
    return !normalized.includes('image') && !normalized.includes('vision') && !normalized.includes('img')
  }

  const getModelName = (model: unknown): string => {
    if (typeof model === 'string') {
      return model.replace(/^models\//, '').trim()
    }

    if (model && typeof model === 'object') {
      const value = model as Record<string, unknown>
      const name = typeof value.name === 'string' ? value.name : ''
      return name.replace(/^models\//, '').trim()
    }

    return ''
  }

  const formatGeminiError = (data: unknown, status: number | string) => {
    if (data && typeof data === 'object') {
      const errorPayload = data as Record<string, unknown>
      const errorStatus = typeof errorPayload.status === 'string' ? errorPayload.status : ''
      const errorMessage = typeof errorPayload.error === 'string'
        ? errorPayload.error
        : typeof errorPayload.message === 'string'
          ? errorPayload.message
          : ''
      const details = Array.isArray(errorPayload.details) ? errorPayload.details : []
      const detailMessages = details
        .map((detail) => (detail && typeof detail === 'object' ? JSON.stringify(detail) : String(detail)))
        .filter(Boolean)

      const combined = `${errorStatus} ${errorMessage} ${detailMessages.join(' ')}`.toUpperCase()

      if (combined.includes('RESOURCE_EXHAUSTED') || status === 429 || status === 403) {
        return 'Gemini quota is exhausted or rate-limited for the current API key. Billing or free-tier quota must be restored before requests can succeed.'
      }

      return errorMessage || `Gemini request failed with status ${status}`
    }

    return `Gemini request failed with status ${status}`
  }

  const isQuotaExhausted = (data: unknown, status: number | string) => {
    const message = formatGeminiError(data, status)
    return message.includes('quota is exhausted') || status === 429 || status === 403
  }

  const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${env.GEMINI_API_KEY}`
  const listResp = await fetch(listUrl)
  const listData = await listResp.json().catch(() => null)

  if (!listResp.ok) {
    throw new Error(formatGeminiError(listData, listResp.status))
  }

  if (!Array.isArray(listData?.models)) {
    throw new Error('Unable to discover available Gemini models for this API key.')
  }

  const availableModels = listData.models
    .filter((model: unknown) => {
      if (!model || typeof model !== 'object') {
        return false
      }

      const value = model as Record<string, unknown>
      const methods = Array.isArray(value.supportedGenerationMethods) ? value.supportedGenerationMethods : []
      return methods.includes('generateContent')
    })
    .map((model: unknown) => getModelName(model))
    .filter((model: string) => model && isTextModel(model))

  if (availableModels.length === 0) {
    throw new Error('No supported text-generation Gemini models are available for this API key.')
  }

  const candidates = [] as string[]
  if (configured) {
    const configuredModel = availableModels.find((model: string) => model === configured)
    if (configuredModel) {
      candidates.push(configuredModel)
    }
  }

  for (const model of availableModels) {
    if (!candidates.includes(model)) {
      candidates.push(model)
    }
  }

  for (const model of candidates) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBodyBase(input)),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (isQuotaExhausted(data, response.status)) {
          throw new Error(formatGeminiError(data, response.status))
        }

        if (response.status === 404) {
          continue
        }

        throw new Error(formatGeminiError(data, response.status))
      }

      const output = parseTextFromResponse(data)
      if (output) {
        return { output, provider: 'gemini', model }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('quota is exhausted')) {
        throw err
      }

      if (err instanceof Error && err.message.includes('rate-limiting')) {
        throw err
      }

      if (err instanceof Error && err.message.includes('Gemini request failed')) {
        throw err
      }
    }
  }

  throw new Error('No supported Gemini text model produced a usable response for this request.')
}

async function callGrok(env: AiEnv, input: string) {
  const model = env.GROK_MODEL?.trim() || 'grok-4.5'
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'error' in data
      ? JSON.stringify(data)
      : response.statusText || 'Grok request failed.'
    throw new Error(message)
  }

  const output = parseTextFromResponse(data) ?? ''
  return { output, provider: 'grok', model }
}

export async function onRequest(context: { request: Request; env: AiEnv }) {
  const { request, env } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: jsonHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: jsonHeaders,
    })
  }

  const envError = validateEnv(env)
  if (envError) {
    return new Response(JSON.stringify({ error: envError }), {
      status: 500,
      headers: jsonHeaders,
    })
  }

  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: jsonHeaders,
    })
  }

  const input = (payload as Record<string, unknown>).input
  if (typeof input !== 'string' || !input.trim()) {
    return new Response(JSON.stringify({ error: 'input is required and must be a non-empty string' }), {
      status: 400,
      headers: jsonHeaders,
    })
  }

  try {
    const provider = getProvider(env)
    const result = provider === 'grok'
      ? await callGrok(env, input)
      : await callGemini(env, input)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected internal error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: jsonHeaders,
    })
  }
}
