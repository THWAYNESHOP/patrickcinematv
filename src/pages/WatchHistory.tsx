import { Link } from 'react-router-dom'
import { Trash2, Clock, Film, Tv, Trophy } from 'lucide-react'
import { useUserWatchHistory } from '../hooks/useUserWatchHistory'
import { useAuth } from '../hooks/useAuth'
import ContentCarousel from '../components/Home/ContentCarousel'

export default function WatchHistory() {
  const { user } = useAuth()
  const { watchHistory, watchProgress, removeFromHistory, clearHistory, loading } = useUserWatchHistory()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Film className="w-4 h-4" />
      case 'tv':
        return <Tv className="w-4 h-4" />
      case 'sports':
        return <Trophy className="w-4 h-4" />
      default:
        return <Film className="w-4 h-4" />
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to view your watch history</h1>
            <p className="text-gray-400">Your watch history is saved to your account</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-darkSurface rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (watchHistory.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">No watch history yet</h1>
            <p className="text-gray-400 mb-6">Start watching movies and TV shows to build your history</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Browse Content
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Watch History</h1>
            <p className="text-gray-400">{watchHistory.length} items</p>
          </div>
          {watchHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Continue Watching Section */}
        {watchHistory.some((item) => {
          const progress = watchProgress[item.item_id]
          return progress && progress > 0 && progress < 100
        }) && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>
            <ContentCarousel
              title=""
              items={watchHistory
                .filter((item) => {
                  const progress = watchProgress[item.item_id]
                  return progress && progress > 0 && progress < 100
                })
                .map((item) => ({
                  id: Number(item.item_id),
                  title: item.title,
                  poster: item.poster,
                  type: item.type,
                  rating: '0',
                  progress: watchProgress[item.item_id] || 0,
                }))}
              type="movie"
              showProgress
            />
          </section>
        )}

        {/* Full History List */}
        <div className="space-y-3">
          {watchHistory.map((item) => {
            const progress = watchProgress[item.item_id]
            return (
              <div
                key={item.item_id}
                className="flex items-center gap-4 p-4 bg-darkSurface rounded-xl border border-white/5 hover:border-white/10 transition-all group"
              >
                <Link
                  to={`/${item.type === 'tv' ? 'tv' : item.type === 'anime' ? 'anime' : 'movie'}/${item.item_id}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/${item.type === 'tv' ? 'tv' : item.type === 'anime' ? 'anime' : 'movie'}/${item.item_id}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                    <span>•</span>
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                  {progress && progress > 0 && progress < 100 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeFromHistory(item.item_id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
