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
    console.log('[VidSrc Player] Mounting with src:', src)

    if (!onProgress) return

    const cleanup = vidkingApi.setupProgressTracking((data) => {
      onProgress(data)
    })

    return () => {
      console.log('[VidSrc Player] Unmounting, cleaning up event listeners')
      cleanup()
    }
  }, [onProgress, src])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    console.log('[VidSrc Player] Setting iframe src:', src)

    return () => {
      console.log('[VidSrc Player] Cleaning up iframe, clearing src')
      iframe.src = ''
    }
  }, [src])

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
