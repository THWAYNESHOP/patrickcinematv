import { useEffect, useRef } from 'react'
import { vidkingApi, PlayerEventData } from '../../api/vidking'

interface VidkingPlayerProps {
  src: string
  onProgress?: (data: PlayerEventData) => void
  className?: string
}

export default function VidkingPlayer({ src, onProgress, className = '' }: VidkingPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!onProgress) return

    const cleanup = vidkingApi.setupProgressTracking((data) => {
      onProgress(data)
    })

    return cleanup
  }, [onProgress])

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className={`w-full aspect-video ${className}`}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; encrypted-media"
    />
  )
}
