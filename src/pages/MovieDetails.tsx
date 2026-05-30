import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Heart, Share2, Star } from 'lucide-react'
import VidkingPlayer from '../components/Player/VidkingPlayer'
import { vidkingApi, PlayerEventData } from '../api/vidking'
import { MediaDetails, MovieSummary, tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'

const recommendedMovies = [
  { id: 1078605, title: 'Vidking Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rating: '8.0', year: 2024, type: 'movie' as const },
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
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()

  const handleProgress = (data: PlayerEventData) => {
    localStorage.setItem(`patrickCinema_progress_movie_${id}`, JSON.stringify({
      progress: data.progress,
      currentTime: data.currentTime,
      timestamp: Date.now()
    }))
  }

  useEffect(() => {
    // Load saved progress
    const savedProgress = localStorage.getItem(`patrickCinema_progress_movie_${id}`)
    if (savedProgress) {
      const data = JSON.parse(savedProgress)
      setStartProgressSeconds(Math.floor(data.currentTime || 0))
    } else {
      setStartProgressSeconds(0)
    }
  }, [id])

  useEffect(() => {
    async function fetchMovie() {
      if (!id) return

      setLoading(true)
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
      } catch (error) {
        console.warn('Movie details unavailable, using fallback details:', error)
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
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neonPink border-t-transparent rounded-full" />
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

  const embedUrl = vidkingApi.getMovieEmbedUrl(id || '', {
    color: 'ff008c',
    autoPlay: true,
    progress: startProgressSeconds,
  })
  const inMyList = isInMyList(id || '')

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

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.backdrop})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/70 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-48 md:w-64 rounded-lg shadow-2xl neon-border"
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-neonPink fill-neonPink" />
                    <span className="font-semibold">{movie.rating}</span>
                  </div>
                  <span className="text-gray-400">{movie.year}</span>
                  <span className="text-gray-400">{movie.runtime}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-3 py-1 glass rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">{movie.overview}</p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#player"
                    className="flex items-center gap-2 bg-neonPink hover:bg-neonPinkLight text-white px-8 py-3 rounded-lg font-semibold transition-colors neon-glow"
                  >
                    <Play className="w-5 h-5" />
                    Watch Now
                  </a>
                  <button
                    onClick={handleMyList}
                    className="flex items-center gap-2 glass hover:bg-white/10 px-6 py-3 rounded-lg transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    {inMyList ? 'Remove from List' : 'Add to List'}
                  </button>
                  <button className="flex items-center gap-2 glass hover:bg-white/10 px-6 py-3 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Video Player */}
        <section id="player" className="mb-12 scroll-mt-24">
          <div className="glass rounded-lg overflow-hidden neon-border">
            <VidkingPlayer
              src={embedUrl}
              onProgress={handleProgress}
              className="rounded-lg"
            />
          </div>
          <div className="glass rounded-lg p-5 mt-4 border border-white/10">
            <h3 className="font-semibold mb-2">If this title has no sources</h3>
            <p className="text-sm text-gray-400">
              Some brand-new or rare titles are not mirrored yet. Keep it in My List and try again later, or jump into a recommendation below while the sources catch up.
            </p>
          </div>
        </section>

        {/* Cast */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 neon-text">Cast</h2>
          <div className="flex flex-wrap gap-4">
            {movie.cast.map((actor, index) => (
              <div key={actor.id || actor.name || index} className="glass rounded-lg p-4 text-center w-36">
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

        {/* Recommendations */}
        <section>
          <h2 className="text-2xl font-bold mb-6 neon-text">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
                className="group"
              >
                <div className="glass rounded-lg overflow-hidden card-hover">
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
      </div>
    </div>
  )
}
