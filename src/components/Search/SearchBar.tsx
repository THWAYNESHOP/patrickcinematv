import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Film,
  Filter,
  Search,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Tv,
  X,
  Zap,
} from 'lucide-react'
import { tmdbApi } from '../../api/tmdb'
import type { MovieSummary } from '../../api/tmdb'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useDebounce } from '../../hooks/useDebounce'
import { getSearchSuggestions, performFuzzySearch, type SearchableItem } from '../../utils/fuzzySearch'

interface SearchBarProps {
  onClose?: () => void
}

type FilterType = 'all' | SearchableItem['type']

interface SearchFilters {
  type: FilterType
  year: string
  rating: string
  genre: string
  language: string
  sortBy: 'relevance' | 'rating' | 'year' | 'oldest'
}

interface ResultGroup {
  type: SearchableItem['type']
  label: string
  items: SearchableItem[]
  startIndex: number
}

const RECENT_SEARCHES_KEY = 'nexastream-recent-searches'
const MAX_RECENT_SEARCHES = 6

const POPULAR_SEARCHES = ['Dune', 'Oppenheimer', 'The Last of Us', 'Attack on Titan', 'NBA', 'Formula 1']

const QUICK_FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV', value: 'tv' },
  { label: 'Anime', value: 'anime' },
  { label: 'Sports', value: 'sports' },
]

const TYPE_ORDER: SearchableItem['type'][] = ['movie', 'tv', 'anime', 'sports']

const TYPE_LABELS: Record<SearchableItem['type'], string> = {
  movie: 'Movies',
  tv: 'TV Shows',
  anime: 'Anime',
  sports: 'Sports',
}

const fallbackData: SearchableItem[] = [
  {
    id: '1078605',
    title: 'Test Movie',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: '8.0',
    year: 2024,
    genre: [],
    language: 'en',
  },
  {
    id: '693134',
    title: 'Dune: Part Two',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: '8.2',
    year: 2024,
    genre: [],
    language: 'en',
  },
  {
    id: '872585',
    title: 'Oppenheimer',
    type: 'movie',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: '8.1',
    year: 2023,
    genre: [],
    language: 'en',
  },
  {
    id: '119051',
    title: 'Test Series',
    type: 'tv',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    rating: '8.3',
    year: 2021,
    genre: [],
    language: 'en',
  },
  {
    id: '100088',
    title: 'The Last of Us',
    type: 'tv',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    rating: '8.6',
    year: 2023,
    genre: [],
    language: 'en',
  },
  {
    id: '4',
    title: 'Attack on Titan',
    type: 'anime',
    poster: 'https://image.tmdb.org/t/p/w500/t21Ic7W6YBTURa1eLj5g3Z9Dqy.jpg',
    rating: '9.0',
    year: 2013,
    genre: [],
    language: 'ja',
  },
  {
    id: '5',
    title: 'Manchester United vs Liverpool',
    type: 'sports',
    poster: '',
    rating: '8.0',
    year: 2024,
    genre: [],
    language: 'en',
  },
  {
    id: '6',
    title: 'Real Madrid vs Barcelona',
    type: 'sports',
    poster: '',
    rating: '8.0',
    year: 2024,
    genre: [],
    language: 'en',
  },
]

function normalizeSearchTerm(term: string) {
  return term.trim().replace(/\s+/g, ' ')
}

function readRecentSearches() {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed)
      ? parsed.filter((term): term is string => typeof term === 'string' && term.trim().length > 0).slice(0, MAX_RECENT_SEARCHES)
      : []
  } catch {
    return []
  }
}

function writeRecentSearches(terms: string[]) {
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(terms))
  } catch {
    // Search history is useful, not critical.
  }
}

function getTypeIcon(type: FilterType) {
  switch (type) {
    case 'movie':
      return <Film className="h-4 w-4" aria-hidden="true" />
    case 'tv':
      return <Tv className="h-4 w-4" aria-hidden="true" />
    case 'anime':
      return <Zap className="h-4 w-4" aria-hidden="true" />
    case 'sports':
      return <Trophy className="h-4 w-4" aria-hidden="true" />
    default:
      return <Sparkles className="h-4 w-4" aria-hidden="true" />
  }
}

function getTypeColor(type: SearchableItem['type']) {
  switch (type) {
    case 'movie':
      return 'text-blue-300'
    case 'tv':
      return 'text-purple-300'
    case 'anime':
      return 'text-pink-300'
    case 'sports':
      return 'text-green-300'
    default:
      return 'text-gray-300'
  }
}

function getRoute(item: SearchableItem) {
  switch (item.type) {
    case 'movie':
      return `/movie/${item.id}`
    case 'tv':
      return `/tv/${item.id}`
    case 'anime':
      return `/anime/${item.id}`
    case 'sports':
      return `/sports/${item.id}`
    default:
      return '/'
  }
}

function mapTmdbResult(item: MovieSummary): SearchableItem {
  const extra = item as MovieSummary & { genres?: string[]; language?: string }

  return {
    id: String(item.id),
    title: item.title,
    type: item.type === 'tv' ? 'tv' : 'movie',
    year: item.year,
    rating: item.rating,
    poster: item.poster,
    genre: extra.genres || [],
    language: extra.language,
  }
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchableItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches())
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    year: 'all',
    rating: 'all',
    genre: 'all',
    language: 'all',
    sortBy: 'relevance',
  })

  const searchRequestId = useRef(0)
  const searchCacheRef = useRef(new Map<string, SearchableItem[]>())
  const navigate = useNavigate()
  const searchContainerRef = useFocusTrap(true)
  const debouncedQuery = useDebounce(normalizeSearchTerm(query), 350)

  const applyFilters = useCallback(
    (items: SearchableItem[]) => {
      let filtered = [...items]

      if (filters.type !== 'all') {
        filtered = filtered.filter((item) => item.type === filters.type)
      }

      if (filters.year !== 'all') {
        if (filters.year === '2010s') {
          filtered = filtered.filter((item) => (item.year ?? 0) >= 2010 && (item.year ?? 0) < 2020)
        } else if (filters.year === '2000s') {
          filtered = filtered.filter((item) => (item.year ?? 0) >= 2000 && (item.year ?? 0) < 2010)
        } else if (filters.year === '2020s') {
          filtered = filtered.filter((item) => (item.year ?? 0) >= 2020)
        } else {
          filtered = filtered.filter((item) => (item.year ?? 0) === Number(filters.year))
        }
      }

      if (filters.rating !== 'all') {
        const minRating = Number(filters.rating)
        filtered = filtered.filter((item) => Number(item.rating) >= minRating)
      }

      if (filters.genre !== 'all') {
        filtered = filtered.filter((item) =>
          item.genre?.some((genre) => genre.toLowerCase() === filters.genre),
        )
      }

      if (filters.language !== 'all') {
        filtered = filtered.filter((item) => item.language === filters.language)
      }

      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => Number(b.rating) - Number(a.rating))
      } else if (filters.sortBy === 'year') {
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0))
      } else if (filters.sortBy === 'oldest') {
        filtered.sort((a, b) => (a.year || 0) - (b.year || 0))
      }

      return filtered
    },
    [filters],
  )

  const saveRecentSearch = useCallback((term: string) => {
    const normalized = normalizeSearchTerm(term)
    if (normalized.length < 2) return

    setRecentSearches((current) => {
      const next = [
        normalized,
        ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES)

      writeRecentSearches(next)
      return next
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    writeRecentSearches([])
  }, [])

  const runSearch = useCallback(
    (items: SearchableItem[], searchTerm: string) => {
      const fuzzyResults = performFuzzySearch(items, searchTerm)
      const nextSuggestions = getSearchSuggestions(items, searchTerm)
        .filter((suggestion) => suggestion.toLowerCase() !== searchTerm.toLowerCase())
        .slice(0, 4)

      setSuggestions(nextSuggestions)
      setResults(applyFilters(fuzzyResults))
    },
    [applyFilters],
  )

  useEffect(() => {
    const activeQuery = normalizeSearchTerm(debouncedQuery)

    if (activeQuery.length < 2) {
      searchRequestId.current += 1
      setResults([])
      setSelectedIndex(-1)
      setSuggestions([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const requestId = ++searchRequestId.current
    const cacheKey = activeQuery.toLowerCase()
    const cachedResults = searchCacheRef.current.get(cacheKey)

    setSelectedIndex(-1)
    setSearchError(null)

    if (cachedResults) {
      setIsSearching(false)
      runSearch(cachedResults, activeQuery)
      return
    }

    setIsSearching(true)

    async function search() {
      try {
        const tmdbResults = await tmdbApi.searchMulti(activeQuery)

        if (requestId !== searchRequestId.current) return

        const searchableItems = tmdbResults.map(mapTmdbResult)
        searchCacheRef.current.set(cacheKey, searchableItems)
        runSearch(searchableItems, activeQuery)
      } catch (error) {
        if (requestId !== searchRequestId.current) return

        if (import.meta.env.DEV) {
          console.warn('TMDB search unavailable, using fallback search:', error)
        }

        setSearchError('Search service is unavailable, so fallback results are shown.')
        runSearch(fallbackData, activeQuery)
      } finally {
        if (requestId === searchRequestId.current) {
          setIsSearching(false)
        }
      }
    }

    search()
  }, [debouncedQuery, runSearch])

  const resultGroups = useMemo<ResultGroup[]>(() => {
    let startIndex = 0

    return TYPE_ORDER.map((type) => {
      const items = results.filter((item) => item.type === type)
      const group = {
        type,
        label: TYPE_LABELS[type],
        items,
        startIndex,
      }

      startIndex += items.length
      return group
    }).filter((group) => group.items.length > 0)
  }, [results])

  const resultCountLabel = results.length === 1 ? '1 result' : `${results.length} results`

  const navigateToResult = useCallback(
    (item: SearchableItem) => {
      saveRecentSearch(query || item.title)
      navigate(getRoute(item))
      onClose?.()
    },
    [navigate, onClose, query, saveRecentSearch],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        if (results.length === 0) return
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        if (results.length === 0) return
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter': {
        if (results.length === 0) return
        e.preventDefault()
        const nextItem = results[selectedIndex >= 0 ? selectedIndex : 0]
        navigateToResult(nextItem)
        break
      }
      case 'Escape':
        e.preventDefault()
        onClose?.()
        break
    }
  }

  useEffect(() => {
    const element = searchContainerRef.current
    if (!element) return

    const handleFocusTrapEscape = () => {
      onClose?.()
    }

    element.addEventListener('focusTrapEscape', handleFocusTrapEscape as EventListener)
    return () => {
      element.removeEventListener('focusTrapEscape', handleFocusTrapEscape as EventListener)
    }
  }, [onClose, searchContainerRef])

  const setQuickFilter = (type: FilterType) => {
    setFilters((current) => ({ ...current, type }))
  }

  const handleChipSearch = (term: string) => {
    setQuery(term)
    saveRecentSearch(term)
  }

  const renderSearchChip = (term: string, variant: 'recent' | 'popular' | 'suggestion') => {
    const Icon = variant === 'recent' ? Clock : Search

    return (
      <button
        key={`${variant}-${term}`}
        type="button"
        onClick={() => handleChipSearch(term)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-darkSurface px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/20 hover:bg-darkHover hover:text-white tv-focusable tv-touch-target"
      >
        <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
        {term}
      </button>
    )
  }

  const renderResult = (item: SearchableItem, index: number) => (
    <button
      key={`${item.type}-${item.id}`}
      type="button"
      onClick={() => navigateToResult(item)}
      className={`group flex min-h-[132px] w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 md:gap-4 md:p-4 ${
        index === selectedIndex
          ? 'border-primary/60 bg-primary/10 shadow-glow'
          : 'border-white/5 bg-darkSurface hover:border-white/10 hover:bg-darkHover'
      }`}
      data-testid="search-result"
    >
      {item.poster ? (
        <img
          src={item.poster}
          alt={item.title}
          className="h-24 w-16 shrink-0 rounded-md object-cover md:h-28 md:w-20"
          loading="lazy"
        />
      ) : (
        <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md bg-white/10 md:h-28 md:w-20">
          {getTypeIcon(item.type)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base font-bold leading-tight text-white md:text-lg">{item.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium md:text-sm">
          <span className={`inline-flex items-center gap-1.5 ${getTypeColor(item.type)}`}>
            {getTypeIcon(item.type)}
            {TYPE_LABELS[item.type]}
          </span>
          {item.year && <span className="text-gray-500">{item.year}</span>}
          {Number(item.rating) > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/15 px-2 py-0.5 text-accent">
              <Star className="h-3 w-3 fill-accent text-accent" aria-hidden="true" />
              {Number(item.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  )

  return (
    <div ref={searchContainerRef} className="fixed inset-0 z-50 flex flex-col bg-deepBlack/98">
      <div className="border-b border-white/10 bg-deepBlack/95 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search movies, TV shows, anime, sports..."
                className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-12 pr-12 text-base text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-gray-500 md:py-4"
                autoFocus
                aria-label="Search content"
                data-testid="search-overlay-input"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white tv-focusable tv-touch-target"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition tv-focusable tv-touch-target ${
                showFilters ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label={showFilters ? 'Close filters' : 'Open filters'}
            >
              <Filter className="h-5 w-5" aria-hidden="true" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10 hover:text-white tv-focusable tv-touch-target"
                aria-label="Close search"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Search type">
            {QUICK_FILTERS.map((filter) => {
              const isActive = filters.type === filter.value

              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setQuickFilter(filter.value)}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition tv-focusable tv-touch-target ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {getTypeIcon(filter.value)}
                  {filter.label}
                </button>
              )
            })}
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-2 animate-fade-in sm:grid-cols-2 lg:grid-cols-5">
              <select
                value={filters.year}
                onChange={(e) => setFilters((current) => ({ ...current, year: e.target.value }))}
                className="min-h-[44px] rounded-lg border border-white/15 bg-darkSurface px-3 py-2 text-sm text-white outline-none transition focus:border-primary tv-focusable tv-touch-target"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2020s">2020s</option>
                <option value="2010s">2010s</option>
                <option value="2000s">2000s</option>
              </select>

              <select
                value={filters.rating}
                onChange={(e) => setFilters((current) => ({ ...current, rating: e.target.value }))}
                className="min-h-[44px] rounded-lg border border-white/15 bg-darkSurface px-3 py-2 text-sm text-white outline-none transition focus:border-primary tv-focusable tv-touch-target"
              >
                <option value="all">All Ratings</option>
                <option value="8">8+ Rating</option>
                <option value="7">7+ Rating</option>
                <option value="6">6+ Rating</option>
              </select>

              <select
                value={filters.genre}
                onChange={(e) => setFilters((current) => ({ ...current, genre: e.target.value }))}
                className="min-h-[44px] rounded-lg border border-white/15 bg-darkSurface px-3 py-2 text-sm text-white outline-none transition focus:border-primary tv-focusable tv-touch-target"
              >
                <option value="all">All Genres</option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="thriller">Thriller</option>
                <option value="romance">Romance</option>
                <option value="animation">Animation</option>
              </select>

              <select
                value={filters.language}
                onChange={(e) => setFilters((current) => ({ ...current, language: e.target.value }))}
                className="min-h-[44px] rounded-lg border border-white/15 bg-darkSurface px-3 py-2 text-sm text-white outline-none transition focus:border-primary tv-focusable tv-touch-target"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((current) => ({ ...current, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                className="min-h-[44px] rounded-lg border border-white/15 bg-darkSurface px-3 py-2 text-sm text-white outline-none transition focus:border-primary tv-focusable tv-touch-target"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="year">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          )}

          {searchError && (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
              {searchError}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-5xl">
          {debouncedQuery.length < 2 ? (
            <div className="space-y-8 pt-6 md:pt-10">
              {recentSearches.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Recent Searches</h2>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white tv-focusable tv-touch-target"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {recentSearches.map((term) => renderSearchChip(term, 'recent'))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">Popular Searches</h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {POPULAR_SEARCHES.map((term) => renderSearchChip(term, 'popular'))}
                </div>
              </section>
            </div>
          ) : isSearching ? (
            <div className="grid gap-3 md:grid-cols-2" aria-label="Searching">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex min-h-[132px] gap-4 rounded-lg border border-white/5 bg-darkSurface p-3">
                  <div className="h-24 w-16 shrink-0 rounded-md bg-white/10 animate-pulse md:h-28 md:w-20" />
                  <div className="flex flex-1 flex-col justify-center gap-3">
                    <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-white/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center text-center">
              <Search className="mb-5 h-14 w-14 text-gray-600" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">No results found</h2>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Try a broader title, switch back to All, or use one of these searches.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.slice(0, 4).map((term) => renderSearchChip(term, 'popular'))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-400">
                    {resultCountLabel} for <span className="text-white">{debouncedQuery}</span>
                  </p>
                </div>
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {suggestions.map((term) => renderSearchChip(term, 'suggestion'))}
                  </div>
                )}
              </div>

              {resultGroups.map((group) => (
                <section key={group.type}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                    {getTypeIcon(group.type)}
                    {group.label}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.items.map((item, index) => renderResult(item, group.startIndex + index))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
