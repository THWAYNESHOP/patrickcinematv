import { useEffect, useRef, useState } from 'react'
import { RotateCw, Maximize2 } from 'lucide-react'
import { vidkingApi, PlayerEventData } from '../../api/vidking'

interface VidkingPlayerProps {
  src: string
  onProgress?: (data: PlayerEventData) => void
  className?: string
}

export default function VidkingPlayer({ src, onProgress, className = '' }: VidkingPlayerProps) {
  console.log('[VidkingPlayer] Mounting with src:', src)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotation, setRotation] = useState(0)

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

  // Handle orientation changes and mobile detection
  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsLandscape(width > height)
      setIsMobile(width <= 768) // Mobile breakpoint
    }

    // Initial check
    checkOrientation()

    // Listen for resize and orientation change events
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleRotation = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        // Lock to landscape on mobile if supported
        const orientation = (screen as any).orientation
        if (orientation && orientation.lock) {
          try {
            await orientation.lock('landscape')
          } catch (e) {
            console.warn('Screen orientation lock not supported or denied:', e)
          }
        }

        // Request fullscreen with cross-browser support for Android Chrome
        if (container.requestFullscreen) {
          await container.requestFullscreen()
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen()
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen()
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen()
        }
      } else {
        // Unlock orientation
        const orientation = (screen as any).orientation
        if (orientation && orientation.unlock) {
          orientation.unlock()
        }

        // Exit fullscreen with cross-browser support
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50'
          : 'w-full aspect-video'
      }`}
      style={{
        width: isFullscreen ? '100vw' : undefined,
        height: isFullscreen ? '100dvh' : undefined,
      }}
    >
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          className="w-full h-full"
          style={{
            objectFit: 'contain',
            transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
            transition: 'transform 0.3s ease',
          }}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          {...({ webkitallowfullscreen: 'true', mozallowfullscreen: 'true', msallowfullscreen: 'true' } as any)}
          onError={() => console.error('[VidFast Player] Iframe failed to load:', src)}
        />
      </div>
      {/* Controls - Always show on mobile, otherwise in landscape */}
      {(isMobile || isLandscape) && (
        <div className="absolute bottom-3 right-3 z-50 flex gap-2 pointer-events-auto">
          <button
            onClick={toggleRotation}
            className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95 pointer-events-auto"
            aria-label="Rotate video"
          >
            <RotateCw className="w-5 h-5" style={{ transform: `rotate(${rotation}deg)` }} />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95 pointer-events-auto"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
