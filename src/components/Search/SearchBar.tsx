import { useState, useEffect } from 'react'
import { Search, X, Film, Tv, Trophy, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tmdbApi } from '../../api/tmdb'

interface SearchBarProps {
  onClose?: () => void
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const fallbackData = [
    { id: '1078605', title: 'Vidking Test Movie', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', year: 2024 },
    { id: '693134', title: 'Dune: Part Two', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', year: 2024 },
    { id: '872585', title: 'Oppenheimer', type: 'movie', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', year: 2023 },
    { id: '119051', title: 'Vidking Test Series', type: 'tv', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', year: 2021 },
    { id: '100088', title: 'The Last of Us', type: 'tv', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', year: 2023 },
    { id: '4', title: 'Attack on Titan', type: 'anime', poster: 'https://image.tmdb.org/t/p/w500/t21Ic7W6YBTURa1eLj5g3Z9Dqy.jpg', year: 2013 },
    { id: '5', title: 'Manchester United vs Liverpool', type: 'sports', poster: '', year: 2024 },
    { id: '6', title: 'Real Madrid vs Barcelona', type: 'sports', poster: '', year: 2024 },
  ]

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      async function search() {
        try {
          const tmdbResults = await tmdbApi.searchMulti(query)
          setResults(tmdbResults)
        } catch (error) {
          console.warn('TMDB search unavailable, using fallback search:', error)
          const filtered = fallbackData.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
          setResults(filtered)
        } finally {
          setIsSearching(false)
        }
      }

      search()
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

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
    <div className="fixed inset-0 z-50 bg-deepBlack/95 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, anime, sports..."
              className="w-full pl-12 pr-12 py-3 bg-white/10 rounded-full border border-white/20 focus:border-neonPink focus:outline-none neon-glow text-white placeholder-gray-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonPink neon-glow" />
          </div>
        ) : query.length < 2 ? (
          <div className="text-center text-gray-400 mt-20">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Start typing to search</p>
            <p className="text-sm mt-2">Movies, TV shows, anime, and sports</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">No results found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((item, index) => (
              <Link
                key={item.id}
                to={getRoute(item)}
                onClick={onClose}
                className="flex items-center gap-4 p-4 glass rounded-lg hover:bg-white/10 transition-all card-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-24 bg-white/10 rounded flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-neonPink" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                      <span className="text-xs capitalize">{item.type}</span>
                    </div>
                    {item.year && <span className="text-xs text-gray-400">{item.year}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {query.length < 2 && (
        <div className="p-4 border-t border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {['Dune', 'Oppenheimer', 'Attack on Titan', 'NBA'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-4 py-2 glass rounded-full text-sm hover:bg-white/10 transition-colors"
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
