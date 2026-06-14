import { useState } from 'react'
import { X, Maximize2, Play, Pause } from 'lucide-react'

interface MiniPlayerProps {
  src: string
  title: string
  onClose: () => void
  onExpand: () => void
}

export default function MiniPlayer({ src, title, onClose, onExpand }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-80 bg-darkSurface/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <iframe
          src={src}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={onExpand}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
              aria-label="Expand player"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
              aria-label="Close mini player"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-2 left-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Title Bar */}
      <div className="p-3 border-t border-white/10">
        <p className="text-sm text-white font-medium truncate">{title}</p>
        <p className="text-xs text-gray-400">Now Playing</p>
      </div>
    </div>
  )
}
