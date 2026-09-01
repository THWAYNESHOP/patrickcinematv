// Cloudflare Functions middleware for CORS and security
export async function onRequest(context) {
  const { request } = context
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    })
  }
  
  // Add security headers
  const response = await context.next()
  
  const shouldHaveBody = response.status !== 204 && response.status !== 205 && response.status !== 304 && response.body !== null
  const newResponse = new Response(shouldHaveBody ? response.body : null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-XSS-Protection', '1; mode=block')
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return newResponse
}
