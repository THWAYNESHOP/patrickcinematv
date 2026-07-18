import {
  SupportEnv,
  getDarajaBase,
  getDarajaAccessToken,
  getPassword,
  normalizePhoneNumber,
  validateEnv,
} from './utils'

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequest(context: {
  request: Request
  env: SupportEnv
}) {
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

  const { phoneNumber, amount, accountReference = 'NEXASTREAM_SUPPORT', transactionDesc = 'Support NEXASTREAM' } = payload as Record<string, unknown>
  if (typeof phoneNumber !== 'string' || typeof amount !== 'number') {
    return new Response(JSON.stringify({ error: 'phoneNumber and amount are required' }), {
      status: 400,
      headers: jsonHeaders,
    })
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)
  if (!normalizedPhoneNumber) {
    return new Response(JSON.stringify({ error: 'Please enter a valid Kenyan phone number.' }), {
      status: 400,
      headers: jsonHeaders,
    })
  }

  try {
    const accessToken = await getDarajaAccessToken(env)
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)

    const darajaTimestamp = `${timestamp.slice(0, 8)}${timestamp.slice(8)}`
    const password = getPassword(env.DARAJA_BUSINESS_SHORT_CODE!, env.DARAJA_PASSKEY!, darajaTimestamp)

    const response = await fetch(`${getDarajaBase(env)}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: env.DARAJA_BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: darajaTimestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: normalizedPhoneNumber,
        PartyB: env.DARAJA_BUSINESS_SHORT_CODE,
        PhoneNumber: normalizedPhoneNumber,
        CallBackURL: env.DARAJA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    })

    const responseBody = await response.text().catch(() => '')
    const data = responseBody ? JSON.parse(responseBody) : null

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data || responseBody || 'Daraja request failed' }), {
        status: 502,
        headers: jsonHeaders,
      })
    }

    return new Response(JSON.stringify(data), {
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
