import { useState, useRef } from 'react'
import { Play } from 'lucide-react'

interface ContentPreviewProps {
  children: React.ReactNode
  previewUrl?: string
  onHover?: () => void
  onLeave?: () => void
}

export default function ContentPreview({ children, previewUrl, onHover, onLeave }: ContentPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.()
    
    // Delay preview to avoid accidental triggers
    timeoutRef.current = window.setTimeout(() => {
      if (previewUrl) {
        setShowPreview(true)
      }
    }, 500)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setShowPreview(false)
    onLeave?.()
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
  }

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Preview Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showPreview && previewUrl ? (
            <video
              src={previewUrl}
              className="w-full h-full object-cover rounded-lg"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
