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

async function getDarajaAccessToken() {
  const auth = Buffer.from(`${DARAJA_CONSUMER_KEY}:${DARAJA_CONSUMER_SECRET}`).toString('base64')
  const response = await axios.get(`${darajaBase}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
  return response.data.access_token
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

app.post('/api/support/callback', (req, res) => {
  console.log('STK Push callback received:', JSON.stringify(req.body, null, 2))
  return res.status(200).json({ status: 'callback received' })
})

startServer(requestedPort)
