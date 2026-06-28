import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star, Trash2, Grid, List as ListIcon, Filter, SortAsc } from 'lucide-react'
import { useStore } from '../store/useStore'

type ViewMode = 'grid' | 'carousel'
type SortBy = 'recent' | 'alphabetical' | 'rating'
type FilterType = 'all' | 'movie' | 'tv' | 'sports' | 'anime'

export default function MyList() {
  const myList = useStore((state) => state.myList)
  const removeFromMyList = useStore((state) => state.removeFromMyList)
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [filterType, setFilterType] = useState<FilterType>('all')

  // Filter and sort items
  const filteredItems = myList.filter((item) => 
    filterType === 'all' ? true : item.type === filterType
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.addedAt - a.addedAt
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'rating': {
        const ratingA = parseFloat(a.rating || '0')
        const ratingB = parseFloat(b.rating || '0')
        return ratingB - ratingA
      }
      default:
        return 0
    }
  })

  if (myList.length === 0) {
    return (
      <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16 flex items-center justify-center">
        <div className="glass rounded-xl p-12 md:p-16 text-center max-w-md">
          <div className="text-6xl mb-6">🎬</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Your list is empty</h2>
          <p className="text-gray-400 text-base">Add movies and shows to your list to see them here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12 gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">My List</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg bg-black/30 p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('carousel')}
                className={`p-2 rounded-md transition-all ${viewMode === 'carousel' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="appearance-none bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 pr-10 focus:outline-none focus:border-primary/50"
              >
                <option value="all">All Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Series</option>
                <option value="anime">Anime</option>
                <option value="sports">Sports</option>
              </select>
              <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none bg-black/30 text-white px-4 py-2 rounded-lg border border-white/10 pr-10 focus:outline-none focus:border-primary/50"
              >
                <option value="recent">Recently Added</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="rating">Rating</option>
              </select>
              <SortAsc className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {sortedItems.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-gray-400 text-xl font-semibold mb-2">No items match your filters</p>
            <p className="text-gray-500 text-base">Try changing your filter or sort options</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {sortedItems.map((item) => (
              <div key={item.id} className="group relative">
                <Link
                  to={`/${item.type === 'tv' ? 'tv' : item.type === 'anime' ? 'anime' : 'movie'}/${item.id}`}
                  className="block"
                >
                  <div className="bg-darkSurface rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:shadow-glow border border-white/5 hover:border-white/10">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="w-10 h-10 text-primary" fill="white" />
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-sm md:text-base text-white truncate leading-tight">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary fill-primary" />
                          <span className="text-xs md:text-sm text-gray-400 font-medium">{item.rating}</span>
                        </div>
                        {item.year && <span className="text-xs md:text-sm text-gray-500">•</span>}
                        {item.year && <span className="text-xs md:text-sm text-gray-500 font-medium">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeFromMyList(item.id)
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedItems.map((item) => (
              <div key={item.id} className="group flex gap-4 p-4 glass rounded-xl items-center border border-white/5 hover:border-white/10 transition-all">
                <Link
                  to={`/${item.type === 'tv' ? 'tv' : item.type === 'anime' ? 'anime' : 'movie'}/${item.id}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-24 md:w-32 aspect-[2/3] rounded-lg overflow-hidden">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary" fill="white" />
                    </div>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/${item.type === 'tv' ? 'tv' : item.type === 'anime' ? 'anime' : 'movie'}/${item.id}`}
                  >
                    <h3 className="font-semibold text-lg md:text-xl text-white truncate leading-tight hover:text-primary transition-colors">{item.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary fill-primary" />
                      <span className="text-xs md:text-sm text-gray-400 font-medium">{item.rating}</span>
                    </div>
                    {item.year && <span className="text-xs md:text-sm text-gray-500">•</span>}
                    {item.year && <span className="text-xs md:text-sm text-gray-500 font-medium">{item.year}</span>}
                    <span className="text-xs md:text-sm text-gray-500">•</span>
                    <span className="text-xs md:text-sm text-gray-500 font-medium capitalize">{item.type}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => removeFromMyList(item.id)}
                  className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
