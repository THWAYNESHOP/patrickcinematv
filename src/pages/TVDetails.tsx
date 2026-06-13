import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Play, Heart, Share2, Volume2, VolumeX } from 'lucide-react'
import VidkingPlayer from '../components/Player/VidkingPlayer'
import { vidkingApi, PlayerEventData } from '../api/vidking'
import { MediaDetails, MovieSummary, tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'

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
  const [trailer, setTrailer] = useState<{ key: string; embedUrl: string } | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()

  useEffect(() => {
    if (id === '119051') {
      setSelectedSeason(1)
      setSelectedEpisode(8)
    } else {
      setSelectedSeason(1)
      setSelectedEpisode(1)
    }
  }, [id])

  const handleProgress = (data: PlayerEventData) => {
    localStorage.setItem(`patrickCinema_progress_tv_${id}_${selectedSeason}_${selectedEpisode}`, JSON.stringify({
      progress: data.progress,
      currentTime: data.currentTime,
      timestamp: Date.now()
    }))
  }

  useEffect(() => {
    // Load saved progress
    const savedProgress = localStorage.getItem(`patrickCinema_progress_tv_${id}_${selectedSeason}_${selectedEpisode}`)
    if (savedProgress) {
      const data = JSON.parse(savedProgress)
      setStartProgressSeconds(Math.floor(data.currentTime || 0))
    } else {
      setStartProgressSeconds(0)
    }
  }, [id, selectedSeason, selectedEpisode])

  useEffect(() => {
    async function fetchTV() {
      if (!id) return

      setLoading(true)
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
        console.log("TMDB Videos:", videos)

        // Select best trailer: Official Trailer > Trailer > Teaser
        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube' && v.key)
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.key)
        const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube' && v.key)

        const selectedTrailer = officialTrailer || trailer || teaser

        if (selectedTrailer) {
          console.log("Selected Trailer:", selectedTrailer)
          const embedUrl = `https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&showinfo=0&cc_load_policy=0&fs=0`
          console.log("Trailer Embed URL:", embedUrl)
          setTrailer({ key: selectedTrailer.key, embedUrl })

          // Show trailer after 2 seconds
          setTimeout(() => {
            setShowTrailer(true)
          }, 2000)
        } else {
          console.warn("No suitable trailer found")
        }
      } catch (error) {
        console.warn('TV details unavailable, using fallback details:', error)
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
        console.warn("No trailer available for:", "tv", id)
      } finally {
        setLoading(false)
      }
    }

    fetchTV()
  }, [id])

  // IntersectionObserver for visibility optimization
  useEffect(() => {
    if (!heroRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && trailer) {
            // Hero is visible, trailer will autoplay
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(heroRef.current)

    return () => {
      observer.disconnect()
    }
  }, [trailer])

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

  const embedUrl = vidkingApi.getTVEmbedUrl(tv?.imdbId || id || '', selectedSeason, selectedEpisode, {
    color: 'ff008c',
    autoPlay: true,
    nextEpisode: true,
    episodeSelector: true,
    progress: startProgressSeconds,
  })
  const inMyList = isInMyList(id || '')

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

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div
        ref={heroRef}
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${tv.backdrop})`,
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/70 to-transparent transition-opacity duration-1000 ${showTrailer ? 'opacity-0' : 'opacity-100'}`} />
        
        {/* Trailer Iframe */}
        {trailer && showTrailer && (
          <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
            <style>{`
              .trailer-container iframe {
                pointer-events: none;
              }
              .trailer-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 10;
              }
            `}</style>
            <div className="trailer-container relative w-full h-full">
              <iframe
                src={trailer.embedUrl}
                title={`${tv.title} Trailer`}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
              {/* Overlay to hide YouTube branding */}
              <div className="absolute top-0 right-0 w-32 h-12 pointer-events-none z-20" />
              <div className="absolute bottom-0 right-0 w-48 h-16 pointer-events-none z-20" />
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/50 to-transparent pointer-events-none" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={tv.poster}
                alt={tv.title}
                className="w-48 md:w-64 rounded-lg shadow-2xl border border-white/10"
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">{tv.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-primary font-semibold">98% Match</span>
                  <span className="text-gray-400">{tv.rating}</span>
                  <span className="text-gray-400">{tv.year}</span>
                  <span className="text-gray-400">{tv.seasons} Seasons</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tv.genres.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-3 py-1 glass rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">{tv.overview}</p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#player"
                    className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Play
                  </a>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10">
                    <Play className="w-5 h-5" />
                    Trailer
                  </button>
                  <button
                    onClick={handleMyList}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10"
                  >
                    <Heart className="w-5 h-5" />
                    {inMyList ? 'Remove from List' : 'Add to List'}
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10">
                    <Heart className="w-5 h-5" />
                    Like
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  {trailer && showTrailer && (
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="container mx-auto py-12 px-4 md:px-8">
        {/* Video Player */}
        <section id="player" className="scroll-mt-24 mb-12">
          <div className="overflow-hidden border border-white/5 bg-darkSurface rounded-lg">
            <VidkingPlayer
              key={`${id}-${selectedSeason}-${selectedEpisode}`}
              src={embedUrl}
              onProgress={handleProgress}
              className="rounded-lg"
            />
          </div>
          <div className="bg-darkSurface rounded-lg p-5 mt-4 border border-white/5">
            <h3 className="font-semibold mb-2">If this episode has no sources</h3>
            <p className="text-sm text-gray-400">
              Try a different episode or save it to My List and come back later. Newer and niche episodes sometimes need a little time before alternate mirrors appear.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Cast</h2>
            <button className="text-primary hover:text-white transition-colors text-sm font-medium">
              View All Cast
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {tv.cast.map((actor, index) => (
              <div key={actor.id || actor.name || index} className="bg-darkSurface rounded-lg p-4 text-center w-36 border border-white/5">
                {actor.profile ? (
                  <img
                    src={actor.profile}
                    alt={actor.name}
                    className="w-24 h-24 object-cover rounded-full mb-2 mx-auto"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-700 rounded-full mb-2 mx-auto" />
                )}
                <p className="font-medium text-sm">{actor.name}</p>
                {actor.character && <p className="text-xs text-gray-400 mt-1">{actor.character}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Because You Watched {tv.title}</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {recommendations.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/tv/${item.id}`}
                className="group flex-shrink-0 w-40"
              >
                <div className="bg-darkSurface rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover border border-white/5 hover:border-white/10">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-gray-400 text-xs">{item.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Trending TV Shows</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {recommendations.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/tv/${item.id}`}
                className="group flex-shrink-0 w-40"
              >
                <div className="bg-darkSurface rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover border border-white/5 hover:border-white/10">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-gray-400 text-xs">{item.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">More Like This</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {recommendations.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/tv/${item.id}`}
                className="group flex-shrink-0 w-40"
              >
                <div className="bg-darkSurface rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover border border-white/5 hover:border-white/10">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-gray-400 text-xs">{item.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Episodes</h2>
          
          {/* Season Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: tv.seasons || 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedSeason(i + 1)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedSeason === i + 1
                    ? 'bg-primary text-white'
                    : 'bg-darkSurface hover:bg-darkHover text-gray-300 border border-white/5'
                }`}
              >
                Season {i + 1}
              </button>
            ))}
          </div>

          {/* Season Info */}
          <div className="mb-4 text-gray-400 text-sm">
            10 Episodes • 450 min total
          </div>

          {/* Episode List */}
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => {
              const episodeNumber = i + 1
              const isSelected = selectedEpisode === episodeNumber
              const progressKey = `patrickCinema_progress_tv_${id}_${selectedSeason}_${episodeNumber}`
              const savedProgress = localStorage.getItem(progressKey)
              const progressData = savedProgress ? JSON.parse(savedProgress) : null
              const progressPercent = progressData ? Math.floor(progressData.progress || 0) : 0

              return (
                <button
                  key={i}
                  onClick={() => setSelectedEpisode(episodeNumber)}
                  className={`bg-darkSurface rounded-lg p-4 flex gap-4 hover:bg-darkHover transition-all duration-200 w-full text-left border border-white/5 hover:border-white/10 group ${
                    isSelected ? 'border-primary/50' : ''
                  }`}
                >
                  <div className="w-32 aspect-video bg-gray-700 rounded flex-shrink-0 group-hover:brightness-110 transition-all duration-200 relative overflow-hidden">
                    <Play className="absolute inset-0 m-auto w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Episode {episodeNumber}</h3>
                      {progressPercent > 0 && (
                        <span className="text-xs text-primary">{progressPercent}%</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Episode description here...</p>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-sm">45 min</span>
                      {progressPercent > 0 && progressPercent < 90 && (
                        <span className="text-xs text-primary">Resume</span>
                      )}
                    </div>
                  </div>
                  <Play className="w-10 h-10 text-primary flex-shrink-0" />
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
