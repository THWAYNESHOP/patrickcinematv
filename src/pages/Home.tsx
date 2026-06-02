import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import { tmdbApi } from '../api/tmdb'
import { PlayCircle, Tv2, Sparkles } from 'lucide-react'

const fallbackMovies = [
  { id: 1078605, title: 'Vidking Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'A known working Vidking movie embed used for local player testing.', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 119051, title: 'Vidking Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021 },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
]

const streamingServices = [
  { name: 'Netflix', tag: 'Only on Netflix', accent: 'from-[#E50914] to-[#B20710]' },
  { name: 'Prime Video', tag: 'Only on Prime Video', accent: 'from-[#00A8E1] to-[#0F5B78]' },
  { name: 'HDO Box', tag: 'Only on HDO Box', accent: 'from-[#7C3AED] to-[#4C1D95]' },
  { name: 'Paramount+', tag: 'Only on Paramount', accent: 'from-[#0056B8] to-[#003B82]' },
  { name: 'Apple TV+', tag: 'Only on Apple TV+', accent: 'from-[#7C7C80] to-[#2C2C2E]' },
  { name: 'Hulu', tag: 'Only on Hulu', accent: 'from-[#1CE783] to-[#0E8A4F]' },
  { name: 'Disney+', tag: 'Only on Disney Plus', accent: 'from-[#113CCF] to-[#0B1A4A]' },
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
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Streaming picks</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Only on these platforms</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Tv2 className="w-4 h-4" />
              <span>Exclusive collections</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {streamingServices.map((service) => (
              <div
                key={service.name}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-darkSurface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-card-hover"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${service.accent}`} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">{service.tag}</p>
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  </div>
                  <PlayCircle className="w-6 h-6 text-primary/80 group-hover:text-primary transition-colors" />
                </div>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                  Browse titles highlighted for this platform and jump straight into the content you want.
                </p>
              </div>
            ))}
          </div>
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
