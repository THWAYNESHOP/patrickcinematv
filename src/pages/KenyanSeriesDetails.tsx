import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, Clock3, Play, Plus, Share2, Volume2, VolumeX, X } from 'lucide-react'
import DetailHero, { MetaStar } from '../components/Details/DetailHero'
import MediaRail from '../components/Details/MediaRail'
import { IconAction, PlayButton } from '../components/Details/DetailActions'
import { useMyList } from '../hooks/useMyList'
import { useToast } from '../hooks/useToast'
import { useStore } from '../store/useStore'
import { getKenyanSeriesItem, getOrderedKenyanSeriesItems } from '../data/kenyanSeries'
import type { MovieSummary } from '../api/tmdb'

interface AyanaEpisode {
  id: string
  title: string
  thumbnail: string
  youtubeUrl: string
  date: string
  runtime?: string
  part?: number
}

const ayanaEpisodes: AyanaEpisode[] = [
  {
    id: 'part-1',
    title: 'AYANA | Citizen TV | Wednesday 8th July | Part 1',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/LhPIIBulRGc?si=iX6XmaWvjzKMeb4S',
    date: '2026-07-08',
    runtime: '45 min',
    part: 1,
  },
  {
    id: 'part-2',
    title: 'AYANA | Citizen TV | Wednesday 8th July | Part 2',
    thumbnail: '/ayana.jpg',
    youtubeUrl: 'https://youtu.be/1oBjuJnN8As?si=zgE1IvLoRLGOSfko',
    date: '2026-07-08',
    runtime: '45 min',
    part: 2,
  },
]

const luluEpisodes: AyanaEpisode[] = [
  {
    id: 'episode-12',
    title: '6TH MONDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/QLtR4_5HOnw?si=gmhbgLaMwe206GYe',
    date: '2026-07-06',
    runtime: '27 min',
  },
  {
    id: 'episode-13',
    title: '7TH TUESDAY',
    thumbnail: '/lulu.jpg',
    youtubeUrl: 'https://youtu.be/MtiY2BnuUfQ?si=kcPg620rSX4bXVYl',
    date: '2026-07-07',
    runtime: '27 min',
  },
]

const laziziEpisodes: AyanaEpisode[] = [
  {
    id: 'episode-13',
    title: '6TH MONDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/1zh1FNGcWgg?si=_iBSbsPEXS_sAdMS',
    date: '2026-07-06',
    runtime: '27 min',
  },
  {
    id: 'episode-14',
    title: '7TH TUESDAY',
    thumbnail: '/lazizi.jpg',
    youtubeUrl: 'https://youtu.be/ejlgwFm4Kqo?si=BiCk8vS7-F8UA0WB',
    date: '2026-07-07',
    runtime: '27 min',
  },
]

const sortEpisodes = (episodes: AyanaEpisode[]) => [...episodes].sort((a, b) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
  if (dateDiff !== 0) return dateDiff
  return (a.part ?? 0) - (b.part ?? 0)
})

const getSeriesEpisodes = (seriesId?: string): AyanaEpisode[] => {
  if (seriesId === 'lulu') return sortEpisodes(luluEpisodes)
  if (seriesId === 'lazizi') return sortEpisodes(laziziEpisodes)
  if (seriesId === 'ayana') return sortEpisodes(ayanaEpisodes)
  return []
}

const recommendedSeries: MovieSummary[] = getOrderedKenyanSeriesItems()
  .filter((item) => item.id !== 'ayana')
  .slice(0, 6)
  .map((item) => ({
    id: item.id,
    title: item.title,
    poster: item.poster,
    rating: '8.5',
    year: item.year,
    type: 'tv' as const,
  }))

export default function KenyanSeriesDetails() {
  const { id } = useParams()
  const [selectedEpisodeId, setSelectedEpisodeId] = useState('')
  const [showTrailer, setShowTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlayerActive, setIsPlayerActive] = useState(false)
  const [, setIsPlayerExpanded] = useState(false)
  const item = useMemo(() => getKenyanSeriesItem(id), [id])
  const toast = useToast()
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()
  const setWatchProgress = useStore((state) => state.setWatchProgress)
  const getWatchProgress = useStore((state) => state.getWatchProgress)
  const continueWatching = useStore((state) => state.continueWatching)

  const sortedEpisodes = useMemo(() => getSeriesEpisodes(item?.id), [item?.id])
  const selectedEpisode = sortedEpisodes.find((episode) => episode.id === selectedEpisodeId) ?? sortedEpisodes[0]

  useEffect(() => {
    if (!sortedEpisodes.length) return

    setSelectedEpisodeId((current) => {
      if (current && sortedEpisodes.some((episode) => episode.id === current)) {
        return current
      }
      return sortedEpisodes[0].id
    })
  }, [sortedEpisodes])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowTrailer(true)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [id])
  const getYoutubeEmbedUrl = (youtubeUrl?: string, disableSubtitles = false) => {
    if (!youtubeUrl) return ''

    const youtubeMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/)
    if (!youtubeMatch?.[1]) return ''

    const params = new URLSearchParams()
    params.set('autoplay', '1')
    params.set('mute', '0')
    params.set('controls', '1')
    params.set('rel', '0')
    params.set('modestbranding', '1')
    params.set('playsinline', '1')
    params.set('iv_load_policy', '3')
    if (disableSubtitles) params.set('cc_load_policy', '0')
    params.set('disablekb', '1')
    params.set('fs', '1')
    try {
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        params.set('origin', window.location.origin)
      }
    } catch {
      // ignore
    }

    return `https://www.youtube.com/embed/${youtubeMatch[1]}?${params.toString()}`
  }

  const trailerSrc = useMemo(() => {
    if (!item) return ''
    return getYoutubeEmbedUrl(item.youtubeUrl, item.id === 'lazizi')
  }, [item])

  const selectedEpisodeEmbedUrl = useMemo(() => {
    return getYoutubeEmbedUrl(selectedEpisode?.youtubeUrl, item?.id === 'lazizi')
  }, [selectedEpisode?.youtubeUrl, item?.id])

  const trailer = trailerSrc ? { key: `${item?.id ?? 'series'}-trailer`, embedUrl: trailerSrc } : null
  const inMyList = isInMyList(id || '')
  const progressKey = item ? `${item.id}_episode_${selectedEpisode?.id ?? 'latest'}` : `series_episode_latest`
  const progress = getWatchProgress(progressKey)

  if (!item) {
    return (
      <div className="min-h-screen bg-deepBlack px-4 py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-lg font-semibold">Series not found</p>
          <p className="text-sm text-gray-400">The Kenyan series you’re looking for isn’t available yet.</p>
          <Link to="/kenyan-series" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Kenyan Series
          </Link>
        </div>
      </div>
    )
  }

  const handleWatch = (episode: AyanaEpisode) => {
    setSelectedEpisodeId(episode.id)
    setShowTrailer(false)
    setIsPlayerActive(true)
    setIsPlayerExpanded(true)
    if (item) {
      setWatchProgress(`${item.id}_episode_${episode.id}`, 0)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMyList = () => {
    if (!item || !id) return

    if (inMyList) {
      removeFromMyList(id)
      return
    }

    addToMyList({ id, title: item.title, poster: item.poster, rating: '8.5', year: item.year, type: 'tv' })
  }

  const handleShare = async () => {
    const shareData = { title: item.title, text: item.overview, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch {
      /* dismissed */
    }
  }

  const handleTrailer = () => {
    setShowTrailer(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinue = () => {
    if (!selectedEpisode) return
    setSelectedEpisodeId(selectedEpisode.id)
    setShowTrailer(false)
    setIsPlayerActive(true)
    setIsPlayerExpanded(true)
    toast.success('Resumed from your latest watch position')
  }

  const currentIndex = sortedEpisodes.findIndex((episode) => episode.id === selectedEpisode?.id)
  const previousEpisode = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : undefined
  const nextEpisode = currentIndex >= 0 && currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : undefined

  return (
    <div className="min-h-screen bg-deepBlack text-white">
      <DetailHero
        backdrop={item.backdrop}
        poster={item.poster}
        title={item.title}
        meta={[
          { icon: <MetaStar />, label: '8.5' },
          { icon: <Calendar className="w-3.5 h-3.5" />, label: String(item.year) },
          { icon: <Clock3 className="w-3.5 h-3.5" />, label: item.runtime ?? '45 min' },
        ]}
        genres={item.genre.split('•').map((entry) => entry.trim()).filter(Boolean)}
        overview={item.overview}
        trailer={trailer}
        showTrailer={showTrailer}
        topBadges={['Citizen TV', 'Kenyan Series']}
      >
        <PlayButton onClick={handleContinue}>
          <Play className="w-5 h-5 fill-black" />
          Play Latest Episode
        </PlayButton>
        <IconAction icon={<Play className="w-5 h-5" />} label="Trailer" onClick={handleTrailer} />
        <IconAction icon={inMyList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />} label={inMyList ? 'In My List' : 'My List'} onClick={handleMyList} active={inMyList} />
        <IconAction icon={<Share2 className="w-5 h-5" />} label="Share" onClick={handleShare} />
        {trailer && showTrailer && (
          <IconAction icon={isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />} label={isMuted ? 'Unmute' : 'Mute'} onClick={() => setIsMuted(!isMuted)} />
        )}
      </DetailHero>

      <div className="container mx-auto px-3 py-6 sm:px-4 md:px-8 md:py-8">
        <section className="mb-8 md:mb-10">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Now Playing</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{selectedEpisode?.title}</h2>
                </div>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden bg-black">
              {isPlayerActive && selectedEpisode?.youtubeUrl ? (
                <div className="relative h-full w-full">
                  <iframe
                    title={`${item.title} episode player`}
                    src={selectedEpisodeEmbedUrl || ''}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="h-full w-full"
                  />
                  <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-white/10 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 backdrop-blur">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Now Playing</p>
                      <p className="text-sm font-semibold text-white">{selectedEpisode?.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayerActive(false)
                        setIsPlayerExpanded(false)
                      }}
                      className="rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/20"
                      aria-label="Close player"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-black via-black/90 to-primary/20 p-4">
                  <div className="max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Episode player</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{selectedEpisode?.title}</h3>
                    <p className="mt-2 text-sm text-gray-300">Tap below to launch the premium episode player and start watching.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayerActive(true)
                        setIsPlayerExpanded(true)
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 fill-black" />
                      Play Episode
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <Calendar className="h-4 w-4 text-primary" /> {selectedEpisode?.date}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {previousEpisode && (
                  <button type="button" onClick={() => handleWatch(previousEpisode)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">Previous Episode</button>
                )}
                {nextEpisode && (
                  <button type="button" onClick={() => handleWatch(nextEpisode)} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">Next Episode</button>
                )}
                <Link to="/kenyan-series" className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/20">Back to Kenyan Series</Link>
              </div>
            </div>
          </div>
        </section>

        {continueWatching.length > 0 && (
          <section className="mb-8 md:mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Continue Watching</h2>
              <span className="text-sm text-gray-400">Resume from your last position</span>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-gray-400">Progress saved: {Math.round(progress)}%</p>
                </div>
                <button type="button" onClick={handleContinue} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary/90">Resume</button>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8 md:mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Latest Episodes</h2>
            <p className="text-sm text-gray-400">Newest uploads first</p>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedEpisodes.map((episode) => (
              <article key={episode.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20">
                <img src={episode.thumbnail} alt={episode.title} className="h-20 w-full object-cover sm:h-24" />
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <p className="text-xs font-semibold text-primary">{episode.date}</p>
                  <h3 className="mt-1 text-sm font-semibold leading-tight text-white">{episode.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleWatch(episode)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-primary/90">Watch</button>
                    <button type="button" onClick={() => handleWatch(episode)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10">Open</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <MediaRail title="More Kenyan Series" items={recommendedSeries} type="tv" basePath="/kenyan-series" />
      </div>
    </div>
  )
}
