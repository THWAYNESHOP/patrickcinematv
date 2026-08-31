import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Heart, Zap, Coffee, Skull, Smile, Wind, Flame, Moon } from 'lucide-react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

interface Mood {
  id: string
  name: string
  icon: any
  description: string
  genres: number[]
  color: string
}

const moods: Mood[] = [
  {
    id: 'happy',
    name: 'Happy & Uplifting',
    icon: Smile,
    description: 'Feel-good movies and comedies to brighten your day',
    genres: [35, 10749], // Comedy, Romance
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'thrilled',
    name: 'Thrilled & Excited',
    icon: Flame,
    description: 'Action-packed adventures and high-octane thrills',
    genres: [28, 12, 53], // Action, Adventure, Thriller
    color: 'from-red-500 to-orange-600'
  },
  {
    id: 'relaxed',
    name: 'Relaxed & Chill',
    icon: Coffee,
    description: 'Easy-going content for a laid-back viewing experience',
    genres: [10751, 18], // Family, Drama
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'romantic',
    name: 'Romantic',
    icon: Heart,
    description: 'Love stories and romantic comedies',
    genres: [10749, 10764], // Romance, Romance (TV)
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'scared',
    name: 'Spooky & Scary',
    icon: Skull,
    description: 'Horror and suspense to give you chills',
    genres: [27, 9648], // Horror, Mystery
    color: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'adventurous',
    name: 'Adventurous',
    icon: Zap,
    description: 'Epic journeys and exploration',
    genres: [12, 37, 14], // Adventure, Western, Fantasy
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'thoughtful',
    name: 'Thoughtful & Deep',
    icon: Moon,
    description: 'Philosophical dramas and mind-bending stories',
    genres: [18, 878], // Drama, Sci-Fi
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'inspired',
    name: 'Inspired & Motivated',
    icon: Sparkles,
    description: 'Biographies and stories of triumph',
    genres: [18, 36], // Drama, History
    color: 'from-amber-500 to-yellow-500'
  }
]

export default function MoodRecommendations() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [recommendations, setRecommendations] = useState<MovieSummary[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const fetchRecommendations = useCallback(async (mood: Mood) => {
    setLoading(true)
    try {
      const results: MovieSummary[] = []
      
      // Fetch movies for each genre in the mood
      for (const genreId of mood.genres) {
        const movies = await tmdbApi.discoverMovies({ with_genres: genreId, sort_by: 'popularity.desc' })
        results.push(...movies.slice(0, 5))
      }
      
      // Remove duplicates and limit results
      const uniqueResults = Array.from(
        new Map(results.map(item => [item.id, item])).values()
      ).slice(0, 20)
      
      setRecommendations(uniqueResults)
    } catch (error) {
      console.error('Failed to fetch mood recommendations:', error)
      toast.error('Failed to load recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    fetchRecommendations(mood)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mood-Based Recommendations</h1>
          <p className="text-gray-400 text-lg">How are you feeling today? Let us find the perfect content for you.</p>
        </div>

        {!selectedMood ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {moods.map((mood, index) => {
              const Icon = mood.icon
              return (
                <motion.button
                  key={mood.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleMoodSelect(mood)}
                  className="group relative glass rounded-2xl p-6 text-left hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{mood.name}</h3>
                    <p className="text-sm text-gray-400">{mood.description}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => setSelectedMood(null)}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Back to moods
            </button>

            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedMood.color} flex items-center justify-center`}>
                  <selectedMood.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedMood.name}</h2>
                  <p className="text-gray-400">{selectedMood.description}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : recommendations.length > 0 ? (
                <ContentCarousel
                  title="Recommended for you"
                  items={recommendations}
                  type="movie"
                  showProgress={false}
                  loading={loading}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p>No recommendations found for this mood. Try another one!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
