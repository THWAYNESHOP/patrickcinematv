export async function onRequest(context) {
  const { request } = context

  try {
    const url = new URL(request.url)
    const pathname = url.pathname.replace(/^\/api\/sports/, '') || '/'
    const query = url.search
    const sportsUrl = `https://streamed.pk/api${pathname}${query}`

    const response = await fetch(sportsUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NexaStream/1.0'
      }
    })

    const responseText = await response.text()
    const contentType = response.headers.get('content-type') || 'application/json'
    const data = contentType.includes('application/json') ? JSON.parse(responseText || '{}') : responseText

    return new Response(typeof data === 'string' ? data : JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': contentType.includes('application/json') ? 'application/json' : contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    })
  } catch (error) {
    console.error('Sports proxy error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch from sports API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
