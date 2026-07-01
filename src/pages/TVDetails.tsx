import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Play, Plus, Check, ThumbsUp, Share2, Volume2, VolumeX, Calendar, Layers, ChevronDown } from 'lucide-react'
import StreamingPlayer from '../components/Player/StreamingPlayer'
import ServerSelector from '../components/Player/ServerSelector'
import { useStreamingProvider } from '../hooks/useStreamingProvider'
import DetailHero, { MetaStar } from '../components/Details/DetailHero'
import MediaRail from '../components/Details/MediaRail'
import CastRail from '../components/Details/CastRail'
import { IconAction, PlayButton } from '../components/Details/DetailActions'
import { MediaDetails, MovieSummary, tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'
import { useToast } from '../hooks/useToast'
import { useStore } from '../store/useStore'

const fallbackRecommendations: MovieSummary[] = [
  { id: 119051, title: 'Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021, type: 'tv' },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023, type: 'tv' },
]

export default function TVDetails() {
  const { id } = useParams()
  const [tv, setTV] = useState<MediaDetails | null>(null)
  const [recommendations, setRecommendations] = useState<MovieSummary[]>(fallbackRecommendations)
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [startProgressSeconds, setStartProgressSeconds] = useState<number>(0)
  const [playerError, setPlayerError] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const toast = useToast()
  const { selectedProviderId, setProvider, getEmbedUrl } = useStreamingProvider()
  const [trailer, setTrailer] = useState<{ key: string; embedUrl: string } | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()
  const setWatchProgress = useStore((state) => state.setWatchProgress)
  const getWatchProgress = useStore((state) => state.getWatchProgress)

  useEffect(() => {
    if (id === '119051') {
      setSelectedSeason(1)
      setSelectedEpisode(8)
    } else {
      setSelectedSeason(1)
      setSelectedEpisode(1)
    }
  }, [id])

  const handleProgress = (data: { progress: number; currentTime: number; duration: number }) => {
    setWatchProgress(`tv_${id}_${selectedSeason}_${selectedEpisode}`, data.progress)
  }

  const handlePlayerError = () => {
    setPlayerError(true)
  }

  const handleProviderChange = (newProviderId: string) => {
    setProvider(newProviderId)
    setPlayerError(false)
  }

  useEffect(() => {
    // Load saved progress from store
    const savedProgress = getWatchProgress(`tv_${id}_${selectedSeason}_${selectedEpisode}`)
    if (savedProgress > 0) {
      const episodeRuntime = 45 // Default 45 minutes per episode
      setStartProgressSeconds(Math.floor((savedProgress / 100) * episodeRuntime * 60))
    } else {
      setStartProgressSeconds(0)
    }
  }, [id, selectedSeason, selectedEpisode, getWatchProgress])

  useEffect(() => {
    async function fetchTV() {
      if (!id) return

      setLoading(true)
      setFetchError(null)
      try {
        const details = await tmdbApi.getTVDetails(id)
        setTV(details)
        const recommended = await tmdbApi.getTVRecommendations(id)
        const recentRecommendations = recommended.filter((item) => (item.year || 0) >= 2020)
        if (recentRecommendations.length) {
          setRecommendations(recentRecommendations)
        } else {
          const trendingToday = await tmdbApi.getTrendingTVToday()
          setRecommendations(trendingToday.length ? trendingToday : fallbackRecommendations)
        }

        // Fetch videos
        const videos = await tmdbApi.getTVVideos(id)
        if (import.meta.env.DEV) {
          console.log("TMDB Videos:", videos)
        }

        // Select best trailer: Official Trailer > Trailer > Teaser
        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube' && v.key)
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.key)
        const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube' && v.key)

        const selectedTrailer = officialTrailer || trailer || teaser

        if (selectedTrailer) {
          const embedUrl = `https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&showinfo=0&cc_load_policy=0&fs=0`
          if (import.meta.env.DEV) {
            console.log("Selected Trailer:", selectedTrailer)
            console.log("Trailer Embed URL:", embedUrl)
          }
          setTrailer({ key: selectedTrailer.key, embedUrl })

          // Show trailer after 2 seconds
          setTimeout(() => {
            setShowTrailer(true)
          }, 2000)
        } else {
          if (import.meta.env.DEV) {
            console.warn("No suitable trailer found")
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to fetch TV details.'
        if (import.meta.env.DEV) {
          console.warn('TV details unavailable, using fallback details:', error)
        }
        setFetchError('Unable to load TV details. Showing fallback content.')
        toast.error(`TV details failed: ${message}`)
        setTV({
          id: Number(id) || 0,
          title: 'TV Series',
          backdrop: 'https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
          poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
          overview: 'TV series details are unavailable right now.',
          rating: 'N/A',
          year: undefined,
          seasons: 1,
          genres: [],
          cast: [],
        })
        setRecommendations(fallbackRecommendations)
        if (import.meta.env.DEV) {
          console.warn("No trailer available for:", "tv", id)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTV()
  }, [id, retryCount, toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    )
  }

  if (!tv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">TV details are unavailable right now.</p>
      </div>
    )
  }

  const inMyList = isInMyList(id || '')

  const embedUrl = getEmbedUrl('tv', id || '', selectedSeason, selectedEpisode, {
    primaryColor: 'e50914',
    secondaryColor: '170000',
    iconColor: 'ffffff',
    autoplay: true,
    nextbutton: true,
    startAt: startProgressSeconds,
  })

  const handleMyList = () => {
    if (!tv || !id) return

    if (inMyList) {
      removeFromMyList(id)
      return
    }

    addToMyList({
      id,
      title: tv.title,
      poster: tv.poster,
      rating: tv.rating,
      year: tv.year,
      type: 'tv',
    })
  }

  const handleTrailer = () => {
    setShowTrailer(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShare = async () => {
    const shareData = { title: tv.title, text: tv.overview, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch {
      /* user dismissed share sheet */
    }
  }

  return (
    <div className="min-h-screen">
      {fetchError && (
        <div className="container mx-auto py-6 px-4 md:px-8">
          <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Unable to load TV details</p>
              <p className="mt-1 text-sm text-gray-200">{fetchError}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFetchError(null)
                setLoading(true)
                setRetryCount((prev) => prev + 1)
              }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <DetailHero
        backdrop={tv.backdrop}
        poster={tv.poster}
        title={tv.title}
        meta={[
          ...(tv.rating && tv.rating !== 'N/A' ? [{ icon: <MetaStar />, label: tv.rating }] : []),
          ...(tv.year ? [{ icon: <Calendar className="w-3.5 h-3.5" />, label: String(tv.year) }] : []),
          ...(tv.seasons ? [{ icon: <Layers className="w-3.5 h-3.5" />, label: `${tv.seasons} Season${tv.seasons > 1 ? 's' : ''}` }] : []),
        ]}
        genres={tv.genres}
        overview={tv.overview}
        trailer={trailer}
        showTrailer={showTrailer}
      >
        <PlayButton>
          <Play className="w-5 h-5 fill-black" />
          Play
        </PlayButton>
        <IconAction icon={<Play className="w-5 h-5" />} label="Trailer" onClick={handleTrailer} />
        <IconAction
          icon={inMyList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          label={inMyList ? 'In My List' : 'My List'}
          onClick={handleMyList}
          active={inMyList}
        />
        <IconAction icon={<ThumbsUp className="w-5 h-5" />} label="Like" />
        <IconAction icon={<Share2 className="w-5 h-5" />} label="Share" onClick={handleShare} />
        {trailer && showTrailer && (
          <IconAction
            icon={isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            label={isMuted ? 'Unmute' : 'Mute'}
            onClick={() => setIsMuted(!isMuted)}
          />
        )}
      </DetailHero>

      {/* Content */}
      <div className="container mx-auto py-8 md:py-12 px-4 md:px-8">
        {/* Video Player + info */}
        <section id="player" className="scroll-mt-24 mb-10 md:mb-12">
          <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
            <div className="lg:col-span-2">
              <div className="overflow-hidden border border-white/5 bg-darkSurface rounded-2xl">
                <div className="p-4 border-b border-white/5">
                  <ServerSelector
                    selectedProviderId={selectedProviderId}
                    onProviderChange={handleProviderChange}
                  />
                </div>
                <StreamingPlayer
                  key={`${selectedProviderId}-${id}-${selectedSeason}-${selectedEpisode}`}
                  src={embedUrl}
                  providerId={selectedProviderId}
                  onProgress={handleProgress}
                  onError={handlePlayerError}
                  className="rounded-b-2xl"
                />
              </div>
            </div>
            <aside className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Now Playing</p>
                <p className="text-lg font-bold text-white mb-3">Season {selectedSeason} · Episode {selectedEpisode}</p>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Rating</dt>
                    <dd className="text-gray-100 text-right font-medium">{tv.rating || 'N/A'}</dd>
                  </div>
                  {tv.year && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">First Aired</dt>
                      <dd className="text-gray-100 text-right font-medium">{tv.year}</dd>
                    </div>
                  )}
                  {tv.seasons && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Seasons</dt>
                      <dd className="text-gray-100 text-right font-medium">{tv.seasons}</dd>
                    </div>
                  )}
                  {tv.genres.length > 0 && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500 shrink-0">Genres</dt>
                      <dd className="text-gray-100 text-right font-medium">{tv.genres.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="rounded-2xl p-5 border border-white/5 bg-darkSurface">
                <h3 className="font-semibold mb-2 text-white text-sm">
                  {playerError ? 'Episode unavailable' : 'No sources for this episode?'}
                </h3>
                <p className="text-sm text-gray-400">
                  {playerError 
                    ? 'This episode is not available on VidLink. Try a different episode or save it to My List and check back later.'
                    : 'Try a different episode or save it to My List and come back later. Newer and niche episodes sometimes need time before alternate mirrors appear.'}
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* Episodes */}
        <section className="mb-10 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Episodes</h2>
            <div className="relative inline-flex w-fit">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                aria-label="Select season"
                className="appearance-none glass rounded-full pl-4 pr-10 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {Array.from({ length: tv.seasons || 1 }).map((_, i) => (
                  <option key={i} value={i + 1} className="bg-darkSurface text-white">
                    Season {i + 1}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 10 }).map((_, i) => {
              const episodeNumber = i + 1
              const isSelected = selectedEpisode === episodeNumber
              const progressKey = `tv_${id}_${selectedSeason}_${episodeNumber}`
              const savedProgress = useStore.getState().getWatchProgress(progressKey)
              const progressPercent = Math.floor(savedProgress || 0)

              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedEpisode(episodeNumber)
                    document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={`rounded-2xl p-3 flex gap-3 transition-all duration-200 w-full text-left border group ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-darkSurface border-white/5 hover:bg-darkHover hover:border-white/10'
                  }`}
                >
                  <div className="w-28 sm:w-32 aspect-video bg-gradient-to-br from-darkHover to-darkElevated rounded-xl flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-white/20">{episodeNumber}</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    {progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                        <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-white truncate">Episode {episodeNumber}</h3>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold shrink-0">Playing</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">Watch season {selectedSeason}, episode {episodeNumber}.</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">45 min</span>
                      {progressPercent > 0 && progressPercent < 90 && (
                        <span className="text-primary font-medium">Resume · {progressPercent}%</span>
                      )}
                      {progressPercent >= 90 && (
                        <span className="text-green-400 font-medium">Watched</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <CastRail cast={tv.cast} />

        <MediaRail title="More Like This" items={recommendations} type="tv" />
      </div>
    </div>
  )
}
