import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Film, Clock, Star, TrendingUp, Award, Heart, Zap, Crown, Flame } from 'lucide-react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

import type { LucideIcon } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  fetchParams: {
    with_genres?: number
    primary_release_year?: number
    with_original_language?: string
    sort_by?: string
    vote_average_gte?: number
    with_keywords?: string
  }
}

const collections: Collection[] = [
  {
    id: '90s-action',
    name: '90s Action Classics',
    description: 'Explosive action films from the golden era of action cinema',
    icon: Flame,
    color: 'from-orange-500 to-red-600',
    fetchParams: {
      with_genres: 28,
      primary_release_year: 1995,
      sort_by: 'vote_average.desc',
      vote_average_gte: 7
    }
  },
  {
    id: 'korean-thrillers',
    name: 'Korean Thrillers',
    description: 'Intense and gripping Korean suspense films',
    icon: Zap,
    color: 'from-blue-600 to-purple-600',
    fetchParams: {
      with_genres: 53,
      with_original_language: 'ko',
      sort_by: 'vote_average.desc',
      vote_average_gte: 7
    }
  },
  {
    id: 'oscar-winners',
    name: 'Oscar Winners',
    description: 'Academy Award winning films and masterpieces',
    icon: Award,
    color: 'from-yellow-500 to-amber-600',
    fetchParams: {
      sort_by: 'vote_average.desc',
      vote_average_gte: 7.5
    }
  },
  {
    id: 'cult-classics',
    name: 'Cult Classics',
    description: 'Beloved films that have achieved cult status',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    fetchParams: {
      sort_by: 'popularity.desc',
      vote_average_gte: 7
    }
  },
  {
    id: 'romantic-comedies',
    name: 'Romantic Comedies',
    description: 'Heartwarming and hilarious love stories',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    fetchParams: {
      with_genres: 10749,
      sort_by: 'popularity.desc',
      vote_average_gte: 6.5
    }
  },
  {
    id: 'sci-fi-gems',
    name: 'Sci-Fi Gems',
    description: 'Mind-bending science fiction masterpieces',
    icon: Star,
    color: 'from-cyan-500 to-blue-600',
    fetchParams: {
      with_genres: 878,
      sort_by: 'vote_average.desc',
      vote_average_gte: 7
    }
  },
  {
    id: 'horror-favorites',
    name: 'Horror Favorites',
    description: 'Terrifying horror films that will keep you up at night',
    icon: Crown,
    color: 'from-gray-700 to-gray-900',
    fetchParams: {
      with_genres: 27,
      sort_by: 'vote_average.desc',
      vote_average_gte: 6.5
    }
  },
  {
    id: 'family-friendly',
    name: 'Family Friendly',
    description: 'Great movies for the whole family to enjoy',
    icon: Heart,
    color: 'from-green-500 to-teal-500',
    fetchParams: {
      with_genres: 10751,
      sort_by: 'popularity.desc',
      vote_average_gte: 6.5
    }
  },
  {
    id: 'trending-now',
    name: 'Trending Now',
    description: 'The hottest movies everyone is watching',
    icon: TrendingUp,
    color: 'from-red-500 to-pink-600',
    fetchParams: {
      sort_by: 'popularity.desc'
    }
  },
  {
    id: 'hidden-gems',
    name: 'Hidden Gems',
    description: 'Underrated films that deserve more attention',
    icon: Star,
    color: 'from-indigo-500 to-purple-600',
    fetchParams: {
      sort_by: 'vote_average.desc',
      vote_average_gte: 7.5
    }
  },
  {
    id: '80s-nostalgia',
    name: '80s Nostalgia',
    description: 'Iconic films from the decade of excess',
    icon: Clock,
    color: 'from-pink-600 to-purple-600',
    fetchParams: {
      primary_release_year: 1985,
      sort_by: 'vote_average.desc',
      vote_average_gte: 6.5
    }
  },
  {
    id: 'anime-movies',
    name: 'Anime Movies',
    description: 'Stunning animated films from Japan',
    icon: Film,
    color: 'from-violet-500 to-purple-600',
    fetchParams: {
      with_genres: 16,
      with_original_language: 'ja',
      sort_by: 'vote_average.desc',
      vote_average_gte: 7
    }
  }
]

export default function Collections() {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [collectionContent, setCollectionContent] = useState<MovieSummary[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const fetchCollectionContent = useCallback(async (collection: Collection) => {
    setLoading(true)
    try {
      const movies = await tmdbApi.discoverMovies(collection.fetchParams)
      setCollectionContent(movies.slice(0, 20))
    } catch (error) {
      console.error('Failed to fetch collection content:', error)
      toast.error('Failed to load collection. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleCollectionSelect = (collection: Collection) => {
    setSelectedCollection(collection)
    fetchCollectionContent(collection)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Curated Collections</h1>
          <p className="text-gray-400 text-lg">Hand-picked playlists for every mood and occasion</p>
        </div>

        {!selectedCollection ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {collections.map((collection, index) => {
              const Icon = collection.icon
              return (
                <motion.button
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCollectionSelect(collection)}
                  className="group relative glass rounded-2xl p-6 text-left hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${collection.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${collection.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{collection.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{collection.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => setSelectedCollection(null)}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to collections
            </button>

            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedCollection.color} flex items-center justify-center`}>
                  <selectedCollection.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedCollection.name}</h2>
                  <p className="text-gray-400">{selectedCollection.description}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : collectionContent.length > 0 ? (
                <ContentCarousel
                  title={`${selectedCollection.name} Movies`}
                  items={collectionContent}
                  type="movie"
                  showProgress={false}
                  loading={loading}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p>No content found in this collection. Try another one!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
