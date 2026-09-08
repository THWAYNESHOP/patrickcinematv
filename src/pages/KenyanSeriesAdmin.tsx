import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AdminEpisode {
  id: string
  series_id: string
  title: string
  thumbnail: string | null
  video_url: string
  air_date: string
  runtime: string | null
  part: number | null
  display_order: number | null
  is_published: boolean
}

const emptyEpisode: AdminEpisode = {
  id: '',
  series_id: 'ayana',
  title: '',
  thumbnail: '/ayana.jpg',
  video_url: '',
  air_date: new Date().toISOString().slice(0, 10),
  runtime: '45 min',
  part: null,
  display_order: null,
  is_published: true,
}

const seriesOptions = [
  { id: 'ayana', label: 'Ayana', poster: '/ayana.jpg' },
  { id: 'lulu', label: 'Lulu', poster: '/lulu.jpg' },
  { id: 'lazizi', label: 'Lazizi', poster: '/lazizi.jpg' },
  { id: 'second-family', label: 'Second Family', poster: '/secondfamily.jpeg' },
]

async function readApiResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()

  if (!text) {
    if (!response.ok) throw new Error(`Request failed (${response.status}).`)
    return null
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      response.status === 404
        ? 'The Kenyan Series admin API is not available on this local server.'
        : `The server returned an unexpected response (${response.status}).`,
    )
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error('The server returned invalid JSON.')
  }
}

export default function KenyanSeriesAdmin() {
  const { user, loading: authLoading, signIn } = useAuth()
  const [episodes, setEpisodes] = useState<AdminEpisode[]>([])
  const [form, setForm] = useState<AdminEpisode>(emptyEpisode)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInSubmitting, setSignInSubmitting] = useState(false)

  const getToken = async () => {
    if (!user) throw new Error('Sign in with an admin account first.')
    return user.getIdToken()
  }

  const loadEpisodes = async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const response = await fetch('/api/kenyan-series?admin=1', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await readApiResponse(response) as AdminEpisode[] | { error?: string } | null
      if (!response.ok) throw new Error(!Array.isArray(body) ? body?.error || 'Could not load episodes.' : 'Could not load episodes.')
      setEpisodes(Array.isArray(body) ? body : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load episodes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) void loadEpisodes()
  }, [user])

  const updateForm = (field: keyof AdminEpisode, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'part' || field === 'display_order' ? (value === '' ? null : Number(value)) : value,
    }))
  }

  const saveEpisode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const token = await getToken()
      const response = await fetch(`/api/kenyan-series${form.id ? `?id=${encodeURIComponent(form.id)}` : ''}`, {
        method: form.id && episodes.some((episode) => episode.id === form.id) ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
      const body = await readApiResponse(response) as { error?: string } | null
      if (!response.ok) throw new Error(body?.error || 'Could not save episode.')
      setMessage('Episode saved.')
      setForm({ ...emptyEpisode, series_id: form.series_id, thumbnail: seriesOptions.find((series) => series.id === form.series_id)?.poster || emptyEpisode.thumbnail })
      await loadEpisodes()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save episode.')
    } finally {
      setLoading(false)
    }
  }

  const deleteEpisode = async (episode: AdminEpisode) => {
    if (!window.confirm(`Delete ${episode.title}?`)) return
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const response = await fetch(`/api/kenyan-series?id=${encodeURIComponent(episode.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const body = await readApiResponse(response) as { error?: string } | null
        throw new Error(body?.error || 'Could not delete episode.')
      }
      setMessage('Episode deleted.')
      await loadEpisodes()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete episode.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSignInSubmitting(true)

    try {
      await signIn(signInEmail.trim(), signInPassword)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in with that admin account.')
    } finally {
      setSignInSubmitting(false)
    }
  }

  if (authLoading) return <div className="min-h-screen bg-deepBlack p-8 text-white">Checking admin session...</div>
  if (!user) return (
    <div className="min-h-screen bg-deepBlack px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30">
        <h1 className="text-3xl font-bold">Kenyan Series Admin</h1>
        <p className="mt-3 text-sm text-gray-400">Sign in with an administrator account to manage episodes.</p>

        <form onSubmit={handleAdminSignIn} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-200">Email</label>
            <input
              id="admin-email"
              type="email"
              value={signInEmail}
              onChange={(event) => setSignInEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none ring-0 placeholder:text-gray-500 focus:border-primary"
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-200">Password</label>
            <input
              id="admin-password"
              type="password"
              value={signInPassword}
              onChange={(event) => setSignInPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none ring-0 placeholder:text-gray-500 focus:border-primary"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={signInSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {signInSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-deepBlack px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Content management</p>
          <h1 className="mt-2 text-3xl font-bold">Kenyan Series Episodes</h1>
          <p className="mt-2 text-gray-400">Signed in as {user.email || 'administrator'}</p>
        </header>

        {error && <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
        {message && <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">{message}</div>}

        <form onSubmit={saveEpisode} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
          <h2 className="text-xl font-semibold md:col-span-2">{form.id ? 'Edit episode' : 'Add episode'}</h2>
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder="Stable ID, e.g. episode-51" value={form.id} onChange={(event) => updateForm('id', event.target.value)} required />
          <select className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" value={form.series_id} onChange={(event) => updateForm('series_id', event.target.value)}>
            {seriesOptions.map((series) => <option key={series.id} value={series.id}>{series.label}</option>)}
          </select>
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder="Episode title" value={form.title} onChange={(event) => updateForm('title', event.target.value)} required />
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder="Video embed URL" type="url" value={form.video_url} onChange={(event) => updateForm('video_url', event.target.value)} required />
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" type="date" value={form.air_date} onChange={(event) => updateForm('air_date', event.target.value)} required />
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder="Runtime" value={form.runtime || ''} onChange={(event) => updateForm('runtime', event.target.value)} />
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder="Part / episode number" type="number" value={form.part ?? ''} onChange={(event) => updateForm('part', event.target.value)} />
          <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder="Thumbnail URL" value={form.thumbnail || ''} onChange={(event) => updateForm('thumbnail', event.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-300 md:col-span-2"><input type="checkbox" checked={form.is_published} onChange={(event) => updateForm('is_published', event.target.checked)} /> Published</label>
          <div className="flex gap-3 md:col-span-2"><button className="rounded-lg bg-primary px-4 py-2 font-semibold text-black" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save episode'}</button><button className="rounded-lg border border-white/10 px-4 py-2" type="button" onClick={() => setForm(emptyEpisode)}>Clear</button></div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="text-xl font-semibold">Managed episodes</h2><button className="text-sm text-primary" type="button" onClick={() => void loadEpisodes()} disabled={loading}>Refresh</button></div>
          <div className="divide-y divide-white/10">
            {!episodes.length && <p className="p-5 text-gray-400">No Supabase episodes yet. Existing bundled episodes will remain visible until you add rows here.</p>}
            {episodes.map((episode) => <div key={episode.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-semibold">{episode.title}</p><p className="text-sm text-gray-400">{episode.series_id} · {episode.air_date} · {episode.is_published ? 'Published' : 'Draft'}</p></div><div className="flex gap-2"><button className="rounded-lg border border-white/10 px-3 py-1.5 text-sm" type="button" onClick={() => setForm(episode)}>Edit</button><button className="rounded-lg border border-red-400/30 px-3 py-1.5 text-sm text-red-200" type="button" onClick={() => void deleteEpisode(episode)}>Delete</button></div></div>)}
          </div>
        </section>
      </div>
    </div>
  )
}
