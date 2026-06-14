import { useState, useEffect } from 'react'
import { Search, X, Film, Tv, Trophy, Zap, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { tmdbApi } from '../../api/tmdb'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useDebounce } from '../../hooks/useDebounce'

interface SearchBarProps {
  onClose?: () => void
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all', // all, movie, tv
    year: 'all',
    rating: 'all',
    sortBy: 'relevance' // relevance, rating, year, newest
  })
  const navigate = useNavigate()
  const searchContainerRef = useFocusTrap(true)
  const debouncedQuery = useDebounce(query, 500)

  const applyFilters = (items: any[]) => {
    let filtered = [...items]

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type)
    }

    // Filter by year
    if (filters.year !== 'all') {
      if (filters.year === '2010s') {
        filtered = filtered.filter(item => item.year >= 2010 && item.year < 2020)
      } else if (filters.year === '2000s') {
        filtered = filtered.filter(item => item.year >= 2000 && item.year < 2010)
      } else {
        filtered = filtered.filter(item => item.year === parseInt(filters.year))
      }
    }

    // Filter by rating
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating)
      filtered = filtered.filter(item => item.rating && parseFloat(item.rating) >= minRating)
    }

    // Sort results
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'))
    } else if (filters.sortBy === 'year') {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0))
    } else if (filters.sortBy === 'oldest') {
      filtered.sort((a, b) => (a.year || 0) - (b.year || 0))
    }

    return filtered
  }

  const fallbackData = [
    { id: '1078605', title: 'Test Movie', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', year: 2024 },
    { id: '693134', title: 'Dune: Part Two', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', year: 2024 },
    { id: '872585', title: 'Oppenheimer', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', year: 2023 },
    { id: '119051', title: 'Test Series', type: 'tv', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', year: 2021 },
    { id: '100088', title: 'The Last of Us', type: 'tv', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', year: 2023 },
    { id: '4', title: 'Attack on Titan', type: 'anime', poster: 'https://image.tmdb.org/t/p/w500/t21Ic7W6YBTURa1eLj5g3Z9Dqy.jpg', year: 2013 },
    { id: '5', title: 'Manchester United vs Liverpool', type: 'sports', poster: '', year: 2024 },
    { id: '6', title: 'Real Madrid vs Barcelona', type: 'sports', poster: '', year: 2024 },
  ]

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setSelectedIndex(-1)
      return
    }

    setIsSearching(true)
    setSelectedIndex(-1)
    async function search() {
      try {
        const tmdbResults = await tmdbApi.searchMulti(debouncedQuery)
        const filteredResults = applyFilters(tmdbResults)
        setResults(filteredResults)
      } catch (error) {
        console.warn('TMDB search unavailable, using fallback search:', error)
        const filtered = fallbackData.filter((item) =>
          item.title.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        const filteredResults = applyFilters(filtered)
        setResults(filteredResults)
      } finally {
        setIsSearching(false)
      }
    }

    search()
  }, [debouncedQuery, filters, applyFilters])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const selectedItem = results[selectedIndex]
          navigate(getRoute(selectedItem))
          onClose?.()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose?.()
        break
    }
  }

  const handleResultClick = (item: any) => {
    navigate(getRoute(item))
    onClose?.()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="w-4 h-4" />
      case 'tv':
        return <Tv className="w-4 h-4" />
      case 'anime':
        return <Zap className="w-4 h-4" />
      case 'sports':
        return <Trophy className="w-4 h-4" />
      default:
        return <Film className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie':
        return 'text-blue-400'
      case 'tv':
        return 'text-purple-400'
      case 'anime':
        return 'text-pink-400'
      case 'sports':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRoute = (item: any) => {
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

  return (
    <div ref={searchContainerRef} className="fixed inset-0 z-50 bg-deepBlack/95 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search movies, TV shows, anime, sports..."
              className="w-full pl-14 pr-14 py-4 bg-white/10 rounded-full border border-white/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-white placeholder-gray-400 transition-all duration-300 text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
              showFilters ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 animate-fade-in">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2010s">2010s</option>
              <option value="2000s">2000s</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Ratings</option>
              <option value="8">8+ Rating</option>
              <option value="7">7+ Rating</option>
              <option value="6">6+ Rating</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Highest Rated</option>
              <option value="year">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {isSearching ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-glow" />
          </div>
        ) : query.length < 2 ? (
          <div className="text-center text-gray-400 mt-24">
            <Search className="w-20 h-20 mx-auto mb-6 opacity-50" />
            <p className="text-xl font-semibold mb-2">Start typing to search</p>
            <p className="text-base">Movies, TV shows, anime, and sports</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-400 mt-24">
            <p className="text-xl font-semibold mb-2">No results found</p>
            <p className="text-base">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleResultClick(item)}
                className={`flex items-center gap-4 p-5 bg-darkSurface rounded-xl border transition-all duration-300 animate-fade-in w-full text-left ${
                  index === selectedIndex
                    ? 'border-primary/50 bg-primary/10 shadow-glow'
                    : 'border-white/5 hover:border-white/10 hover:bg-darkHover hover:shadow-lg hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-20 h-28 bg-white/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      <span className="text-sm capitalize font-medium">{item.type}</span>
                    </div>
                    {item.year && <span className="text-sm text-gray-500">•</span>}
                    {item.year && <span className="text-sm text-gray-500 font-medium">{item.year}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {query.length < 2 && (
        <div className="p-6 border-t border-white/10">
          <h3 className="text-base font-bold text-gray-400 mb-4">Recent Searches</h3>
          <div className="flex flex-wrap gap-3">
            {['Dune', 'Oppenheimer', 'Attack on Titan', 'NBA', 'The Last of Us', 'Formula 1'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-5 py-2.5 bg-darkSurface rounded-full text-base border border-white/10 hover:bg-darkHover hover:border-white/20 hover:shadow-lg transition-all duration-300 font-medium"
              >
                {term}
              </button>
            ))}
          </div>
          <h3 className="text-base font-bold text-gray-400 mb-4 mt-8">Popular Searches</h3>
          <div className="flex flex-wrap gap-3">
            {['Marvel', 'DC', 'Horror', 'Comedy', 'Action', 'Drama'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-5 py-2.5 bg-darkSurface rounded-full text-base border border-white/10 hover:bg-darkHover hover:border-white/20 hover:shadow-lg transition-all duration-300 font-medium"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
