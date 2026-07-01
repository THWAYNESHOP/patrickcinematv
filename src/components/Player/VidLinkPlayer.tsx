import { useEffect, useRef, useState } from 'react'
import { useTVDetection } from '../../hooks/useTVDetection'

interface VidLinkPlayerProps {
  tmdbId: string | number
  type: 'movie' | 'tv'
  season?: number
  episode?: number
  onProgress?: (data: { progress: number; currentTime: number; duration: number }) => void
  onError?: () => void
  className?: string
  primaryColor?: string
  secondaryColor?: string
  iconColor?: string
  autoplay?: boolean
  startAt?: number
}

export default function VidLinkPlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
  onProgress,
  onError,
  className = '',
  primaryColor = 'e50914',
  secondaryColor = '170000',
  iconColor = 'ffffff',
  autoplay = true,
  startAt = 0,
}: VidLinkPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const isTV = useTVDetection()

  // Build VidLink URL
  const buildVidLinkUrl = () => {
    const baseUrl = type === 'movie'
      ? `https://vidlink.pro/movie/${tmdbId}`
      : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
    
    const params = new URLSearchParams({
      primaryColor,
      secondaryColor,
      iconColor,
      icons: 'default',
      player: 'default',
      title: 'true',
      poster: 'true',
      autoplay: autoplay ? 'true' : 'false',
      nextbutton: 'false',
    })
    
    if (startAt > 0) {
      params.append('startAt', startAt.toString())
    }
    
    return `${baseUrl}?${params.toString()}`
  }

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle VidLink postMessage events for progress tracking and error detection
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== 'https://vidlink.pro') return

      // Handle MEDIA_DATA events (progress tracking)
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data
        if (mediaData?.progress) {
          const progressPercent = (mediaData.progress.watched / mediaData.progress.duration) * 100
          onProgress?.({
            progress: progressPercent,
            currentTime: mediaData.progress.watched,
            duration: mediaData.progress.duration,
          })
        }
      }

      // Handle PLAYER_EVENT events
      if (event.data?.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration } = event.data.data
        if (import.meta.env.DEV) {
          console.log(`[VidLink] Player ${eventType} at ${currentTime}s of ${duration}s`)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onProgress])

  // Set timeout to detect if content is unavailable
  useEffect(() => {
    // TV browsers may be slower, so increase timeout
    const timeoutDuration = isTV ? 30000 : 15000
    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        if (import.meta.env.DEV) {
          console.warn('[VidLink] Content may be unavailable - timeout reached')
        }
        setLoadTimeout(true)
        onError?.()
      }
    }, timeoutDuration)

    return () => clearTimeout(timeout)
  }, [iframeLoaded, onError, isTV])

  const vidLinkUrl = buildVidLinkUrl()

  const vendorAttrs: Partial<React.IframeHTMLAttributes<HTMLIFrameElement>> = {
    allowFullScreen: true,
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
        {(iframeError || loadTimeout) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-500 font-semibold mb-2">Content Not Available</p>
              <p className="text-gray-400 text-sm mb-4">
                {loadTimeout 
                  ? "This content couldn't be loaded. It may not be available on VidLink yet."
                  : "The video source is currently unavailable."}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Try: Different episode, add to My List for later, or check back soon.
              </p>
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
          src={vidLinkUrl}
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
          title="VidLink Player"
          name="vidlink-player"
          loading="eager"
          {...(vendorAttrs)}
          onError={() => {
            if (import.meta.env.DEV) {
              console.error('[VidLink] Iframe failed to load:', vidLinkUrl)
            }
            setIframeError(true)
          }}
          onLoad={() => {
            if (import.meta.env.DEV) {
              console.log('[VidLink] Iframe loaded successfully:', vidLinkUrl)
            }
            setIframeLoaded(true)
          }}
        />
      </div>
    </div>
  )
}
