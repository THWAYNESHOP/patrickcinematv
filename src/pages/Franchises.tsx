import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Crown, Shield, Rocket, Ghost, Flame, Zap } from 'lucide-react'
import ContentCarousel from '../components/Home/ContentCarousel'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

interface Franchise {
  id: number
  name: string
  description: string
  icon: any
  color: string
  collectionId: number
}

const franchises: Franchise[] = [
  {
    id: 1,
    name: 'Marvel Cinematic Universe',
    description: 'The interconnected universe of superhero films from Marvel Studios',
    icon: Shield,
    color: 'from-red-600 to-red-800',
    collectionId: 86311 // MCU collection ID
  },
  {
    id: 2,
    name: 'Star Wars',
    description: 'The epic space opera franchise set in a galaxy far, far away',
    icon: Rocket,
    color: 'from-yellow-500 to-yellow-700',
    collectionId: 10 // Star Wars collection ID
  },
  {
    id: 3,
    name: 'Harry Potter',
    description: 'The wizarding world of Harry Potter and Fantastic Beasts',
    icon: Sparkles,
    color: 'from-purple-600 to-indigo-800',
    collectionId: 1241 // Harry Potter collection ID
  },
  {
    id: 4,
    name: 'DC Universe',
    description: 'Superhero films based on DC Comics characters',
    icon: Crown,
    color: 'from-blue-600 to-blue-800',
    collectionId: 131292 // DC collection ID
  },
  {
    id: 5,
    name: 'Jurassic Park',
    description: 'The dinosaur adventure franchise',
    icon: Ghost,
    color: 'from-green-600 to-green-800',
    collectionId: 348 // Jurassic Park collection ID
  },
  {
    id: 6,
    name: 'Fast & Furious',
    description: 'High-octane action racing franchise',
    icon: Flame,
    color: 'from-orange-600 to-red-600',
    collectionId: 96856 // Fast & Furious collection ID
  },
  {
    id: 7,
    name: 'Transformers',
    description: 'Robots in disguise - the Autobots vs Decepticons',
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    collectionId: 87118 // Transformers collection ID
  },
  {
    id: 8,
    name: 'James Bond',
    description: 'The iconic British spy franchise',
    icon: Crown,
    color: 'from-slate-600 to-slate-800',
    collectionId: 645 // James Bond collection ID
  }
]

export default function Franchises() {
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null)
  const [franchiseContent, setFranchiseContent] = useState<MovieSummary[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const fetchFranchiseContent = useCallback(async (franchise: Franchise) => {
    setLoading(true)
    try {
      // Fetch collection details from TMDB
      const response = await fetch(
        `https://api.themoviedb.org/3/collection/${franchise.collectionId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch franchise data')
      }
      
      const data = await response.json()
      
      // Convert parts to MovieSummary format
      const movies: MovieSummary[] = (data.parts || []).map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}?quality=90&format=webp`
          : 'https://via.placeholder.com/300x450?text=No+Image',
        backdrop: movie.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}?quality=90&format=webp`
          : undefined,
        overview: movie.overview,
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
        year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : undefined,
        type: 'movie',
      })).sort((a: MovieSummary, b: MovieSummary) => (a.year || 0) - (b.year || 0))
      
      setFranchiseContent(movies)
    } catch (error) {
      console.error('Failed to fetch franchise content:', error)
      toast.error('Failed to load franchise content. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleFranchiseSelect = (franchise: Franchise) => {
    setSelectedFranchise(franchise)
    fetchFranchiseContent(franchise)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Franchise Collections</h1>
          <p className="text-gray-400 text-lg">Explore complete film series and cinematic universes</p>
        </div>

        {!selectedFranchise ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {franchises.map((franchise, index) => {
              const Icon = franchise.icon
              return (
                <motion.button
                  key={franchise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleFranchiseSelect(franchise)}
                  className="group relative glass rounded-2xl p-6 text-left hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${franchise.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${franchise.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{franchise.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{franchise.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => setSelectedFranchise(null)}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to franchises
            </button>

            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedFranchise.color} flex items-center justify-center`}>
                  <selectedFranchise.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedFranchise.name}</h2>
                  <p className="text-gray-400">{selectedFranchise.description}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : franchiseContent.length > 0 ? (
                <ContentCarousel
                  title={`${selectedFranchise.name} Movies`}
                  items={franchiseContent}
                  type="movie"
                  showProgress={false}
                  loading={loading}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p>No content found in this franchise. Try another one!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
