import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Play, Heart, Share2, Volume2, VolumeX } from 'lucide-react'
import VidkingPlayer from '../components/Player/VidkingPlayer'
import { vidkingApi, PlayerEventData } from '../api/vidking'
import { MediaDetails, MovieSummary, tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'

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
  const [trailer, setTrailer] = useState<{ key: string; embedUrl: string } | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
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

        // Fetch videos
        const videos = await tmdbApi.getMovieVideos(id)
        console.log("TMDB Videos:", videos)

        // Select best trailer: Official Trailer > Trailer > Teaser
        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube' && v.key)
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.key)
        const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube' && v.key)

        const selectedTrailer = officialTrailer || trailer || teaser

        if (selectedTrailer) {
          console.log("Selected Trailer:", selectedTrailer)
          const embedUrl = `https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`
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
        console.warn("No trailer available for:", "movie", id)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
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

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Movie details are unavailable right now.</p>
      </div>
    )
  }

  const embedUrl = vidkingApi.getMovieEmbedUrl(movie?.imdbId || id || '', {
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
        ref={heroRef}
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${movie.backdrop})`,
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/70 to-transparent transition-opacity duration-1000 ${showTrailer ? 'opacity-0' : 'opacity-100'}`} />
        
        {/* Trailer Iframe */}
        {trailer && showTrailer && (
          <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
            <iframe
              src={trailer.embedUrl}
              title={`${movie.title} Trailer`}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/50 to-transparent pointer-events-none" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-48 md:w-64 rounded-lg shadow-2xl border border-white/10"
              />
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="text-primary font-semibold">98% Match</span>
                  <span className="text-gray-400">{movie.rating}</span>
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

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Video Player */}
        <section id="player" className="mb-12 scroll-mt-24">
          <div className="bg-darkSurface rounded-lg overflow-hidden border border-white/5">
            <VidkingPlayer
              key={id}
              src={embedUrl}
              onProgress={handleProgress}
              className="rounded-lg"
            />
          </div>
          <div className="bg-darkSurface rounded-lg p-5 mt-4 border border-white/5">
            <h3 className="font-semibold mb-2">If this title has no sources</h3>
            <p className="text-sm text-gray-400">
              Some brand-new or rare titles are not mirrored yet. Keep it in My List and try again later, or jump into a recommendation below while the sources catch up.
            </p>
          </div>
        </section>

        {/* Cast */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Cast</h2>
            <button className="text-primary hover:text-white transition-colors text-sm font-medium">
              View All Cast
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            {movie.cast.map((actor, index) => (
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

        {/* Recommendations */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Because You Watched {movie.title}</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {recommendations.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
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

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">Trending Movies</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {recommendations.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
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

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">More Like This</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {recommendations.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.id}`}
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
      </div>
    </div>
  )
}
