// Cloudflare Function for TMDB API proxy
export async function onRequest(context) {
  const { request, env } = context
  const TMDB_API_KEY = env.TMDB_API_KEY
  
  if (!TMDB_API_KEY) {
    return new Response(JSON.stringify({ error: 'TMDB API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/tmdb', '')
    const searchParams = url.searchParams
    
    // Add API key to params
    searchParams.set('api_key', TMDB_API_KEY)
    
    const tmdbUrl = `https://api.themoviedb.org/3${path}?${searchParams.toString()}`
    
    const response = await fetch(tmdbUrl, {
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
        'RateLimit-Remaining': '99'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from TMDB' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
