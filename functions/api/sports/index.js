// Cloudflare Function for Sports API proxy with rate limiting
export async function onRequest(context) {
  const { request, env } = context
  
  // Rate limiting using Cloudflare KV
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'
  const rateLimitKey = `rate-limit:${clientIP}`
  
  try {
    // Check rate limit (100 requests per minute)
    const { get, put } = context.env.RATE_LIMIT || { get: async () => null, put: async () => {} }
    const current = await get(rateLimitKey)
    const count = current ? parseInt(current) : 0
    
    if (count >= 100) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60'
        }
      })
    }
    
    // Increment counter
    await put(rateLimitKey, String(count + 1), { expirationTtl: 60 })
    
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/sports', '')
    const sportsUrl = `https://streamed.pk/api${path}`
    
    const response = await fetch(sportsUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NexaStream/1.0'
      }
    })
    
    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'RateLimit-Limit': '100',
        'RateLimit-Remaining': String(99 - count)
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from sports API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
