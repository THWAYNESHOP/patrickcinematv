import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import { writeFileSync } from 'fs'
import path from 'path'
import { normalizePhoneNumber } from './phone.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const requestedPort = Number(process.env.PORT || 4000)
const fallbackPortCandidates = Array.from({ length: 6 }, (_, index) => requestedPort + index)
const portFilePath = path.resolve(process.cwd(), '.support-server-port')
let currentPort = requestedPort

function writePortFile(port) {
  writeFileSync(portFilePath, String(port), 'utf8')
}

function startServer(port, offset = 0) {
  const server = app.listen(port, () => {
    currentPort = port
    writePortFile(port)
    console.log(`Support server running on http://localhost:${port}`)
  })

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = fallbackPortCandidates[offset + 1]
      if (nextPort) {
        console.warn(`Port ${port} is busy. Trying ${nextPort} instead.`)
        startServer(nextPort, offset + 1)
        return
      }

      console.error(`Unable to start support server. Tried ports: ${fallbackPortCandidates.join(', ')}`)
      process.exit(1)
    }

    throw error
  })
}

const DARAJA_ENV = process.env.DARAJA_ENV || 'sandbox'
const DARAJA_CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY
const DARAJA_CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET
const DARAJA_BUSINESS_SHORT_CODE = process.env.DARAJA_BUSINESS_SHORT_CODE
const DARAJA_PASSKEY = process.env.DARAJA_PASSKEY
const DARAJA_CALLBACK_URL = process.env.DARAJA_CALLBACK_URL

const PLACEHOLDER_PATTERNS = [
  /your_?daraja_?consumer_?key/i,
  /your_?daraja_?consumer_?secret/i,
  /your_?business_?short_?code/i,
  /your_?daraja_?passkey/i,
  /your_?domain/i,
]

function isPlaceholder(value) {
  return typeof value === 'string' && PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

if (!DARAJA_CONSUMER_KEY || !DARAJA_CONSUMER_SECRET || !DARAJA_BUSINESS_SHORT_CODE || !DARAJA_PASSKEY || !DARAJA_CALLBACK_URL) {
  console.error('Missing one or more DARAJA_* environment variables.')
  process.exit(1)
}

if (
  isPlaceholder(DARAJA_CONSUMER_KEY) ||
  isPlaceholder(DARAJA_CONSUMER_SECRET) ||
  isPlaceholder(DARAJA_BUSINESS_SHORT_CODE) ||
  isPlaceholder(DARAJA_PASSKEY) ||
  isPlaceholder(DARAJA_CALLBACK_URL)
) {
  console.error('One or more DARAJA_* environment variables are still using placeholder values. Update .env.local with your actual Daraja sandbox or production credentials.')
  process.exit(1)
}

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', port: currentPort })
})

const darajaBase = DARAJA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || ''
const GROK_API_KEY = process.env.GROK_API_KEY
const GROK_MODEL = process.env.GROK_MODEL || 'grok-4.5'

async function getDarajaAccessToken() {
  const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString('base64')
  const response = await axios.get(`${darajaBase}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
  return response.data.access_token
}

function getAiProvider() {
  return AI_PROVIDER.trim().toLowerCase() === 'grok' ? 'grok' : 'gemini'
}

function collectText(value) {
  const texts = []
  if (!value || typeof value !== 'object') {
    return texts
  }

  const obj = value

  if (typeof obj.output_text === 'string') {
    texts.push(obj.output_text)
  }
  if (typeof obj.output === 'string') {
    texts.push(obj.output)
  }
  if (typeof obj.text === 'string') {
    texts.push(obj.text)
  }
  if (typeof obj.markdown === 'string') {
    texts.push(obj.markdown)
  }

  if (Array.isArray(obj.parts)) {
    for (const part of obj.parts) {
      texts.push(...collectText(part))
    }
  }

  if (Array.isArray(obj.content)) {
    for (const contentBlock of obj.content) {
      texts.push(...collectText(contentBlock))
    }
  }

  if (Array.isArray(obj.candidates)) {
    for (const candidate of obj.candidates) {
      texts.push(...collectText(candidate))
    }
  }

  if (Array.isArray(obj.output)) {
    for (const output of obj.output) {
      texts.push(...collectText(output))
    }
  }

  return texts
}

function parseAiResponseBody(data) {
  if (typeof data === 'string') {
    const trimmed = data.trim()
    return trimmed.length ? trimmed : null
  }

  const texts = collectText(data)
  const output = texts.map((text) => String(text).trim()).filter(Boolean).join(' ').trim()
  return output.length ? output : null
}


async function callGemini(input) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  const requestBodyFor = (text) => ({
    contents: [
      { parts: [{ text }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  })

  const isTextModel = (modelId) => {
    const normalized = String(modelId || '').toLowerCase()
    return !normalized.includes('image') && !normalized.includes('vision') && !normalized.includes('img')
  }

  const getModelName = (model) => {
    if (typeof model === 'string') {
      return model.replace(/^models\//, '').trim()
    }

    if (model && typeof model === 'object') {
      const name = typeof model.name === 'string' ? model.name : ''
      return name.replace(/^models\//, '').trim()
    }

    return ''
  }

  const formatGeminiError = (data, status) => {
    if (data && typeof data === 'object') {
      const errorStatus = typeof data.status === 'string' ? data.status : ''
      const errorMessage = typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : ''
      const details = Array.isArray(data.details) ? data.details : []
      const detailMessages = details
        .map((detail) => (detail && typeof detail === 'object' ? JSON.stringify(detail) : String(detail)))
        .filter(Boolean)

      const combined = `${errorStatus} ${errorMessage} ${detailMessages.join(' ')}`.toUpperCase()

      if (combined.includes('RESOURCE_EXHAUSTED') || status === 429 || status === 403) {
        return 'Gemini quota is exhausted or rate-limited for the current API key. Billing or free-tier quota must be restored before requests can succeed.'
      }

      if (combined.includes('INVALID') || combined.includes('BAD REQUEST')) {
        return `Gemini request failed with status ${status}: the provided key or model configuration is invalid. Verify the API key, project access, and model name before retrying.`
      }

      return errorMessage || `Gemini request failed with status ${status}`
    }

    return `Gemini request failed with status ${status}`
  }

  const isQuotaExhausted = (data, status) => {
    const message = formatGeminiError(data, status)
    return message.includes('quota is exhausted') || status === 429 || status === 403
  }

  let listResp
  try {
    listResp = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`, { timeout: 20000 })
  } catch (error) {
    const status = error?.response?.status ?? 'unknown'
    const body = error?.response?.data ?? error?.message ?? 'unknown error'
    throw new Error(formatGeminiError(body, status))
  }

  const listData = listResp.data
  if (!Array.isArray(listData?.models)) {
    throw new Error('Unable to discover available Gemini models for this API key.')
  }

  const availableModels = listData.models
    .filter((model) => model && typeof model === 'object' && Array.isArray(model.supportedGenerationMethods) && model.supportedGenerationMethods.includes('generateContent'))
    .map((model) => getModelName(model))
    .filter((model) => model && isTextModel(model))

  if (availableModels.length === 0) {
    throw new Error('No supported text-generation Gemini models are available for this API key.')
  }

  const candidates = []
  if (GEMINI_MODEL) {
    const configuredModel = availableModels.find((model) => model === GEMINI_MODEL)
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
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`
    try {
      const response = await axios.post(url, requestBodyFor(input), {
        headers: { 'Content-Type': 'application/json' },
      })

      const text = parseAiResponseBody(response.data)
      if (text) {
        return text
      }
    } catch (error) {
      const status = error?.response?.status ?? 'unknown'
      const body = error?.response?.data ?? error?.message ?? 'unknown error'

      if (isQuotaExhausted(body, status)) {
        throw new Error(formatGeminiError(body, status))
      }

      if (status === 404) {
        continue
      }

      throw new Error(formatGeminiError(body, status))
    }
  }

  throw new Error('No supported Gemini text model produced a usable response for this request.')
}

async function callGrok(input) {
  if (!GROK_API_KEY) {
    throw new Error('GROK_API_KEY is not configured.')
  }

  const response = await axios.post(
    'https://api.x.ai/v1/responses',
    {
      model: GROK_MODEL,
      input,
    },
    {
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  )

  const output = parseAiResponseBody(response.data)
  return output || 'No response from Grok.'
}

function getTimestamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hour}${minute}${second}`
}

function getPassword(timestamp) {
  return Buffer.from(`${DARAJA_BUSINESS_SHORT_CODE}${DARAJA_PASSKEY}${timestamp}`).toString('base64')
}

app.post('/api/support/stk-push', async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference = 'NEXASTREAM_SUPPORT', transactionDesc = 'Support NEXASTREAM' } = req.body

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Phone number and amount are required.' })
    }

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)
    if (!normalizedPhoneNumber) {
      return res.status(400).json({ error: 'Please enter a valid Kenyan phone number.' })
    }

    const accessToken = await getDarajaAccessToken()
    const timestamp = getTimestamp()
    const password = getPassword(timestamp)

    const response = await axios.post(
      `${darajaBase}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: DARAJA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: normalizedPhoneNumber,
        PartyB: DARAJA_BUSINESS_SHORT_CODE,
        PhoneNumber: normalizedPhoneNumber,
        CallBackURL: DARAJA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return res.status(200).json(response.data)
  } catch (error) {
    const message = error?.response?.data || error?.message || 'Unexpected error'
    return res.status(500).json({ error: message })
  }
})

app.post('/api/ai', async (req, res) => {
  try {
    const { input } = req.body

    if (typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'input is required and must be a string.' })
    }

    const provider = getAiProvider()
    const output = provider === 'grok'
      ? await callGrok(input.trim())
      : await callGemini(input.trim())

    return res.status(200).json({ output, provider, model: provider === 'grok' ? GROK_MODEL : GEMINI_MODEL })
  } catch (error) {
    const message = error?.response?.data || error?.message || 'Unexpected error'
    const fallbackResponse = 'I’m unable to answer right now because the AI service is unavailable. Please try again in a moment.'
    const finalMessage = typeof message === 'string' && message.includes('Gemini')
      ? fallbackResponse
      : message

    return res.status(500).json({ error: finalMessage })
  }
})

app.post('/api/support/callback', (req, res) => {
  console.log('STK Push callback received:', JSON.stringify(req.body, null, 2))
  return res.status(200).json({ status: 'callback received' })
})

startServer(requestedPort)
