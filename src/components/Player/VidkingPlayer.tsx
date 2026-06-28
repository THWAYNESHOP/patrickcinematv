import { useEffect, useRef, useState } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Keyboard shortcuts for player
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          // Toggle play/pause (placeholder)
          console.log('Toggle play/pause')
          break
        case 'ArrowLeft':
          e.preventDefault()
          // Seek backward 10 seconds
          console.log('Seek backward')
          break
        case 'ArrowRight':
          e.preventDefault()
          // Seek forward 10 seconds
          console.log('Seek forward')
          break
        case 'ArrowUp':
          e.preventDefault()
          // Volume up
          console.log('Volume up')
          break
        case 'ArrowDown':
          e.preventDefault()
          // Volume down
          console.log('Volume down')
          break
        case 'm':
          e.preventDefault()
          // Toggle mute (placeholder)
          console.log('Toggle mute')
          break
        case 'f':
          e.preventDefault()
          // Toggle fullscreen
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    console.log('[Vidking Player] Mounting with src:', src)
    console.log('[Vidking Player] Current URL being loaded:', src)
    console.log('[Vidking Player] Iframe ref:', iframeRef.current)
    console.log('[Vidking Player] Window location:', window.location.href)

    if (!onProgress) return

    const cleanup = vidkingApi.setupProgressTracking((data) => {
      onProgress(data)
    })

    return () => {
      console.log('[Vidking Player] Unmounting, cleaning up event listeners')
      cleanup()
    }
  }, [onProgress, src])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    console.log('[Vidking Player] Setting iframe src:', src)
    console.log('[Vidking Player] Iframe element:', iframe)
    console.log('[Vidking Player] Current iframe src before setting:', iframe.src)
    setIframeLoaded(false)
    setIframeError(false)

    // Force iframe reload with a small delay
    setTimeout(() => {
      iframe.src = src
      console.log('[Vidking Player] Iframe src set to:', iframe.src)
    }, 100)

    return () => {
      console.log('[Vidking Player] Cleaning up iframe, clearing src')
      iframe.src = ''
    }
  }, [src])


  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])


  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
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
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-400">Loading player...</p>
            </div>
          </div>
        )}
        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center p-6">
              <p className="text-red-500 font-semibold mb-2">Player failed to load</p>
              <p className="text-gray-400 text-sm mb-4">The video source may be unavailable</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          className="w-full h-full"
          style={{
            objectFit: 'contain',
            backgroundColor: '#000',
            visibility: 'visible',
            display: 'block',
            zIndex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          name="vidking-player"
          loading="eager"
          {...({ webkitallowfullscreen: 'true', mozallowfullscreen: 'true', msallowfullscreen: 'true' } as any)}
          onError={() => {
            console.error('[Vidking Player] Iframe failed to load:', src)
            setIframeError(true)
          }}
          onLoad={() => {
            console.log('[Vidking Player] Iframe loaded successfully:', src)
            setIframeLoaded(true)
          }}
        />
      </div>
    </div>
  )
}
