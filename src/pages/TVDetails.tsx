import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Play, Heart, Share2, Star } from 'lucide-react'
import VidkingPlayer from '../components/Player/VidkingPlayer'
import { vidkingApi, PlayerEventData } from '../api/vidking'
import { MediaDetails, MovieSummary, tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'

const fallbackRecommendations: MovieSummary[] = [
  { id: 119051, title: 'Vidking Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021, type: 'tv' },
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
      } finally {
        setLoading(false)
      }
    }

    fetchTV()
  }, [id])

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

  const embedUrl = vidkingApi.getTVEmbedUrl(id || '', selectedSeason, selectedEpisode, {
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
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${tv.backdrop})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/70 to-transparent" />
        
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
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-semibold">{tv.rating}</span>
                  </div>
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
                    Watch S{selectedSeason} E{selectedEpisode}
                  </a>
                  <button
                    onClick={handleMyList}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10"
                  >
                    <Heart className="w-5 h-5" />
                    {inMyList ? 'Remove from List' : 'Add to List'}
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border border-white/10">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Video Player */}
        <section id="player" className="mb-12 scroll-mt-24">
          <div className="bg-darkSurface rounded-lg overflow-hidden border border-white/5">
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
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Cast</h2>
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
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                to={`/tv/${item.id}`}
                className="group"
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

          {/* Episode List */}
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedEpisode(i + 1)}
                className="bg-darkSurface rounded-lg p-4 flex gap-4 hover:bg-darkHover transition-all duration-200 w-full text-left border border-white/5 hover:border-white/10"
              >
                <div className="w-32 aspect-video bg-gray-700 rounded flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Episode {i + 1}</h3>
                  <p className="text-gray-400 text-sm mb-2">Episode description here...</p>
                  <span className="text-gray-500 text-sm">45 min</span>
                </div>
                <Play className="w-10 h-10 text-primary flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
