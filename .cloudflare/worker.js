export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', message: 'Proxy worker is running' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Stream proxy endpoint
    if (url.pathname === '/api/stream') {
      const streamUrl = url.searchParams.get('url');
      
      if (!streamUrl) {
        return new Response(JSON.stringify({ error: 'No URL provided' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      try {
        const response = await fetch(streamUrl, {
          headers: {
            'User-Agent': 'Lavf/56.15.102',
            'Referer': streamUrl,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Create a new response with CORS headers
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...response.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });

        return newResponse;
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Proxy error', message: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
