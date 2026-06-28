import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import { tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { RefreshCw } from 'lucide-react'

const fallbackMovies = [
  { id: 1078605, title: 'Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'A test movie embed used for local player testing.', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 119051, title: 'Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021 },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
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
  const [netflixContent, setNetflixContent] = useState<any[]>([])
  const [primeContent, setPrimeContent] = useState<any[]>([])
  const [disneyContent, setDisneyContent] = useState<any[]>([])
  const [appleContent, setAppleContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { myList } = useMyList()
  const { continueWatching } = useContinueWatching()

  const { containerRef, isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await fetchHomeContent()
    },
    threshold: 80,
  })

  async function fetchHomeContent() {
    try {
      const [trendingToday, latestMovies, trendingTV, teenRomanceMovies, koreanDrama, actionAdventureMovies, comedyMovies, animeContent, netflixCatalog, primeCatalog, disneyCatalog, appleCatalog] = await Promise.all([
        tmdbApi.getTrendingMoviesToday(),
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.getTrendingTVToday(),
        tmdbApi.getMoviesByGenre(10749).catch(() => []),
        tmdbApi.getTVByOriginCountry('KR').catch(() => []),
        tmdbApi.getMoviesByGenre(28).catch(() => []),
        tmdbApi.getMoviesByGenre(35).catch(() => []),
        tmdbApi.getTVByGenre(16).catch(() => []),
        tmdbApi.getPlatformCatalog('Netflix').catch(() => ({ movies: [], tv: [] })),
        tmdbApi.getPlatformCatalog('Prime Video').catch(() => ({ movies: [], tv: [] })),
        tmdbApi.getPlatformCatalog('Disney+').catch(() => ({ movies: [], tv: [] })),
        tmdbApi.getPlatformCatalog('Apple TV+').catch(() => ({ movies: [], tv: [] })),
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
      setNetflixContent([...netflixCatalog.movies.slice(0, 10), ...netflixCatalog.tv.slice(0, 10)])
      setPrimeContent([...primeCatalog.movies.slice(0, 10), ...primeCatalog.tv.slice(0, 10)])
      setDisneyContent([...disneyCatalog.movies.slice(0, 10), ...disneyCatalog.tv.slice(0, 10)])
      setAppleContent([...appleCatalog.movies.slice(0, 10), ...appleCatalog.tv.slice(0, 10)])
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
      setNetflixContent([])
      setPrimeContent([])
      setDisneyContent([])
      setAppleContent([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-deepBlack">
        <div className="relative mb-6">
          <div className="animate-spin w-16 h-16 md:w-20 md:h-20 border-4 border-primary/30 border-t-primary rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-white text-lg md:text-xl font-semibold animate-pulse">Loading NEXASTREAM...</p>
        <p className="text-gray-400 text-sm md:text-base mt-2">Preparing your entertainment experience</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="min-h-screen relative">
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-darkSurface/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300"
          style={{ transform: `translateY(${isPulling ? Math.min(pullDistance, 80) : 0}px)` }}
        >
          <div className="flex items-center gap-3 py-4">
            <RefreshCw className={`w-6 h-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-white font-medium">{isRefreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <HeroSlider movies={featuredMovies} />

      <div className="container mx-auto py-8 md:py-12 px-4 md:px-8">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Continue Watching"
              items={continueWatching.map(item => ({
                id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type,
                progress: item.progress
              }))}
              type="movie"
              showProgress
            />
          </section>
        )}

        {/* Trending Today */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Trending Today"
            items={trendingMovies}
            type="movie"
          />
        </section>

        {/* Recommended For You */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Recommended For You"
            items={[...trendingMovies.slice(0, 5), ...popularTV.slice(0, 5)]}
            type="movie"
          />
        </section>

        {/* Live Sports */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Live Sports</h2>
            <Link to="/sports" className="text-primary hover:text-white transition-colors text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-darkSurface overflow-hidden">
            <LiveMatches limit={4} />
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Upcoming Matches</h2>
            <Link to="/sports" className="text-primary hover:text-white transition-colors text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-darkSurface overflow-hidden">
            <LiveMatches limit={4} variant="upcoming" />
          </div>
        </section>

        {/* Teen Romance */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Teen Romance"
            items={teenRomance}
            type="movie"
          />
        </section>

        {/* Korean Dramas */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Korean Dramas"
            items={kDrama}
            type="tv"
          />
        </section>

        {/* Action & Adventure */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Action & Adventure"
            items={actionAdventure}
            type="movie"
          />
        </section>

        {/* Comedy */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Comedy"
            items={comedy}
            type="movie"
          />
        </section>

        {/* Anime */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Anime"
            items={anime}
            type="tv"
          />
        </section>

        {/* Featured This Week */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Featured This Week"
            items={[...trendingMovies.slice(0, 4), ...popularTV.slice(0, 4)]}
            type="movie"
          />
        </section>

        {/* My List */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="My List"
            items={myList.length > 0 ? myList : trendingMovies.slice(0, 5)}
            type="movie"
          />
        </section>

        {/* Only on Netflix */}
        {netflixContent.length > 0 && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Netflix"
              items={netflixContent}
              type="movie"
            />
          </section>
        )}

        {/* Only on Prime Video */}
        {primeContent.length > 0 && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Prime Video"
              items={primeContent}
              type="movie"
            />
          </section>
        )}

        {/* Only on Disney+ */}
        {disneyContent.length > 0 && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Disney+"
              items={disneyContent}
              type="movie"
            />
          </section>
        )}

        {/* Only on Apple TV+ */}
        {appleContent.length > 0 && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Apple TV+"
              items={appleContent}
              type="movie"
            />
          </section>
        )}
      </div>
    </div>
  )
}
