import { useEffect, useRef, useState } from 'react'
import { vidkingApi, PlayerEventData } from '../../api/vidking'
import { useTVDetection } from '../../hooks/useTVDetection'

interface VidkingPlayerProps {
  src: string
  onProgress?: (data: PlayerEventData) => void
  className?: string
}

export default function VidkingPlayer({ src, onProgress, className = '' }: VidkingPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const isTV = useTVDetection()

  const vendorAttrs: Partial<React.IframeHTMLAttributes<HTMLIFrameElement>> = {
    allowFullScreen: true,
  }

  useEffect(() => {
    if (!onProgress) return

    const cleanup = vidkingApi.setupProgressTracking((data) => {
      onProgress(data)
    })

    return () => cleanup()
  }, [onProgress])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    setIframeLoaded(false)
    setIframeError(false)

    const delay = isTV ? 200 : 100
    const timer = window.setTimeout(() => {
      iframe.src = src
    }, delay)

    return () => {
      window.clearTimeout(timer)
      iframe.src = ''
    }
  }, [src, isTV])


  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])



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
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          title="Video Player"
          name="vidking-player"
          loading="eager"
          {...(vendorAttrs)}
          onError={() => {
            if (import.meta.env.DEV) {
              console.error('[Vidking Player] Iframe failed to load:', src)
            }
            setIframeError(true)
          }}
          onLoad={() => {
            if (import.meta.env.DEV) {
              console.log('[Vidking Player] Iframe loaded successfully:', src)
            }
            setIframeLoaded(true)
          }}
        />
      </div>
    </div>
  )
}
