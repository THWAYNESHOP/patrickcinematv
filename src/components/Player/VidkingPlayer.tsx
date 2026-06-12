import { useEffect, useRef } from 'react'
import { vidkingApi, PlayerEventData } from '../../api/vidking'
import { useScreenMode } from '../../hooks/useScreenMode'
import ScreenModeButton from './ScreenModeButton'

interface VidkingPlayerProps {
  src: string
  onProgress?: (data: PlayerEventData) => void
  className?: string
}

export default function VidkingPlayer({ src, onProgress, className = '' }: VidkingPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { mode, label, cycleMode, showToast } = useScreenMode()

  useEffect(() => {
    console.log('[VidFast Player] Mounting with src:', src)

    if (!onProgress) return

    const cleanup = vidkingApi.setupProgressTracking((data) => {
      onProgress(data)
    })

    return () => {
      console.log('[VidFast Player] Unmounting, cleaning up event listeners')
      cleanup()
    }
  }, [onProgress, src])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    console.log('[VidFast Player] Setting iframe src:', src)

    return () => {
      console.log('[VidFast Player] Cleaning up iframe, clearing src')
      iframe.src = ''
    }
  }, [src])

  return (
    <div className="relative">
      <iframe
        ref={iframeRef}
        src={src}
        className={`w-full aspect-video ${className}`}
        style={{ objectFit: mode }}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        {...({ webkitallowfullscreen: 'true', mozallowfullscreen: 'true', msallowfullscreen: 'true' } as any)}
        onError={() => console.error('[VidFast Player] Iframe failed to load:', src)}
      />
      <div className="absolute bottom-3 right-3 z-20">
        <ScreenModeButton label={label} onClick={cycleMode} showToast={showToast} />
      </div>
    </div>
  )
}
