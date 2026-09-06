import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOrderedKenyanSeriesItems } from '../data/kenyanSeries'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import RecommendedForYou from '../components/RecommendedForYou'
import BecauseYouWatched from '../components/BecauseYouWatched'
import PersonalizedFavorites from '../components/PersonalizedFavorites'
import TrendingInYourGenre from '../components/TrendingInYourGenre'
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
import { classifyYAMatrix } from '../utils/yaMatrix'

const fallbackMovies = [
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
]

const curatedTeenRomance: MovieSummary[] = [
  { id: 199001, title: 'My Life with the Walter Boys', poster: 'https://image.tmdb.org/t/p/w500/dQOwpTpBQEqRUcev4423LrU32G6.jpg', rating: '7.8', year: 2023, type: 'tv' },
  { id: 283297, title: 'Sterling Point', poster: 'https://image.tmdb.org/t/p/w500/cThLWEGs6BEqY0QZMbU4FAeWwPT.jpg', rating: '8.3', year: 2026, type: 'tv' },
  { id: 298168, title: 'The Shards', poster: 'https://image.tmdb.org/t/p/w500/wP0GdqwVu2g1y3q1KzBXuSrdTvX.jpg', rating: '7.3', year: 2026, type: 'tv' },
  { id: 288671, title: 'The Map of Longing', poster: 'https://image.tmdb.org/t/p/w500/wcgjZ7koqOYDcKUn6DmnNolqmUS.jpg', rating: '8.3', year: 2026, type: 'tv' },
  { id: 254420, title: 'Elle', poster: 'https://image.tmdb.org/t/p/w500/dpH7Lyrs7z7MlTGgfeibryGnWAv.jpg', rating: '7.9', year: 2026, type: 'tv' },
  { id: 260592, title: 'Every Year After', poster: 'https://image.tmdb.org/t/p/w500/nZGf0jnSJNXLf8o7iSzzX8qxHX9.jpg', rating: '8.3', year: 2026, type: 'tv' },
  { id: 273240, title: 'Off Campus', poster: 'https://image.tmdb.org/t/p/w500/tcPc5ZMBO4y2BtCJMe3o2nwZb2B.jpg', rating: '8.9', year: 2026, type: 'tv' },
]

const TEEN_ROMANCE_TROPES = [
  { weight: 12, patterns: ['fake date', 'fake dating', 'pretend relationship', 'pretend dating'] },
  { weight: 11, patterns: ['childhood friend', 'best friend', 'friends to lovers', 'friendship turns'] },
  { weight: 10, patterns: ['enemies to lovers', 'rivals', 'opposites attract', 'hate each other'] },
  { weight: 9, patterns: ['love triangle', 'between two', 'choose between', 'torn between'] },
  { weight: 8, patterns: ['prom', 'homecoming', 'makeover', 'school dance', 'high school'] },
  { weight: 7, patterns: ['first love', 'summer romance', 'secret relationship', 'forbidden love'] },
] as const

const GLOSSY_TEEN_ROMANCE_SIGNALS = [
  'party', 'popular', 'dare', 'school', 'summer', 'music', 'dance', 'secret', 'fashion', 'wedding', 'comedy', 'teen',
]

const RECENT_TEEN_ROMANCE_CUTOFF_YEAR = 2018

function isEligibleTeenRomance(item: MovieSummary) {
  return item.genreIds?.includes(16) !== true
    && item.year !== undefined
    && item.year >= RECENT_TEEN_ROMANCE_CUTOFF_YEAR
}

function getTeenRomanceScore(item: MovieSummary) {
  const text = `${item.title} ${item.overview || ''}`.toLowerCase()
  const tropeScore = TEEN_ROMANCE_TROPES.reduce(
    (score, trope) => score + (trope.patterns.some((pattern) => text.includes(pattern)) ? trope.weight : 0),
    0,
  )
  const glossyScore = GLOSSY_TEEN_ROMANCE_SIGNALS.reduce(
    (score, signal) => score + (text.includes(signal) ? 1 : 0),
    0,
  )
  const recentReleaseBoost = item.year && item.year >= 2024 ? 8 : item.year && item.year >= 2022 ? 4 : 0
  const romanceRelevance = item.genreIds?.includes(10749) ? 20 : 0
  const teenRelevance = ['teen', 'school', 'college', 'high school', 'young love', 'coming of age']
    .reduce((score, signal) => score + (text.includes(signal) ? 5 : 0), 0)
  const trendingScore = (item.popularity || 0)
    + Math.min((item.voteCount || 0) / 100, 10)
    + recentReleaseBoost
    + romanceRelevance
    + teenRelevance
  const matrixPriority = {
    GLOSSY_ROMCOM: 4,
    ATMOSPHERIC_SCENIC: 3,
    ELITE_AMBITION: 2,
    DARK_GRITTY: 1,
  }[classifyYAMatrix({
    id: String(item.id),
    title: item.title,
    type: item.type === 'tv' ? 'tv' : 'movie',
    vibeTags: text.split(/[^a-z-]+/).filter(Boolean),
    stakesLevel: 'low',
  })]

  return { matrixPriority, tropeScore, glossyScore, trendingScore }
}

function sortTeenRomance(items: MovieSummary[]) {
  return [...items].sort((a, b) => {
    const scoreA = getTeenRomanceScore(a)
    const scoreB = getTeenRomanceScore(b)
    const popularityA = a.popularity || 0
    const popularityB = b.popularity || 0
    const ratingA = Number(a.rating) || 0
    const ratingB = Number(b.rating) || 0
    return scoreB.trendingScore - scoreA.trendingScore
      || scoreB.matrixPriority - scoreA.matrixPriority
      || scoreB.tropeScore - scoreA.tropeScore
      || scoreB.glossyScore - scoreA.glossyScore
      || popularityB - popularityA
      || ratingB - ratingA
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
  maxContent: MovieSummary[]
  paramountContent: MovieSummary[]
  huluContent: MovieSummary[]
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
  const [maxContent, setMaxContent] = useState<MovieSummary[]>(cachedData?.maxContent || [])
  const [paramountContent, setParamountContent] = useState<MovieSummary[]>(cachedData?.paramountContent || [])
  const [huluContent, setHuluContent] = useState<MovieSummary[]>(cachedData?.huluContent || [])
  const [heroLoading, setHeroLoading] = useState(!cachedData)
  const [primaryLoading, setPrimaryLoading] = useState(!cachedData)
  const [catalogLoading, setCatalogLoading] = useState(!cachedData)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { myList } = useMyList()
  const { continueWatching } = useContinueWatching()
  const { getAverageRatingForMedia } = useStore()
  const user = useStore((state) => state.user)
  const setPendingCardNavigation = useStore((state) => state.setPendingCardNavigation)
  const setIsAuthModalOpen = useStore((state) => state.setIsAuthModalOpen)
  const toast = useToast()
  const { getCarouselPosition, setCarouselPosition, getFocusedCardId, setFocusedCardId } = usePageState('Home')
  const maxCarouselItems = isTVPerformanceMode ? 8 : 20
  const maxHeroItems = isTVPerformanceMode ? 3 : 5
  const liveMatchLimit = isTVPerformanceMode ? 2 : 4
  const showExtendedHomeContent = true

  const carouselStateProps = {
    getCarouselPosition,
    setCarouselPosition,
    getFocusedCardId,
    setFocusedCardId,
    onPrefetch: isTVPerformanceMode ? undefined : tmdbApi.prefetchMediaDetails,
    performanceMode: isTVPerformanceMode,
  }

  const limitItems = useCallback(
    (items: MovieSummary[], limit = maxCarouselItems) =>
      isTVPerformanceMode ? items.slice(0, limit) : items,
    [isTVPerformanceMode, maxCarouselItems],
  )

  const carouselId = (name: string) =>
    `home-${name.replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase()}`

  const TypeToggle = ({ current, onChange }: { current: 'movie' | 'tv', onChange: (val: 'movie' | 'tv') => void }) => (
    <div className="flex bg-darkSurface/50 rounded-lg p-1 border border-white/5 backdrop-blur-md">
      {(['movie', 'tv'] as const).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
            current === t ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          {t === 'movie' ? 'Movies' : 'Series'}
        </button>
      ))}
    </div>
  )


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
    let maxContentToCache: MovieSummary[] = []
    let paramountContentToCache: MovieSummary[] = []
    let huluContentToCache: MovieSummary[] = []

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
      setFeaturedMovies(fallbackMovies.slice(0, maxHeroItems))
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
          maxContentToCache = []
          paramountContentToCache = []
          huluContentToCache = []

          setTeenRomance([])
          setKDrama([])
          setActionAdventure([])
          setComedy([])
          setAnime([])
          setNetflixContent([])
          setPrimeContent([])
          setDisneyContent([])
          setAppleContent([])
          setMaxContent([])
          setParamountContent([])
          setHuluContent([])
          setCatalogLoading(false)
          return
        }

        try {
          const [
            teenRomanceMovies,
            teenRomanceTV,
            weeklyTeenRomance,
            koreanDrama,
            actionAdventureMovies,
            comedyMovies,
            animeContent,
            netflixCatalog,
            primeCatalog,
            disneyCatalog,
            appleCatalog,
            maxCatalog,
            paramountCatalog,
            huluCatalog,
          ] = await Promise.all([
            tmdbApi.discoverMovies({ with_genres: 10749, sort_by: 'popularity.desc' }).catch(() => []),
            tmdbApi.discoverTV({ with_genres: 10749, sort_by: 'popularity.desc' }).catch(() => []),
            tmdbApi.getTrendingTeenRomanceWeekly().catch(() => []),
            tmdbApi.getTVByOriginCountry('KR').catch(() => []),
            tmdbApi.getMoviesByGenre(28).catch(() => []),
            tmdbApi.getMoviesByGenre(35).catch(() => []),
            tmdbApi.getTVByGenre(16).catch(() => []),
            tmdbApi.getPlatformCatalog('Netflix').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Prime Video').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Disney+').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Apple TV+').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Max').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Paramount+').catch(() => ({ movies: [], tv: [] })),
            tmdbApi.getPlatformCatalog('Hulu').catch(() => ({ movies: [], tv: [] })),
          ])

          const platformTeenRomance = [
            ...netflixCatalog.movies,
            ...netflixCatalog.tv,
            ...primeCatalog.movies,
            ...primeCatalog.tv,
            ...disneyCatalog.movies,
            ...disneyCatalog.tv,
            ...appleCatalog.movies,
            ...appleCatalog.tv,
            ...maxCatalog.movies,
            ...maxCatalog.tv,
            ...paramountCatalog.movies,
            ...paramountCatalog.tv,
            ...huluCatalog.movies,
            ...huluCatalog.tv,
          ].filter((item) => {
            const score = getTeenRomanceScore(item)
            return item.year !== undefined
              && item.year >= RECENT_TEEN_ROMANCE_CUTOFF_YEAR
              && (item.genreIds?.includes(10749) || score.tropeScore > 0 || score.glossyScore >= 2)
          }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 100)

          const combinedTeenRomance = Array.from(new Map([
            ...weeklyTeenRomance,
            ...platformTeenRomance,
            ...(teenRomanceMovies.length ? teenRomanceMovies : []),
            ...(teenRomanceTV.length ? teenRomanceTV : []),
          ].map((item) => [String(item.id), item] as const)).values())
          const eligibleTeenRomance = combinedTeenRomance.filter((item) => {
            const score = getTeenRomanceScore(item)
            return isEligibleTeenRomance(item)
              && (item.genreIds?.includes(10749) || score.tropeScore > 0 || score.glossyScore >= 2)
          })

          teenRomanceToCache = sortTeenRomance(eligibleTeenRomance.length ? eligibleTeenRomance : trendingToday).slice(0, 100)
          kDramaToCache = limitItems(koreanDrama.length ? koreanDrama : trendingTV.slice(0, 8))
          actionAdventureToCache = limitItems(actionAdventureMovies.length ? actionAdventureMovies : trendingToday.slice(0, 8))
          comedyToCache = limitItems(comedyMovies.length ? comedyMovies : trendingToday.slice(0, 8))
          animeToCache = limitItems(animeContent.length ? animeContent : trendingTV.slice(0, 8))
          netflixContentToCache = limitItems([...netflixCatalog.movies.slice(0, 10), ...netflixCatalog.tv.slice(0, 10)])
          primeContentToCache = limitItems([...primeCatalog.movies.slice(0, 10), ...primeCatalog.tv.slice(0, 10)])
          disneyContentToCache = limitItems([...disneyCatalog.movies.slice(0, 10), ...disneyCatalog.tv.slice(0, 10)])
          appleContentToCache = limitItems([...appleCatalog.movies.slice(0, 10), ...appleCatalog.tv.slice(0, 10)])
          maxContentToCache = limitItems([...maxCatalog.movies.slice(0, 10), ...maxCatalog.tv.slice(0, 10)])
          paramountContentToCache = limitItems([...paramountCatalog.movies.slice(0, 10), ...paramountCatalog.tv.slice(0, 10)])
          huluContentToCache = limitItems([...huluCatalog.movies.slice(0, 10), ...huluCatalog.tv.slice(0, 10)])

          setTeenRomance(sortTeenRomance(teenRomanceToCache))
          setKDrama(kDramaToCache)
          setActionAdventure(actionAdventureToCache)
          setComedy(comedyToCache)
          setAnime(animeToCache)
          setNetflixContent(netflixContentToCache)
          setPrimeContent(primeContentToCache)
          setDisneyContent(disneyContentToCache)
          setAppleContent(appleContentToCache)
          setMaxContent(maxContentToCache)
          setParamountContent(paramountContentToCache)
          setHuluContent(huluContentToCache)
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
          maxContentToCache = []
          paramountContentToCache = []
          huluContentToCache = []

          setTeenRomance(sortTeenRomance(teenRomanceToCache))
          setKDrama(kDramaToCache)
          setActionAdventure(actionAdventureToCache)
          setComedy(comedyToCache)
          setAnime(animeToCache)
          setNetflixContent([])
          setPrimeContent([])
          setDisneyContent([])
          setAppleContent([])
          setMaxContent([])
          setParamountContent([])
          setHuluContent([])
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
      maxContent: maxContentToCache,
      paramountContent: paramountContentToCache,
      huluContent: huluContentToCache,
      timestamp: Date.now(),
    }
  }, [isTVPerformanceMode, limitItems, maxHeroItems, toast])

  useEffect(() => {
    if (!cachedData) {
      fetchHomeContent()
    }
  }, [fetchHomeContent, cachedData])

  const [trendingType, setTrendingType] = useState<'movie' | 'tv'>('movie')
  const [comedyType, setComedyType] = useState<'movie' | 'tv'>('movie')
  const [activePlatform, setActivePlatform] = useState<'Netflix' | 'Prime' | 'Max' | 'Disney' | 'Apple' | 'Paramount' | 'Hulu'>('Netflix')
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false)

  const platformContent = useMemo(() => {
    switch (activePlatform) {
      case 'Netflix': return netflixContent
      case 'Prime': return primeContent
      case 'Disney': return disneyContent
      case 'Apple': return appleContent
      case 'Max': return maxContent
      case 'Paramount': return paramountContent
      case 'Hulu': return huluContent
      default: return netflixContent
    }
  }, [activePlatform, appleContent, disneyContent, huluContent, maxContent, netflixContent, paramountContent, primeContent])

  return (
    <div ref={containerRef} className="min-h-screen relative bg-black">
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

      <div className="container mx-auto py-6 md:py-20 px-4 md:px-8 lg:px-16">
        {fetchError && (
          <section className="mb-16 md:mb-24">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Content load issue</p>
                  <p className="mt-1 text-sm text-gray-200 font-medium">{fetchError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchHomeContent(true)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-xs font-black text-white transition hover:bg-primaryHover shadow-lg shadow-primary/20 uppercase tracking-widest"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        {/* Ranked discovery appears immediately after the hero. */}
        <section className="mb-12 md:mb-28">
          <ContentCarousel
            title="Top 10 Today"
            items={trendingType === 'movie' ? trendingMovies : popularTV}
            type={trendingType}
            loading={heroLoading}
            viewAllTo={trendingType === 'movie' ? '/trending' : '/tv'}
            carouselId={carouselId('Top 10 Today')}
            showRanking
            rightContent={<TypeToggle current={trendingType} onChange={setTrendingType} />}
            {...carouselStateProps}
          />
        </section>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section className="mb-20 md:mb-28">
            <ContentCarousel
              title="Resume Watching"
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
        <section className="mb-20 md:mb-28">
          <div className="mb-8 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary shadow-[0_0_15px_rgba(229,9,20,0.5)] rounded-full" />
              <h2 className="text-2xl font-black text-white md:text-4xl lg:text-5xl tracking-tighter uppercase italic">Kenyan Originals</h2>
            </div>
            <Link to="/kenyan-series" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors pb-2">
              View All
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-8">
            {getOrderedKenyanSeriesItems().slice(0, 4).map((item, idx) => {
              const userRating = getAverageRatingForMedia(item.id)
              const rating = userRating > 0 ? userRating.toFixed(1) : '8.5'

              const cardInner = (
                <>
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover/card:scale-110"
                    />
                    <div className="absolute top-2 left-2 z-20 pointer-events-none select-none">
                      <div className="bg-primary/90 backdrop-blur-md px-1.5 py-0.5 rounded shadow-lg border border-white/10">
                        <span className="text-[8px] font-black text-white tracking-tighter uppercase italic">
                          KE #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 backdrop-blur-[2px]">
                      <div className="rounded-full bg-primary p-4 shadow-[0_0_20px_rgba(229,9,20,0.5)] transform scale-75 group-hover/card:scale-100 transition-transform duration-500">
                        <Play className="h-10 w-10 text-white" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-transparent">
                    <h3 className="truncate text-base font-black text-white group-hover/card:text-primary transition-colors uppercase italic tracking-tight">{item.title}</h3>
                    <div className="mt-2 flex items-center gap-2 opacity-60">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-[11px] font-black italic text-white">{rating}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      {item.year && <span className="text-[11px] font-bold text-white/70">{item.year}</span>}
                    </div>
                  </div>
                </>
              )

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex"
                >
                  {user ? (
                    <Link
                      to={`/kenyan-series/${item.id}`}
                      className="group/card flex w-48 shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-darkSurface shadow-2xl sm:w-56 md:w-56 lg:w-52"
                    >
                      {cardInner}
                    </Link>
                  ) : (
                    <a
                      href={`/kenyan-series/${item.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPendingCardNavigation({
                          type: 'tv' as const,
                          id: String(item.id),
                        })
                        setIsAuthModalOpen(true)
                      }}
                      className="group/card flex w-48 shrink-0 flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-darkSurface shadow-2xl sm:w-56 md:w-56 lg:w-52 text-left"
                    >
                      {cardInner}
                    </a>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Personalized Sections */}
        {user && (
          <>
            <section className="mb-20 md:mb-28">
              <BecauseYouWatched
                allContent={[...featuredMovies, ...trendingMovies, ...popularTV, ...actionAdventure, ...comedy]}
                carouselId={carouselId('Because You Watched')}
                {...carouselStateProps}
              />
            </section>

            <section className="mb-20 md:mb-28">
              <TrendingInYourGenre
                allContent={[...featuredMovies, ...trendingMovies, ...popularTV, ...actionAdventure, ...comedy]}
                carouselId={carouselId('Trending In Your Genre')}
                {...carouselStateProps}
              />
            </section>

            <section className="mb-20 md:mb-28">
              <PersonalizedFavorites
                allContent={[...featuredMovies, ...trendingMovies, ...popularTV, ...actionAdventure, ...comedy]}
                carouselId={carouselId('Your Favorites')}
                {...carouselStateProps}
              />
            </section>
          </>
        )}

        {/* Teen Romance */}
        <section className="mb-20 md:mb-28">
          <ContentCarousel
            title="Teen Romance"
            items={[...curatedTeenRomance, ...teenRomance]}
            type="movie"
            loading={catalogLoading}
            viewAllTo="/movies"
            carouselId={carouselId('Teen Romance')}
            {...carouselStateProps}
          />
        </section>

        <section className="mb-20 md:mb-28">
          <ContentCarousel
            title="Romance"
            items={teenRomance}
            type="movie"
            loading={catalogLoading}
            viewAllTo="/movies"
            carouselId={carouselId('Romance')}
            {...carouselStateProps}
          />
        </section>

        <section className="mb-20 md:mb-28">
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
        </section>

        {/* Live Sports */}
        <section className="mb-20 md:mb-28">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary shadow-[0_0_15px_rgba(229,9,20,0.5)] rounded-full" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">Live Sports</h2>
            </div>
            <Link to="/sports" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">
              View All
            </Link>
          </div>
          <div className="rounded-[2.5rem] border border-white/5 bg-darkSurface overflow-hidden shadow-2xl">
            <LiveMatches limit={liveMatchLimit} />
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="mb-20 md:mb-28">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary shadow-[0_0_15px_rgba(229,9,20,0.5)] rounded-full" />
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase italic">Upcoming</h2>
            </div>
            <Link to="/sports" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">
              View All
            </Link>
          </div>
          <div className="rounded-[2.5rem] border border-white/5 bg-darkSurface overflow-hidden shadow-2xl">
            <LiveMatches limit={liveMatchLimit} variant="upcoming" />
          </div>
        </section>

        {showExtendedHomeContent && (
          <>
            {/* Korean Dramas */}
            <section className="mb-20 md:mb-28">
              <ContentCarousel
                title="K-Drama"
                items={kDrama}
                type="tv"
                loading={catalogLoading}
                viewAllTo="/tv"
                carouselId={carouselId('Korean Dramas')}
                {...carouselStateProps}
              />
            </section>

            {/* Action & Adventure */}
            <section className="mb-20 md:mb-28">
              <ContentCarousel
                title="Action Movies"
                items={actionAdventure}
                type="movie"
                loading={catalogLoading}
                viewAllTo="/movies"
                carouselId={carouselId('Action & Adventure')}
                {...carouselStateProps}
              />
            </section>

            {/* Comedy - Landscape */}
            <section className="mb-20 md:mb-28">
              <ContentCarousel
                title="Comedy Highlights"
                items={comedy}
                type="movie"
                loading={catalogLoading}
                viewAllTo="/movies"
                carouselId={carouselId('Comedy')}
                variant="landscape"
                rightContent={<TypeToggle current={comedyType} onChange={setComedyType} />}
                {...carouselStateProps}
              />
            </section>

            {/* Anime */}
            <section className="mb-20 md:mb-28">
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

            {/* Featured This Week - Landscape */}
            <section className="mb-20 md:mb-28">
              <ContentCarousel
                title="Weekly Picks"
                items={[...trendingMovies.slice(0, 4), ...popularTV.slice(0, 4)]}
                type="movie"
                loading={primaryLoading}
                carouselId={carouselId('Featured This Week')}
                variant="landscape"
                {...carouselStateProps}
              />
            </section>
          </>
        )}

        {/* My List */}
        <section className="mb-20 md:mb-28">
          <ContentCarousel
            title="My Collection"
            items={myList.length > 0 ? myList.map(m => ({ id: Number(m.id), title: m.title, poster: m.poster, rating: m.rating ?? '0', year: m.year, type: m.type })) : trendingMovies.slice(0, 5)}
            type="movie"
            loading={primaryLoading && myList.length === 0}
            viewAllTo="/my-list"
            carouselId={carouselId('My List')}
            {...carouselStateProps}
          />
        </section>

        {/* Explore Platforms */}
        <section className="mb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
              <div className="flex items-center gap-5">
                <div className="w-1.5 h-12 bg-primary shadow-[0_0_20px_rgba(229,9,20,0.6)] rounded-full" />
                <div>
                  <h2 className="text-3xl font-black text-white md:text-5xl lg:text-6xl tracking-tighter uppercase italic leading-none">Studio Hub</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Select your favorite streaming studio</p>
                </div>
              </div>
              <div className="relative self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setIsPlatformMenuOpen((open) => !open)}
                  aria-expanded={isPlatformMenuOpen}
                  aria-haspopup="menu"
                  className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-darkSurface/80 px-5 py-3 text-left text-xs font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-2xl transition hover:border-primary/50 hover:bg-darkSurface"
                >
                  <span className="text-gray-500">Studio</span>
                  <span>{activePlatform === 'Prime' ? 'Prime Video' : activePlatform === 'Apple' ? 'Apple TV+' : activePlatform === 'Paramount' ? 'Paramount+' : activePlatform}</span>
                  <ChevronDown className={`h-4 w-4 text-primary transition-transform ${isPlatformMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPlatformMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Choose streaming studio"
                    className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#151515]/95 p-2 shadow-2xl backdrop-blur-2xl"
                  >
                    {(['Netflix', 'Prime', 'Max', 'Disney', 'Apple', 'Paramount', 'Hulu'] as const).map((platform) => {
                      const label = platform === 'Prime' ? 'Prime Video' : platform === 'Apple' ? 'Apple TV+' : platform === 'Paramount' ? 'Paramount+' : platform
                      const isActive = activePlatform === platform

                      return (
                        <button
                          key={platform}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActivePlatform(platform)
                            setIsPlatformMenuOpen(false)
                          }}
                          className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-widest transition ${
                            isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {label}
                          {isActive && <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePlatform}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ContentCarousel
                  title={`Exclusives: ${activePlatform === 'Prime' ? 'Prime Video' : activePlatform === 'Apple' ? 'Apple TV+' : activePlatform === 'Paramount' ? 'Paramount+' : activePlatform}`}
                  items={platformContent}
                  type="movie"
                  loading={catalogLoading}
                  carouselId={carouselId(`Only on ${activePlatform}`)}
                  {...carouselStateProps}
                />
              </motion.div>
            </AnimatePresence>
        </section>
      </div>
    </div>
  )
}
