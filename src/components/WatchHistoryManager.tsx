import { useState } from 'react'
import { Trash2, Calendar, Clock } from 'lucide-react'
import { useWatchHistory, WatchHistoryItem } from '../hooks/useWatchHistory'

export default function WatchHistoryManager() {
  const { watchHistory, removeFromWatchHistory, clearWatchHistory } = useWatchHistory()
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const sortedHistory = [...watchHistory].sort((a, b) => {
    if (sortBy === 'recent') {
      return (b.timestamp || 0) - (a.timestamp || 0)
    }
    return (a.title || '').localeCompare(b.title || '')
  })

  const handleClearAll = () => {
    clearWatchHistory()
    setShowClearConfirm(false)
  }

  if (watchHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No watch history</h3>
        <p className="text-gray-400">Your watch history will appear here as you watch content</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{watchHistory.length} Items</h2>
          <p className="text-sm text-gray-400 mt-1">Your watch history</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-primary"
          >
            <option value="recent">Most Recent</option>
            <option value="title">Title (A-Z)</option>
          </select>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10">
          <p className="text-white font-semibold mb-3">Clear all watch history?</p>
          <p className="text-gray-300 text-sm mb-4">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold text-sm"
            >
              Clear History
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedHistory.map((item: WatchHistoryItem) => (
          <div
            key={`${item.id}-${item.type}`}
            className="group relative overflow-hidden rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            {item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-48 object-cover group-hover:opacity-75 transition-opacity"
              />
            )}
            <div className="p-4">
              <h3 className="text-white font-semibold truncate">{item.title}</h3>
              {item.timestamp && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              )}
              <button
                onClick={() => removeFromWatchHistory(item.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove from history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
