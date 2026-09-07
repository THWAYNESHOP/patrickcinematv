type Env = Record<string, string | undefined>

interface SupabaseConfig {
  supabaseUrl: string
  serviceKey: string
  firebaseApiKey: string
  adminEmails: string[]
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const getConfig = (env: Env): SupabaseConfig => ({
  supabaseUrl: String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, ''),
  serviceKey: String(env.SUPABASE_SERVICE_ROLE_KEY || ''),
  firebaseApiKey: String(env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || ''),
  adminEmails: String(env.KENYAN_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
})

async function verifyAdmin(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  const config = getConfig(env)

  if (!token || !config.firebaseApiKey || !config.adminEmails.length) {
    return { ok: false, status: 401, message: 'Admin authentication is not configured.' }
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(config.firebaseApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    },
  )

  if (!response.ok) {
    return { ok: false, status: 401, message: 'Invalid Firebase session.' }
  }

  const data = await response.json() as { users?: Array<{ email?: string }> }
  const email = String(data.users?.[0]?.email || '').toLowerCase()
  if (!email || !config.adminEmails.includes(email)) {
    return { ok: false, status: 403, message: 'Admin access is required.' }
  }

  return { ok: true, config, email }
}

async function supabaseRequest(config: SupabaseConfig, path: string, options: RequestInit = {}) {
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
  const body = text ? JSON.parse(text) as unknown : null
  if (!response.ok) {
    const errorBody = body as { message?: string; hint?: string } | null
    throw new Error(errorBody?.message || errorBody?.hint || 'Supabase request failed.')
  }

  return body
}

function normalizeEpisode(input: Record<string, unknown>) {
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

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context
  const url = new URL(request.url)
  const seriesId = url.searchParams.get('series_id')
  const wantsAdmin = url.searchParams.get('admin') === '1'
  const config = getConfig(env)

  try {
    if (request.method === 'GET') {
      let isAdmin = false
      if (wantsAdmin) {
        const auth = await verifyAdmin(request, env)
        if (!auth.ok) return json({ error: auth.message }, auth.status)
        isAdmin = true
      }

      const filters = []
      if (seriesId) filters.push(`series_id=eq.${encodeURIComponent(seriesId)}`)
      if (!isAdmin) filters.push('is_published=eq.true')
      const query = filters.length ? `?${filters.join('&')}&order=air_date.desc,display_order.desc` : '?order=air_date.desc,display_order.desc'
      const rows = await supabaseRequest(config, `kenyan_series_episodes${query}`, { headers: { Prefer: 'return=representation' } }) as unknown[]
      return json(rows)
    }

    const auth = await verifyAdmin(request, env)
    if (!auth.ok) return json({ error: auth.message }, auth.status)

    if (request.method === 'POST') {
      const episode = normalizeEpisode(await request.json())
      const rows = await supabaseRequest(config, 'kenyan_series_episodes?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(episode),
      }) as Array<Record<string, unknown>>
      return json(rows?.[0] || episode, 201)
    }

    const id = url.searchParams.get('id')
    if (!id) return json({ error: 'Episode id is required.' }, 400)

    if (request.method === 'DELETE') {
      await supabaseRequest(config, `kenyan_series_episodes?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      })
      return new Response(null, { status: 204 })
    }

    if (request.method === 'PATCH') {
      const episode = normalizeEpisode({ ...(await request.json()), id })
      const rows = await supabaseRequest(config, `kenyan_series_episodes?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(episode),
      }) as Array<Record<string, unknown>>
      return json(rows?.[0] || episode)
    }

    return json({ error: 'Method not allowed.' }, 405)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Request failed.' }, 500)
  }
}
