import express from 'express'

const router = express.Router()

function getConfig() {
  return {
    supabaseUrl: String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, ''),
    serviceKey: String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''),
    firebaseApiKey: String(process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || ''),
    adminEmails: String(process.env.KENYAN_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  }
}

function sendJson(response, body, status = 200) {
  return response.status(status).type('application/json').send(body)
}

async function verifyAdmin(request) {
  const token = request.get('Authorization')?.replace(/^Bearer\s+/i, '')
  const config = getConfig()

  if (!token || !config.firebaseApiKey || !config.adminEmails.length) {
    return { ok: false, status: 401, message: 'Admin authentication is not configured.' }
  }

  const firebaseResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(config.firebaseApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    },
  )

  if (!firebaseResponse.ok) {
    return { ok: false, status: 401, message: 'Invalid Firebase session.' }
  }

  const data = await firebaseResponse.json()
  const email = String(data.users?.[0]?.email || '').toLowerCase()
  if (!email || !config.adminEmails.includes(email)) {
    return { ok: false, status: 403, message: 'Admin access is required.' }
  }

  return { ok: true, config }
}

async function supabaseRequest(config, path, options = {}) {
  if (!config.supabaseUrl || !config.serviceKey) {
    throw new Error('Supabase server configuration is missing.')
  }

  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(body?.message || body?.hint || 'Supabase request failed.')
  }
  return body
}

function normalizeEpisode(input) {
  const episode = {
    id: String(input.id || '').trim(),
    series_id: String(input.series_id || '').trim(),
    title: String(input.title || '').trim(),
    thumbnail: String(input.thumbnail || '').trim(),
    video_url: String(input.video_url || '').trim(),
    air_date: String(input.air_date || '').trim(),
    runtime: String(input.runtime || '').trim(),
    part: input.part === '' || input.part == null ? null : Number(input.part),
    display_order: input.display_order === '' || input.display_order == null ? null : Number(input.display_order),
    is_published: input.is_published !== false,
  }

  if (!episode.id || !episode.series_id || !episode.title || !episode.video_url || !episode.air_date) {
    throw new Error('id, series_id, title, video_url, and air_date are required.')
  }
  if (!/^https?:\/\//i.test(episode.video_url)) {
    throw new Error('video_url must be an http or https URL.')
  }
  return episode
}

router.all('/', async (request, response) => {
  try {
    const url = new URL(request.originalUrl, 'http://localhost')
    const config = getConfig()

    if (request.method === 'GET') {
      let isAdmin = false
      if (url.searchParams.get('admin') === '1') {
        const auth = await verifyAdmin(request)
        if (!auth.ok) return sendJson(response, { error: auth.message }, auth.status)
        isAdmin = true
      }

      const filters = []
      const seriesId = url.searchParams.get('series_id')
      if (seriesId) filters.push(`series_id=eq.${encodeURIComponent(seriesId)}`)
      if (!isAdmin) filters.push('is_published=eq.true')
      const query = filters.length
        ? `?${filters.join('&')}&order=air_date.desc,display_order.desc`
        : '?order=air_date.desc,display_order.desc'
      const rows = await supabaseRequest(config, `kenyan_series_episodes${query}`)
      return sendJson(response, rows)
    }

    const auth = await verifyAdmin(request)
    if (!auth.ok) return sendJson(response, { error: auth.message }, auth.status)

    const id = url.searchParams.get('id')
    if (request.method === 'POST') {
      const episode = normalizeEpisode(request.body)
      const rows = await supabaseRequest(config, 'kenyan_series_episodes?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(episode),
      })
      return sendJson(response, rows?.[0] || episode, 201)
    }

    if (!id) return sendJson(response, { error: 'Episode id is required.' }, 400)
    if (request.method === 'DELETE') {
      await supabaseRequest(config, `kenyan_series_episodes?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      })
      return response.status(204).send()
    }

    if (request.method === 'PATCH') {
      const episode = normalizeEpisode({ ...request.body, id })
      const rows = await supabaseRequest(config, `kenyan_series_episodes?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(episode),
      })
      return sendJson(response, rows?.[0] || episode)
    }

    return sendJson(response, { error: 'Method not allowed.' }, 405)
  } catch (error) {
    return sendJson(response, { error: error instanceof Error ? error.message : 'Request failed.' }, 500)
  }
})

export default router
