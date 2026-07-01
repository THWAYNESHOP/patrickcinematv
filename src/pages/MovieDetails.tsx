import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Play, Plus, Check, ThumbsUp, Share2, Volume2, VolumeX, Clock, Calendar } from 'lucide-react'
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

const recommendedMovies = [
  { id: 1078605, title: 'Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rating: '8.0', year: 2024, type: 'movie' as const },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rating: '8.2', year: 2024, type: 'movie' as const },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: '8.1', year: 2023, type: 'movie' as const },
  { id: 157336, title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: '8.4', year: 2014, type: 'movie' as const },
  { id: 299536, title: 'Avengers: Infinity War', poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: '8.2', year: 2018, type: 'movie' as const },
  { id: 550, title: 'Fight Club', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: '8.4', year: 1999, type: 'movie' as const },
]

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState<MediaDetails | null>(null)
  const [recommendations, setRecommendations] = useState<MovieSummary[]>(recommendedMovies)
  const [loading, setLoading] = useState(true)
  const [startProgressSeconds, setStartProgressSeconds] = useState<number>(0)
  const [playerError, setPlayerError] = useState(false)
  const { selectedProviderId, setProvider, getEmbedUrl } = useStreamingProvider()
  const [trailer, setTrailer] = useState<{ key: string; embedUrl: string } | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const toast = useToast()
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()

  const setWatchProgress = useStore((state) => state.setWatchProgress)
  const getWatchProgress = useStore((state) => state.getWatchProgress)

  const handleProgress = (data: { progress: number; currentTime: number; duration: number }) => {
    setWatchProgress(`movie_${id}`, data.progress)
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
    const savedProgress = getWatchProgress(`movie_${id}`)
    if (savedProgress > 0) {
      const runtime = Number(movie?.runtime) || 120
      setStartProgressSeconds(Math.floor((savedProgress / 100) * runtime * 60))
    } else {
      setStartProgressSeconds(0)
    }
  }, [id, movie, getWatchProgress])

  useEffect(() => {
    async function fetchMovie() {
      if (!id) return

      setLoading(true)
      setFetchError(null)
      try {
        const details = await tmdbApi.getMovieDetails(id)
        setMovie(details)
        const recommended = await tmdbApi.getMovieRecommendations(id)
        const recentRecommendations = recommended.filter((item) => (item.year || 0) >= 2020)
        if (recentRecommendations.length) {
          setRecommendations(recentRecommendations)
        } else {
          const trendingToday = await tmdbApi.getTrendingMoviesToday()
          setRecommendations(trendingToday.length ? trendingToday : recommendedMovies)
        }

        // Fetch videos
        const videos = await tmdbApi.getMovieVideos(id)
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
        const message = error instanceof Error ? error.message : 'Unable to fetch movie details.'
        if (import.meta.env.DEV) {
          console.warn('Movie details unavailable, using fallback details:', error)
        }
        setFetchError('Unable to load movie details. Showing fallback content.')
        toast.error(`Movie load failed: ${message}`)
        setMovie({
          id: Number(id) || 0,
          title: 'Movie',
          backdrop: 'https://image.tmdb.org/t/p/original/8cXbitsS6dWQ5gfMTZdorpAAzEd.jpg',
          poster: 'https://image.tmdb.org/t/p/w500/8cXbitsS6dWQ5gfMTZdorpAAzEd.jpg',
          overview: 'Movie details are unavailable right now.',
          rating: 'N/A',
          year: undefined,
          runtime: undefined,
          genres: [],
          cast: [],
        })
        setRecommendations(recommendedMovies)
        if (import.meta.env.DEV) {
          console.warn("No trailer available for:", "movie", id)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id, retryCount, toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Movie details are unavailable right now.</p>
      </div>
    )
  }

  const inMyList = isInMyList(id || '')

  const embedUrl = getEmbedUrl('movie', id || '', undefined, undefined, {
    primaryColor: 'e50914',
    secondaryColor: '170000',
    iconColor: 'ffffff',
    autoplay: true,
    startAt: startProgressSeconds,
  })

  const handleMyList = () => {
    if (!movie || !id) return

    if (inMyList) {
      removeFromMyList(id)
      return
    }

    addToMyList({
      id,
      title: movie.title,
      poster: movie.poster,
      rating: movie.rating,
      year: movie.year,
      type: 'movie',
    })
  }

  const handleTrailer = () => {
    setShowTrailer(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShare = async () => {
    const shareData = { title: movie.title, text: movie.overview, url: window.location.href }
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
              <p className="text-sm font-semibold text-primary">Unable to load movie details</p>
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
        backdrop={movie.backdrop}
        poster={movie.poster}
        title={movie.title}
        meta={[
          ...(movie.rating && movie.rating !== 'N/A' ? [{ icon: <MetaStar />, label: movie.rating }] : []),
          ...(movie.year ? [{ icon: <Calendar className="w-3.5 h-3.5" />, label: String(movie.year) }] : []),
          ...(movie.runtime ? [{ icon: <Clock className="w-3.5 h-3.5" />, label: movie.runtime }] : []),
        ]}
        genres={movie.genres}
        overview={movie.overview}
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
        {/* Video Player */}
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
                  key={`${selectedProviderId}-${id}`}
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
                <h3 className="font-semibold mb-3 text-white">About {movie.title}</h3>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Rating</dt>
                    <dd className="text-gray-100 text-right font-medium">{movie.rating || 'N/A'}</dd>
                  </div>
                  {movie.year && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Release Year</dt>
                      <dd className="text-gray-100 text-right font-medium">{movie.year}</dd>
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Runtime</dt>
                      <dd className="text-gray-100 text-right font-medium">{movie.runtime}</dd>
                    </div>
                  )}
                  {movie.genres.length > 0 && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500 shrink-0">Genres</dt>
                      <dd className="text-gray-100 text-right font-medium">{movie.genres.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="rounded-2xl p-5 border border-white/5 bg-darkSurface">
                <h3 className="font-semibold mb-2 text-white text-sm">
                  {playerError ? 'Content unavailable' : 'No sources yet?'}
                </h3>
                <p className="text-sm text-gray-400">
                  {playerError 
                    ? 'This content is not available on VidLink. Try adding it to My List and check back later, or browse recommendations below.'
                    : 'Some brand-new or rare titles are not mirrored yet. Keep it in My List and try again later, or jump into a recommendation below while the sources catch up.'}
                </p>
              </div>
            </aside>
          </div>
        </section>

        <CastRail cast={movie.cast} />

        <MediaRail title={`More Like ${movie.title}`} items={recommendations} type="movie" />
      </div>
    </div>
  )
}
