import { useState } from 'react'
import { Trash2, GripVertical, Star, Play } from 'lucide-react'
import { useQueue } from '../store/queueStore'
import { useNavigate } from 'react-router-dom'

export default function QueueManager() {
  const navigate = useNavigate()
  const { items, removeFromQueue, updatePriority, clearQueue, markWatching } = useQueue()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'priority' | 'added'>('priority')

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return b.addedAt - a.addedAt
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Star className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Queue is empty</h3>
        <p className="text-gray-400">Add content to your queue to organize your watch list</p>
      </div>
    )
  }

  const priorityCounts = {
    high: items.filter((i) => i.priority === 'high').length,
    normal: items.filter((i) => i.priority === 'normal').length,
    low: items.filter((i) => i.priority === 'low').length,
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{items.length} Items in Queue</h2>
          <p className="text-sm text-gray-400 mt-1">
            High: {priorityCounts.high} • Normal: {priorityCounts.normal} • Low: {priorityCounts.low}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'added')}
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-primary"
          >
            <option value="priority">By Priority</option>
            <option value="added">Recently Added</option>
          </select>
          <button
            onClick={() => clearQueue()}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium text-sm"
          >
            Clear Queue
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item) => (
          <div
            key={`${item.id}-${item.type}`}
            draggable
            onDragStart={() => setDraggedId(`${item.id}-${item.type}`)}
            onDragEnd={() => setDraggedId(null)}
            className={`flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all ${
              draggedId === `${item.id}-${item.type}` ? 'opacity-50' : ''
            }`}
          >
            <GripVertical className="w-5 h-5 text-gray-500 cursor-move" />

            {item.poster && (
              <img
                src={item.poster}
                alt={item.title}
                className="w-12 h-16 object-cover rounded"
              />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                  {item.type}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.priority === 'high'
                      ? 'bg-red-500/20 text-red-300'
                      : item.priority === 'normal'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={item.priority}
                onChange={(e) =>
                  updatePriority(item.id, item.type, e.target.value as any)
                }
                className="px-2 py-1 text-xs rounded bg-white/10 text-white border border-white/20 focus:outline-none focus:border-primary"
              >
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={() => {
                  markWatching(item.id, item.type)
                  // Navigate to the appropriate player/details page
                  if (item.type === 'movie') {
                    navigate(`/movie/${item.id}`)
                  } else if (item.type === 'tv') {
                    navigate(`/tv/${item.id}`)
                  } else if (item.type === 'anime') {
                    navigate(`/anime/${item.id}`)
                  } else if (item.type === 'sports') {
                    navigate(`/sports/${item.id}`)
                  }
                }}
                className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                title="Play"
              >
                <Play className="w-4 h-4 fill-primary" />
              </button>

              <button
                onClick={() => removeFromQueue(item.id, item.type)}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                title="Remove from queue"
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
