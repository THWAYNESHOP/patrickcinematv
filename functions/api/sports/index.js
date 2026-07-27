// Cloudflare Function for Sports API proxy with rate limiting
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

function createProxyHeaders(response, count) {
  const headers = new Headers(CORS_HEADERS)
  const contentType = response.headers.get('content-type')
  const cacheControl = response.headers.get('cache-control')
  const etag = response.headers.get('etag')
  const lastModified = response.headers.get('last-modified')

  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  if (cacheControl) {
    headers.set('Cache-Control', cacheControl)
  } else if (contentType?.startsWith('image/')) {
    headers.set('Cache-Control', 'public, max-age=86400')
  }

  if (etag) {
    headers.set('ETag', etag)
  }

  if (lastModified) {
    headers.set('Last-Modified', lastModified)
  }

  headers.set('RateLimit-Limit', '100')
  headers.set('RateLimit-Remaining', String(Math.max(0, 99 - count)))

  return headers
}

function isTextResponse(contentType) {
  return !contentType || /^(application\/json|application\/.*\+json|text\/)/i.test(contentType)
}

export async function onRequest(context) {
  const { request, env = {} } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    })
  }

  // Rate limiting using Cloudflare KV
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'
  const rateLimitKey = `rate-limit:${clientIP}`

  try {
    const { get, put } = env.RATE_LIMIT || { get: async () => null, put: async () => {} }
    const current = await get(rateLimitKey)
    const parsedCount = current ? Number.parseInt(current, 10) : 0
    const count = Number.isFinite(parsedCount) ? parsedCount : 0

    if (count >= 100) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
          'Retry-After': '60',
          'RateLimit-Limit': '100',
          'RateLimit-Remaining': '0'
        }
      })
    }

    await put(rateLimitKey, String(count + 1), { expirationTtl: 60 })

    const url = new URL(request.url)
    const pathname = url.pathname.replace(/^\/api\/sports/, '') || '/'
    const query = url.search
    const sportsUrl = `https://streamed.pk/api${pathname}${query}`

    const response = await fetch(sportsUrl, {
      method: request.method,
      headers: {
        'Accept': request.headers.get('Accept') || '*/*',
        'User-Agent': 'NexaStream/1.0'
      }
    })

    const contentType = response.headers.get('content-type') || ''
    const headers = createProxyHeaders(response, count)
    const body = isTextResponse(contentType)
      ? await response.text()
      : await response.arrayBuffer()

    return new Response(body, {
      status: response.status,
      headers
    })
  } catch (error) {
    console.error('Sports proxy error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch from sports API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    })
  }
}
