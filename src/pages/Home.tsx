import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { getOrderedKenyanSeriesItems } from '../data/kenyanSeries'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import RecommendedForYou from '../components/RecommendedForYou'
import { tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useToast } from '../hooks/useToast'
import { usePageState } from '../hooks/usePageState'
import { useTVDetection } from '../hooks/useTVDetection'
import { RefreshCw } from 'lucide-react'
import { useStore } from '../store/useStore'
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

function sortByRating(items: MovieSummary[]) {
  return [...items].sort((a, b) => {
    const ratingA = Number(a.rating) || 0
    const ratingB = Number(b.rating) || 0
    return ratingB - ratingA
  })
}

interface HomePageCache {
  featuredMovies: MovieSummary[]
  trendingMovies: MovieSummary[]
  popularTV: MovieSummary[]
  teenRomance: MovieSummary[]
  kDrama: MovieSummary[]
  actionAdventure: MovieSummary[]
  comedy: MovieSummary[]
  anime: MovieSummary[]
  netflixContent: MovieSummary[]
  primeContent: MovieSummary[]
  disneyContent: MovieSummary[]
  appleContent: MovieSummary[]
  timestamp: number
}

const CACHE_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

let cachedHomeContent: HomePageCache | null = null

function isCacheValid(cache: HomePageCache | null): boolean {
  if (!cache) return false
  return Date.now() - cache.timestamp < CACHE_EXPIRY_MS
}

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
  const isTVPerformanceMode = useTVDetection()
  const cachedData = isCacheValid(cachedHomeContent) ? cachedHomeContent : null
  const [featuredMovies, setFeaturedMovies] = useState<MovieSummary[]>(cachedData?.featuredMovies || [])
  const [trendingMovies, setTrendingMovies] = useState<MovieSummary[]>(cachedData?.trendingMovies || [])
  const [popularTV, setPopularTV] = useState<MovieSummary[]>(cachedData?.popularTV || [])
  const [teenRomance, setTeenRomance] = useState<MovieSummary[]>(cachedData?.teenRomance || [])
  const [kDrama, setKDrama] = useState<MovieSummary[]>(cachedData?.kDrama || [])
  const [actionAdventure, setActionAdventure] = useState<MovieSummary[]>(cachedData?.actionAdventure || [])
  const [comedy, setComedy] = useState<MovieSummary[]>(cachedData?.comedy || [])
  const [anime, setAnime] = useState<MovieSummary[]>(cachedData?.anime || [])
  const [netflixContent, setNetflixContent] = useState<MovieSummary[]>(cachedData?.netflixContent || [])
  const [primeContent, setPrimeContent] = useState<MovieSummary[]>(cachedData?.primeContent || [])
  const [disneyContent, setDisneyContent] = useState<MovieSummary[]>(cachedData?.disneyContent || [])
  const [appleContent, setAppleContent] = useState<MovieSummary[]>(cachedData?.appleContent || [])
  const [heroLoading, setHeroLoading] = useState(!cachedData)
  const [primaryLoading, setPrimaryLoading] = useState(!cachedData)
  const [catalogLoading, setCatalogLoading] = useState(!cachedData)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { myList } = useMyList()
  const { continueWatching } = useContinueWatching()
  const { getAverageRatingForMedia } = useStore()
  const toast = useToast()
  const { getCarouselPosition, setCarouselPosition, getFocusedCardId, setFocusedCardId } = usePageState('Home')
  const maxCarouselItems = isTVPerformanceMode ? 8 : 20
  const maxHeroItems = isTVPerformanceMode ? 3 : 5
  const liveMatchLimit = isTVPerformanceMode ? 2 : 4
  const showExtendedHomeContent = !isTVPerformanceMode

  const limitItems = useCallback(
    (items: MovieSummary[], limit = maxCarouselItems) =>
      isTVPerformanceMode ? items.slice(0, limit) : items,
    [isTVPerformanceMode, maxCarouselItems],
  )

  const carouselId = (name: string) =>
    `home-${name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase()}`

  const carouselStateProps = {
    getCarouselPosition,
    setCarouselPosition,
    getFocusedCardId,
    setFocusedCardId,
    onPrefetch: isTVPerformanceMode ? undefined : tmdbApi.prefetchMediaDetails,
    performanceMode: isTVPerformanceMode,
  }


  const { containerRef, isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await fetchHomeContent(true)
    },
    threshold: 80,
  })

  const fetchHomeContent = useCallback(async (isRefresh = false) => {
    setFetchError(null)
    if (!isRefresh) {
      setHeroLoading(true)
      setPrimaryLoading(true)
      setCatalogLoading(true)
    }

    let trendingToday: MovieSummary[] = fallbackMovies
    let trendingTV: MovieSummary[] = fallbackTV
    let heroMoviesToCache: MovieSummary[]
    let popularTVToCache: MovieSummary[] = []
    let teenRomanceToCache: MovieSummary[] = []
    let kDramaToCache: MovieSummary[] = []
    let actionAdventureToCache: MovieSummary[] = []
    let comedyToCache: MovieSummary[] = []
    let animeToCache: MovieSummary[] = []
    let netflixContentToCache: MovieSummary[] = []
    let primeContentToCache: MovieSummary[] = []
    let disneyContentToCache: MovieSummary[] = []
    let appleContentToCache: MovieSummary[] = []

    // Phase 1: hero + trending movies (2 calls - show hero ASAP)
    try {
      const [latestMovies, trendingMoviesData] = await Promise.all([
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.getTrendingMoviesToday(),
      ])
      trendingToday = limitItems(trendingMoviesData.length ? trendingMoviesData : fallbackMovies, 10)
      const heroMovies = (latestMovies.length ? latestMovies : trendingToday).filter((movie) => movie.backdrop)
      heroMoviesToCache = heroMovies.length ? heroMovies.slice(0, maxHeroItems) : fallbackMovies.slice(0, maxHeroItems)
      setFeaturedMovies(heroMoviesToCache)
      setTrendingMovies(trendingToday)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load hero content.'
      if (import.meta.env.DEV) {
        console.warn('Home hero content unavailable, using fallback data:', error)
      }
      setFetchError('Unable to load featured content. Showing fallback items.')
      toast.error(`Home load failed: ${message}`)
      heroMoviesToCache = fallbackMovies.slice(0, maxHeroItems)
      setFeaturedMovies(heroMoviesToCache)
      setTrendingMovies(limitItems(fallbackMovies, 10))
      trendingToday = limitItems(fallbackMovies, 10)
    } finally {
      setHeroLoading(false)
    }

    // Phase 2 & 3: load remaining rows in parallel after hero is visible
    await Promise.all([
      (async () => {
        try {
          const tvData = await tmdbApi.getTrendingTVToday()
          trendingTV = limitItems(tvData.length ? tvData : fallbackTV, 8)
          popularTVToCache = trendingTV
          setPopularTV(trendingTV)
        } catch {
          popularTVToCache = fallbackTV
          setPopularTV(fallbackTV)
        } finally {
          setPrimaryLoading(false)
        }
      })(),
      (async () => {
        if (isTVPerformanceMode) {
          teenRomanceToCache = []
          kDramaToCache = []
          actionAdventureToCache = []
          comedyToCache = []
          animeToCache = []
          netflixContentToCache = []
          primeContentToCache = []
          disneyContentToCache = []
          appleContentToCache = []

          setTeenRomance([])
          setKDrama([])
          setActionAdventure([])
          setComedy([])
          setAnime([])
          setNetflixContent([])
          setPrimeContent([])
          setDisneyContent([])
          setAppleContent([])
          setCatalogLoading(false)
          return
        }

        try {
          const [
            teenRomanceMovies,
            teenRomanceTV,
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
            tmdbApi.getTVByGenre(10749).catch(() => []),
            tmdbApi.getTVByOriginCountry('KR').catch(() => []),
            tmdbApi.getMoviesByGenre(28).catch(() => []),
            tmdbApi.getMoviesByGenre(35).catch(() => []),
            tmdbApi.getTVByGenre(16).catch(() => []),
            tmdbApi.getPlatformCatalog('Netflix').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Prime Video').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Disney+').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Apple TV+').catch(() => ({ movies: [], tv: [] })),
          ])

          const combinedTeenRomance = [
            ...(teenRomanceMovies.length ? teenRomanceMovies : []),
            ...(teenRomanceTV.length ? teenRomanceTV : []),
          ]

          teenRomanceToCache = limitItems(combinedTeenRomance.length ? combinedTeenRomance : trendingToday)
          kDramaToCache = limitItems(koreanDrama.length ? koreanDrama : trendingTV.slice(0, 8))
          actionAdventureToCache = limitItems(actionAdventureMovies.length ? actionAdventureMovies : trendingToday.slice(0, 8))
          comedyToCache = limitItems(comedyMovies.length ? comedyMovies : trendingToday.slice(0, 8))
          animeToCache = limitItems(animeContent.length ? animeContent : trendingTV.slice(0, 8))
          netflixContentToCache = limitItems([...netflixCatalog.movies.slice(0, 10), ...netflixCatalog.tv.slice(0, 10)])
          primeContentToCache = limitItems([...primeCatalog.movies.slice(0, 10), ...primeCatalog.tv.slice(0, 10)])
          disneyContentToCache = limitItems([...disneyCatalog.movies.slice(0, 10), ...disneyCatalog.tv.slice(0, 10)])
          appleContentToCache = limitItems([...appleCatalog.movies.slice(0, 10), ...appleCatalog.tv.slice(0, 10)])

          setTeenRomance(sortByRating(teenRomanceToCache))
          setKDrama(kDramaToCache)
          setActionAdventure(actionAdventureToCache)
          setComedy(comedyToCache)
          setAnime(animeToCache)
          setNetflixContent(netflixContentToCache)
          setPrimeContent(primeContentToCache)
          setDisneyContent(disneyContentToCache)
          setAppleContent(appleContentToCache)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to load home catalog content.'
          if (import.meta.env.DEV) {
            console.warn('Home catalog content unavailable:', error)
          }
          setFetchError('Some home categories failed to load. Showing partial content.')
          toast.warning(`Home catalog load warning: ${message}`)
          teenRomanceToCache = limitItems(trendingToday)
          kDramaToCache = limitItems(trendingTV.slice(0, 8))
          actionAdventureToCache = limitItems(trendingToday.slice(0, 8))
          comedyToCache = limitItems(trendingToday.slice(0, 8))
          animeToCache = limitItems(trendingTV.slice(0, 8))
          netflixContentToCache = []
          primeContentToCache = []
          disneyContentToCache = []
          appleContentToCache = []

          setTeenRomance(sortByRating(teenRomanceToCache))
          setKDrama(kDramaToCache)
          setActionAdventure(actionAdventureToCache)
          setComedy(comedyToCache)
          setAnime(animeToCache)
          setNetflixContent([])
          setPrimeContent([])
          setDisneyContent([])
          setAppleContent([])
        } finally {
          setCatalogLoading(false)
        }
      })(),
    ])

    cachedHomeContent = {
      featuredMovies: heroMoviesToCache,
      trendingMovies: trendingToday,
      popularTV: popularTVToCache,
      teenRomance: teenRomanceToCache,
      kDrama: kDramaToCache,
      actionAdventure: actionAdventureToCache,
      comedy: comedyToCache,
      anime: animeToCache,
      netflixContent: netflixContentToCache,
      primeContent: primeContentToCache,
      disneyContent: disneyContentToCache,
      appleContent: appleContentToCache,
      timestamp: Date.now(),
    }
  }, [isTVPerformanceMode, limitItems, maxHeroItems, toast])

  useEffect(() => {
    if (!cachedData) {
      fetchHomeContent()
    }
  }, [fetchHomeContent, cachedData])

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
        {fetchError && (
          <section className="mb-8">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Content load issue</p>
                <p className="mt-1 text-sm text-gray-200">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={() => fetchHomeContent(true)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="mb-10 md:mb-12">
            <ContentCarousel
              title="Continue Watching"
              items={continueWatching.map(item => {
                const userRating = getAverageRatingForMedia(String(item.id))
                return ({
                  id: Number(item.id),
                  title: item.title,
                  poster: item.poster,
                  type: item.type,
                  rating: userRating > 0 ? userRating.toFixed(1) : '0',
                  progress: item.progress
                })
              })}
              type="movie"
              showProgress
              viewAllTo="/watch-history"
              carouselId={carouselId('Continue Watching')}
              {...carouselStateProps}
            />
          </section>
        )}

        {/* Kenyan Series spotlight */}
        <section className="mb-10 md:mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Kenyan Series</h2>
            <Link to="/kenyan-series" className="text-sm font-semibold text-white transition-colors hover:text-white">
              View All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 sm:gap-4">
            {getOrderedKenyanSeriesItems().slice(0, 4).map((item) => {
              const userRating = getAverageRatingForMedia(item.id)
              const rating = userRating > 0 ? userRating.toFixed(1) : '8.5'
              return (
              <Link
                key={item.id}
                to={`/kenyan-series/${item.id}`}
                className="group/card flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-white/5 bg-darkSurface shadow-lg shadow-black/20 transition duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-card-hover sm:w-44 md:w-48"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    <Play className="h-10 w-10 text-primary sm:h-12 sm:w-12" fill="white" />
                  </div>
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="truncate text-sm font-semibold text-white sm:text-base">{item.title}</h3>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex items-center gap-1 rounded-md border border-accent/30 bg-accent/20 px-2 py-0.5">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <span className="text-[11px] font-bold text-accent">{rating}</span>
                    </div>
                    {item.year && <span className="text-[11px] text-gray-500">•</span>}
                    {item.year && <span className="text-[11px] text-gray-500">{item.year}</span>}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Tap to open</p>
                </div>
              </Link>
            )})}
          </div>
        </section>

        {/* Trending Today */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="Trending Today"
            items={trendingMovies}
            type="movie"
            loading={heroLoading}
            viewAllTo="/trending"
            carouselId={carouselId('Trending Today')}
            {...carouselStateProps}
          />
        </section>

        <RecommendedForYou
          allContent={[
            ...featuredMovies,
            ...trendingMovies,
            ...popularTV,
            ...teenRomance,
            ...kDrama,
            ...actionAdventure,
            ...comedy,
            ...anime,
            ...netflixContent,
            ...primeContent,
            ...disneyContent,
            ...appleContent,
            ...myList,
          ]}
          carouselId={carouselId('Recommended For You')}
          carouselStateProps={carouselStateProps}
        />

        {/* Live Sports */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Live Sports</h2>
            <Link to="/sports" className="text-white hover:text-white transition-colors text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-darkSurface overflow-hidden">
            <LiveMatches limit={liveMatchLimit} />
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Upcoming Matches</h2>
            <Link to="/sports" className="text-white hover:text-white transition-colors text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-darkSurface overflow-hidden">
            <LiveMatches limit={liveMatchLimit} variant="upcoming" />
          </div>
        </section>

        {showExtendedHomeContent && (
          <>
            {/* Teen Romance */}
            <section className="mb-10 md:mb-12">
              <ContentCarousel
                title="Teen Romance - Top Rated Movies & Series"
                items={sortByRating(teenRomance)}
                type="movie"
                loading={catalogLoading}
                viewAllTo="/movies"
                carouselId={carouselId('Teen Romance')}
                {...carouselStateProps}
              />
            </section>

            {/* Korean Dramas */}
            <section className="mb-10 md:mb-12">
              <ContentCarousel
                title="Korean Dramas"
                items={kDrama}
                type="tv"
                loading={catalogLoading}
                viewAllTo="/tv"
                carouselId={carouselId('Korean Dramas')}
                {...carouselStateProps}
              />
            </section>

            {/* Action & Adventure */}
            <section className="mb-10 md:mb-12">
              <ContentCarousel
                title="Action & Adventure"
                items={actionAdventure}
                type="movie"
                loading={catalogLoading}
                viewAllTo="/movies"
                carouselId={carouselId('Action & Adventure')}
                {...carouselStateProps}
              />
            </section>

            {/* Comedy */}
            <section className="mb-10 md:mb-12">
              <ContentCarousel
                title="Comedy"
                items={comedy}
                type="movie"
                loading={catalogLoading}
                viewAllTo="/movies"
                carouselId={carouselId('Comedy')}
                {...carouselStateProps}
              />
            </section>

            {/* Anime */}
            <section className="mb-10 md:mb-12">
              <ContentCarousel
                title="Anime"
                items={anime}
                type="tv"
                loading={catalogLoading}
                viewAllTo="/anime"
                carouselId={carouselId('Anime')}
                {...carouselStateProps}
              />
            </section>

            {/* Featured This Week */}
            <section className="mb-10 md:mb-12">
              <ContentCarousel
                title="Featured This Week"
                items={[...trendingMovies.slice(0, 4), ...popularTV.slice(0, 4)]}
                type="movie"
                loading={primaryLoading}
                carouselId={carouselId('Featured This Week')}
                {...carouselStateProps}
              />
            </section>
          </>
        )}

        {/* My List */}
        <section className="mb-10 md:mb-12">
          <ContentCarousel
            title="My List"
            items={myList.length > 0 ? myList.map(m => ({ id: Number(m.id), title: m.title, poster: m.poster, rating: m.rating ?? '0', year: m.year, type: m.type })) : trendingMovies.slice(0, 5)}
            type="movie"
            loading={primaryLoading && myList.length === 0}
            viewAllTo="/my-list"
            carouselId={carouselId('My List')}
            {...carouselStateProps}
          />
        </section>

        {showExtendedHomeContent && (
          <>
            {/* Only on Netflix */}
            {(catalogLoading || netflixContent.length > 0) && (
              <section className="mb-10 md:mb-12">
                <ContentCarousel
                  title="Only on Netflix"
                  items={netflixContent}
                  type="movie"
                  loading={catalogLoading}
                  carouselId={carouselId('Only on Netflix')}
                  {...carouselStateProps}
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
                  carouselId={carouselId('Only on Prime Video')}
                  {...carouselStateProps}
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
                  carouselId={carouselId('Only on Disney+')}
                  {...carouselStateProps}
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
                  carouselId={carouselId('Only on Apple TV+')}
                  {...carouselStateProps}
                />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
