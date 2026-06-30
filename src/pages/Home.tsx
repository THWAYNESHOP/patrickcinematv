import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import { tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { RefreshCw } from 'lucide-react'
import type { MovieSummary } from '../api/tmdb'

const fallbackMovies = [
  { id: 1078605, title: 'Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'A test movie embed used for local player testing.', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 119051, title: 'Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021 },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
]

function HeroSkeleton() {
  return (
    <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-darkSurface animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 flex items-end pb-12 md:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-xl md:max-w-2xl space-y-4">
            <div className="h-10 md:h-14 lg:h-20 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-1/3 bg-white/10 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-3 w-5/6 bg-white/5 rounded" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-24 bg-white/20 rounded" />
              <div className="h-10 w-28 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [heroLoading, setHeroLoading] = useState(true)
  const [primaryLoading, setPrimaryLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const { myList } = useMyList()
  const { continueWatching } = useContinueWatching()

  const { containerRef, isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await fetchHomeContent(true)
    },
    threshold: 80,
  })

  const fetchHomeContent = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setHeroLoading(true)
      setPrimaryLoading(true)
      setCatalogLoading(true)
    }

    let trendingToday: MovieSummary[] = fallbackMovies
    let trendingTV: MovieSummary[] = fallbackTV

    // Phase 1: hero + trending movies (2 calls — show hero ASAP)
    try {
      const [latestMovies, trendingMoviesData] = await Promise.all([
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.getTrendingMoviesToday(),
      ])
      trendingToday = trendingMoviesData.length ? trendingMoviesData : fallbackMovies
      const heroMovies = (latestMovies.length ? latestMovies : trendingToday).filter((movie) => movie.backdrop)
      setFeaturedMovies(heroMovies.length ? heroMovies.slice(0, 5) : fallbackMovies)
      setTrendingMovies(trendingToday)
    } catch (error) {
      console.warn('Home hero content unavailable, using fallback data:', error)
      setFeaturedMovies(fallbackMovies)
      setTrendingMovies(fallbackMovies)
      trendingToday = fallbackMovies
    } finally {
      setHeroLoading(false)
    }

    // Phase 2 & 3: load remaining rows in parallel after hero is visible
    await Promise.all([
      (async () => {
        try {
          const tvData = await tmdbApi.getTrendingTVToday()
          trendingTV = tvData.length ? tvData : fallbackTV
          setPopularTV(trendingTV)
        } catch {
          setPopularTV(fallbackTV)
        } finally {
          setPrimaryLoading(false)
        }
      })(),
      (async () => {
        try {
          const [
            teenRomanceMovies,
            koreanDrama,
            actionAdventureMovies,
            comedyMovies,
            animeContent,
            netflixCatalog,
            primeCatalog,
            disneyCatalog,
            appleCatalog,
          ] = await Promise.all([
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

          setTeenRomance(teenRomanceMovies.length ? teenRomanceMovies : trendingToday.slice(0, 8))
          setKDrama(koreanDrama.length ? koreanDrama : trendingTV.slice(0, 8))
          setActionAdventure(actionAdventureMovies.length ? actionAdventureMovies : trendingToday.slice(0, 8))
          setComedy(comedyMovies.length ? comedyMovies : trendingToday.slice(0, 8))
          setAnime(animeContent.length ? animeContent : trendingTV.slice(0, 8))
          setNetflixContent([...netflixCatalog.movies.slice(0, 10), ...netflixCatalog.tv.slice(0, 10)])
          setPrimeContent([...primeCatalog.movies.slice(0, 10), ...primeCatalog.tv.slice(0, 10)])
          setDisneyContent([...disneyCatalog.movies.slice(0, 10), ...disneyCatalog.tv.slice(0, 10)])
          setAppleContent([...appleCatalog.movies.slice(0, 10), ...appleCatalog.tv.slice(0, 10)])
        } catch (error) {
          console.warn('Home catalog content unavailable:', error)
          setTeenRomance(trendingToday.slice(0, 8))
          setKDrama(trendingTV.slice(0, 8))
          setActionAdventure(trendingToday.slice(0, 8))
          setComedy(trendingToday.slice(0, 8))
          setAnime(trendingTV.slice(0, 8))
          setNetflixContent([])
          setPrimeContent([])
          setDisneyContent([])
          setAppleContent([])
        } finally {
          setCatalogLoading(false)
        }
      })(),
    ])
  }, [])

  useEffect(() => {
    fetchHomeContent()
  }, [fetchHomeContent])

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
      {heroLoading ? <HeroSkeleton /> : <HeroSlider movies={featuredMovies} />}

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
            loading={heroLoading}
          />
        </section>

        {/* Recommended For You */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Recommended For You"
            items={[...trendingMovies.slice(0, 5), ...popularTV.slice(0, 5)]}
            type="movie"
            loading={primaryLoading}
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
            loading={catalogLoading}
          />
        </section>

        {/* Korean Dramas */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Korean Dramas"
            items={kDrama}
            type="tv"
            loading={catalogLoading}
          />
        </section>

        {/* Action & Adventure */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Action & Adventure"
            items={actionAdventure}
            type="movie"
            loading={catalogLoading}
          />
        </section>

        {/* Comedy */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Comedy"
            items={comedy}
            type="movie"
            loading={catalogLoading}
          />
        </section>

        {/* Anime */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Anime"
            items={anime}
            type="tv"
            loading={catalogLoading}
          />
        </section>

        {/* Featured This Week */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Featured This Week"
            items={[...trendingMovies.slice(0, 4), ...popularTV.slice(0, 4)]}
            type="movie"
            loading={primaryLoading}
          />
        </section>

        {/* My List */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="My List"
            items={myList.length > 0 ? myList : trendingMovies.slice(0, 5)}
            type="movie"
            loading={primaryLoading && myList.length === 0}
          />
        </section>

        {/* Only on Netflix */}
        {(catalogLoading || netflixContent.length > 0) && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Netflix"
              items={netflixContent}
              type="movie"
              loading={catalogLoading}
            />
          </section>
        )}

        {/* Only on Prime Video */}
        {(catalogLoading || primeContent.length > 0) && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Prime Video"
              items={primeContent}
              type="movie"
              loading={catalogLoading}
            />
          </section>
        )}

        {/* Only on Disney+ */}
        {(catalogLoading || disneyContent.length > 0) && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Disney+"
              items={disneyContent}
              type="movie"
              loading={catalogLoading}
            />
          </section>
        )}

        {/* Only on Apple TV+ */}
        {(catalogLoading || appleContent.length > 0) && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Only on Apple TV+"
              items={appleContent}
              type="movie"
              loading={catalogLoading}
            />
          </section>
        )}
      </div>
    </div>
  )
}
