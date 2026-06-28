import { useEffect, useRef, useState } from 'react'
import { STREAMING_PROVIDERS } from '../../lib/streamingProviders'

interface StreamingPlayerProps {
  src: string
  providerId: string
  onProgress?: (data: { progress: number; currentTime: number; duration: number }) => void
  onError?: () => void
  className?: string
}

export default function StreamingPlayer({
  src,
  providerId,
  onProgress,
  onError,
  className = '',
}: StreamingPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)

  const provider = STREAMING_PROVIDERS[providerId]

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle postMessage events from all providers for progress tracking
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin if provider has one defined
      if (provider?.origin && event.origin !== provider.origin) {
        // Still allow messages from known providers
        const allowedOrigins = Object.values(STREAMING_PROVIDERS)
          .map(p => p.origin)
          .filter(Boolean)
        if (!allowedOrigins.includes(event.origin)) {
          return
        }
      }

      // Handle MEDIA_DATA events (VidLink style)
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

      // Handle PLAYER_EVENT events (VidLink style)
      if (event.data?.type === 'PLAYER_EVENT') {
        const { event: eventType, currentTime, duration } = event.data.data
        console.log(`[${providerId}] Player ${eventType} at ${currentTime}s of ${duration}s`)
      }

      // Handle VidKing style progress events
      if (event.data?.type === 'progress') {
        const { currentTime, duration } = event.data
        if (duration > 0) {
          const progressPercent = (currentTime / duration) * 100
          onProgress?.({
            progress: progressPercent,
            currentTime,
            duration,
          })
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [providerId, provider, onProgress])

  // Set timeout to detect if content is unavailable
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!iframeLoaded) {
        console.warn(`[${providerId}] Content may be unavailable - timeout reached`)
        setLoadTimeout(true)
        onError?.()
      }
    }, 15000) // 15 second timeout

    return () => clearTimeout(timeout)
  }, [iframeLoaded, onError, providerId])

  const vidLinkUrl = src

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
                  ? `This content could not be loaded from ${provider?.displayName || 'this server'}.`
                  : "The video source is currently unavailable."}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Try switching to a different server.
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
          title={`${provider?.displayName || 'Streaming'} Player`}
          name="streaming-player"
          loading="eager"
          {...({ webkitallowfullscreen: 'true', mozallowfullscreen: 'true', msallowfullscreen: 'true' } as any)}
          onError={() => {
            console.error(`[${providerId}] Iframe failed to load:`, vidLinkUrl)
            setIframeError(true)
          }}
          onLoad={() => {
            console.log(`[${providerId}] Iframe loaded successfully:`, vidLinkUrl)
            setIframeLoaded(true)
          }}
        />
      </div>
    </div>
  )
}
