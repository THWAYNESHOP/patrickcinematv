import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomVideoPlayer from '../components/Player/CustomVideoPlayer'
import { resolveStreamSource } from '../lib/streamingResolver'

export default function WatchPage() {
  const { id } = useParams()
  const [source, setSource] = useState<Awaited<ReturnType<typeof resolveStreamSource>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const resolved = await resolveStreamSource({
        kind: 'movie',
        id: id || 'demo',
        title: 'Custom Watch Experience',
        providers: ['demo-hls'],
        fallbackProviders: ['demo-broken', 'demo-hls'],
      })
      setSource(resolved)
      setLoading(false)
    }

    void load()
  }, [id])

  const heroTitle = useMemo(() => source?.title || 'Watch', [source])

  if (loading) {
    return <div className="mx-auto flex min-h-screen items-center justify-center px-4 text-white">Loading player...</div>
  }

  if (!source) {
    return <div className="mx-auto flex min-h-screen items-center justify-center px-4 text-white">No stream available.</div>
  }

  return (
    <div className="min-h-screen bg-deepBlack px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h1 className="text-2xl font-semibold">{heroTitle}</h1>
          <p className="mt-2 text-sm text-gray-400">
            This watch page uses your own player and a normalized stream adapter so movies, live TV, and sports can all share one playback path.
          </p>
        </div>
        <CustomVideoPlayer src={source.streamUrl} title={source.title} poster={source.poster} streamType={source.streamType} />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
          <p className="font-medium text-white">Normalized source</p>
          <p className="mt-1">Provider: {source.provider || 'demo'}</p>
          <p className="mt-1">Type: {source.type}</p>
        </div>
      </div>
    </div>
  )
}
