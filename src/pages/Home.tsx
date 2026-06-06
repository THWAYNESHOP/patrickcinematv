import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import { tmdbApi } from '../api/tmdb'
import { ChevronRight, Tv2 } from 'lucide-react'
import { useMyList } from '../hooks/useMyList'

const fallbackMovies = [
  { id: 1078605, title: 'Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'A test movie embed used for local player testing.', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 119051, title: 'Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021 },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
]

const streamingServices = [
  { name: 'Netflix', label: 'Netflix', mark: 'N', tone: 'from-[#E50914] to-[#B20710]' },
  { name: 'Prime Video', label: 'Prime Video', mark: 'PV', tone: 'from-[#00A8E1] to-[#0F5B78]' },
  { name: 'HDO Box', label: 'HDO Box', mark: 'H', tone: 'from-[#7C3AED] to-[#4C1D95]' },
  { name: 'Paramount+', label: 'Paramount+', mark: 'P', tone: 'from-[#0056B8] to-[#003B82]' },
  { name: 'Apple TV+', label: 'Apple TV+', mark: 'A', tone: 'from-[#7C7C80] to-[#2C2C2E]' },
  { name: 'Hulu', label: 'Hulu', mark: 'H', tone: 'from-[#1CE783] to-[#0E8A4F]' },
  { name: 'Disney+', label: 'Disney+', mark: 'D', tone: 'from-[#113CCF] to-[#0B1A4A]' },
]

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([])
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [popularTV, setPopularTV] = useState<any[]>([])
  const [teenRomance, setTeenRomance] = useState<any[]>([])
  const [kDrama, setKDrama] = useState<any[]>([])
  const [actionAdventure, setActionAdventure] = useState<any[]>([])
  const [comedy, setComedy] = useState<any[]>([])
  const [anime, setAnime] = useState<any[]>([])
  const [newReleases, setNewReleases] = useState<any[]>([])
  const [activePlatform, setActivePlatform] = useState('Netflix')
  const [platformMovies, setPlatformMovies] = useState<any[]>([])
  const [platformTV, setPlatformTV] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [platformLoading, setPlatformLoading] = useState(true)
  const { myList } = useMyList()

  useEffect(() => {
    async function fetchHomeContent() {
      try {
        const [trendingToday, latestMovies, trendingTV, teenRomanceMovies, koreanDrama, actionAdventureMovies, comedyMovies, animeContent, newReleasesContent] = await Promise.all([
          tmdbApi.getTrendingMoviesToday(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getTrendingTVToday(),
          tmdbApi.getMoviesByGenre(10749).catch(() => []),
          tmdbApi.getTVByOriginCountry('KR').catch(() => []),
          tmdbApi.getMoviesByGenre(28).catch(() => []),
          tmdbApi.getMoviesByGenre(35).catch(() => []),
          tmdbApi.getTVByGenre(16).catch(() => []),
          tmdbApi.getNewReleases().catch(() => []),
        ])

        const heroMovies = (latestMovies.length ? latestMovies : trendingToday).filter((movie) => movie.backdrop)
        setFeaturedMovies(heroMovies.length ? heroMovies.slice(0, 5) : fallbackMovies)
        setTrendingMovies(trendingToday.length ? trendingToday : fallbackMovies)
        setPopularTV(trendingTV.length ? trendingTV : fallbackTV)
        setTeenRomance(teenRomanceMovies.length ? teenRomanceMovies : trendingMovies.slice(0, 8))
        setKDrama(koreanDrama.length ? koreanDrama : trendingTV.slice(0, 8))
        setActionAdventure(actionAdventureMovies.length ? actionAdventureMovies : trendingMovies.slice(0, 8))
        setComedy(comedyMovies.length ? comedyMovies : trendingMovies.slice(0, 8))
        setAnime(animeContent.length ? animeContent : trendingTV.slice(0, 8))
        setNewReleases(newReleasesContent.length ? newReleasesContent : [...trendingMovies.slice(0, 10), ...trendingTV.slice(0, 10)])
      } catch (error) {
        console.warn('Home TMDB content unavailable, using fallback data:', error)
        setFeaturedMovies(fallbackMovies)
        setTrendingMovies(fallbackMovies)
        setPopularTV(fallbackTV)
        setTeenRomance(fallbackMovies.slice(0, 8))
        setKDrama(fallbackTV.slice(0, 8))
        setActionAdventure(fallbackMovies.slice(0, 8))
        setComedy(fallbackMovies.slice(0, 8))
        setAnime(fallbackTV.slice(0, 8))
        setNewReleases([...fallbackMovies.slice(0, 5), ...fallbackTV.slice(0, 5)])
      } finally {
        setLoading(false)
      }
    }

    fetchHomeContent()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchPlatformContent() {
      setPlatformLoading(true)
      try {
        const catalog = await tmdbApi.getPlatformCatalog(activePlatform)
        if (!cancelled) {
          setPlatformMovies(catalog.movies.slice(0, 8))
          setPlatformTV(catalog.tv.slice(0, 8))
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(`Platform catalog unavailable for ${activePlatform}, using fallback data:`, error)
          setPlatformMovies(trendingMovies.slice(0, 8))
          setPlatformTV(popularTV.slice(0, 8))
        }
      } finally {
        if (!cancelled) {
          setPlatformLoading(false)
        }
      }
    }

    fetchPlatformContent()

    return () => {
      cancelled = true
    }
  }, [activePlatform, trendingMovies, popularTV])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neonPink border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroSlider movies={featuredMovies} />

      {/* Continue Watching */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Continue Watching"
            items={trendingMovies.slice(0, 5)}
            type="movie"
            showProgress
          />
        </div>
      </section>

      {/* Trending Today */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Trending Today"
            items={trendingMovies}
            type="movie"
          />
        </div>
      </section>

      {/* Recommended For You */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Recommended For You"
            items={[...trendingMovies.slice(0, 5), ...popularTV.slice(0, 5)]}
            type="movie"
          />
        </div>
      </section>

      {/* New Releases */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="New Releases"
            items={newReleases}
            type="movie"
          />
        </div>
      </section>

      {/* Live Sports */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
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

      {/* Upcoming Matches */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
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

      {/* Teen Romance */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Teen Romance"
            items={teenRomance}
            type="movie"
          />
        </div>
      </section>

      {/* Korean Dramas */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Korean Dramas"
            items={kDrama}
            type="tv"
          />
        </div>
      </section>

      {/* Action & Adventure */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Action & Adventure"
            items={actionAdventure}
            type="movie"
          />
        </div>
      </section>

      {/* Comedy */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Comedy"
            items={comedy}
            type="movie"
          />
        </div>
      </section>

      {/* Anime */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Anime"
            items={anime}
            type="tv"
          />
        </div>
      </section>

      {/* Featured This Week */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Featured This Week"
            items={[...trendingMovies.slice(0, 4), ...popularTV.slice(0, 4)]}
            type="movie"
          />
        </div>
      </section>

      {/* My List */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="My List"
            items={myList.length > 0 ? myList : trendingMovies.slice(0, 5)}
            type="movie"
          />
        </div>
      </section>

      {/* Streaming Platforms */}
      <section className="py-12 px-4 md:px-8 animate-fade-in">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Streaming Platforms</h2>
            <Tv2 className="w-5 h-5 text-primary" />
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {streamingServices.map((service) => {
              const selected = activePlatform === service.name

              return (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => setActivePlatform(service.name)}
                  className={`group flex min-w-[190px] sm:min-w-[220px] items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-300 touch-manipulation ${
                    selected
                      ? 'border-primary/50 bg-white/8 shadow-glow'
                      : 'border-white/10 bg-darkSurface hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${service.tone} text-white text-lg font-bold shadow-card`}>
                    {service.mark}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base sm:text-lg font-semibold text-white">{service.label}</span>
                  </span>
                  <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${selected ? 'text-primary rotate-90' : 'text-gray-500 group-hover:text-gray-300'}`} />
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
