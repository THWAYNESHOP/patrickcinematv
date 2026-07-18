const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequest(context: { request: Request }) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: jsonHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: jsonHeaders,
    })
  }

  const body = await request.text().catch(() => '')

  console.log('STK Push callback received:', body)

  return new Response(JSON.stringify({ status: 'callback received' }), {
    status: 200,
    headers: jsonHeaders,
  })
}
