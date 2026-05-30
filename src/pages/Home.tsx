import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import { tmdbApi } from '../api/tmdb'

const fallbackMovies = [
  { id: 1078605, title: 'Vidking Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'A known working Vidking movie embed used for local player testing.', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 119051, title: 'Vidking Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021 },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
]

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([])
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [popularTV, setPopularTV] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomeContent() {
      try {
        const [trendingToday, latestMovies, trendingTV] = await Promise.all([
          tmdbApi.getTrendingMoviesToday(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getTrendingTVToday(),
        ])

        const heroMovies = (latestMovies.length ? latestMovies : trendingToday).filter((movie) => movie.backdrop)
        setFeaturedMovies(heroMovies.length ? heroMovies.slice(0, 5) : fallbackMovies)
        setTrendingMovies(trendingToday.length ? trendingToday : fallbackMovies)
        setPopularTV(trendingTV.length ? trendingTV : fallbackTV)
      } catch (error) {
        console.warn('Home TMDB content unavailable, using fallback data:', error)
        setFeaturedMovies(fallbackMovies)
        setTrendingMovies(fallbackMovies)
        setPopularTV(fallbackTV)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neonPink border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlider movies={featuredMovies} />

      {/* Live Sports Section */}
      <section className="py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold neon-text">Live Sports</h2>
            <Link to="/sports" className="text-neonPink hover:text-white transition-colors text-sm font-medium">
              View All
            </Link>
          </div>
          <LiveMatches limit={4} />
        </div>
      </section>

      <section className="py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold neon-text">Upcoming Matches</h2>
            <Link to="/sports" className="text-neonPink hover:text-white transition-colors text-sm font-medium">
              View All
            </Link>
          </div>
          <LiveMatches limit={4} variant="upcoming" />
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <ContentCarousel
            title="Trending Movies Today"
            items={trendingMovies}
            type="movie"
          />
        </div>
      </section>

      {/* Popular Movies */}
      <section className="py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <ContentCarousel
            title="Latest Movies"
            items={trendingMovies}
            type="movie"
          />
        </div>
      </section>

      {/* Top TV Series */}
      <section className="py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <ContentCarousel
            title="Top TV Series"
            items={popularTV}
            type="tv"
          />
        </div>
      </section>

      {/* Continue Watching */}
      <section className="py-8 px-4 md:px-8">
        <div className="container mx-auto">
          <ContentCarousel
            title="Continue Watching"
            items={trendingMovies.slice(0, 5)}
            type="movie"
            showProgress
          />
        </div>
      </section>
    </div>
  )
}
