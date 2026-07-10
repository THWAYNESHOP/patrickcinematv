import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { STREAMING_PROVIDERS } from '../../lib/streamingProviders'
import { useTVDetection } from '../../hooks/useTVDetection'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { getPlayerRetryDecision } from './playerRetry'

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
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement)
  const [isStretched, setIsStretched] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const isTV = useTVDetection()
  const { isOnline } = useNetworkStatus()

  const provider = STREAMING_PROVIDERS[providerId]

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (isFullscreen) {
      setIsStretched(false)
    }
  }, [isFullscreen])

  // Handle postMessage events from all providers for progress tracking
  useEffect(() => {
    const allowedOrigins = Object.values(STREAMING_PROVIDERS)
      .map((p) => p.origin)
      .filter(Boolean)

    const handleMessage = (event: MessageEvent) => {
      // Verify origin if provider has one defined
      if (provider?.origin && event.origin !== provider.origin) {
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
        // Minimal runtime handling for player events; skip logging in production.
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

  useEffect(() => {
    if (!iframeLoaded && !iframeError) {
      const timeoutDuration = isTV ? 30000 : 15000
      const timeout = window.setTimeout(() => {
        setLoadTimeout(true)
        onError?.()
      }, timeoutDuration)

      return () => window.clearTimeout(timeout)
    }

    return undefined
  }, [iframeLoaded, iframeError, onError, providerId, isTV])

  useEffect(() => {
    if (isOnline && iframeError && !isRetrying) {
      const decision = getPlayerRetryDecision(retryAttempt, isOnline)
      if (!decision.canRetry) {
        return
      }

      setIsRetrying(true)
      const timeout = window.setTimeout(() => {
        setRetryAttempt((prev) => prev + 1)
        setIframeError(false)
        setLoadTimeout(false)
        setIframeLoaded(false)
        setIsRetrying(false)
      }, decision.delayMs)

      return () => window.clearTimeout(timeout)
    }
  }, [iframeError, isOnline, isRetrying, retryAttempt])

  useEffect(() => {
    setIframeError(false)
    setLoadTimeout(false)
    setIframeLoaded(false)
    setRetryAttempt(0)
    setIsRetrying(false)
  }, [src, providerId])

  const vidLinkUrl = src

  const vendorAttrs: Partial<React.IframeHTMLAttributes<HTMLIFrameElement>> = {
    // Cross-browser fullscreen attribute (React uses allowFullScreen)
    allowFullScreen: true,
  }

  return (
    <div
      ref={containerRef}
      className={`relative isolate overflow-hidden bg-black ${
        isFullscreen
          ? 'fixed inset-0 z-[60] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
          : 'w-full aspect-video max-w-none'
      }`}
      style={{
        width: isFullscreen ? '100vw' : undefined,
        height: isFullscreen ? '100dvh' : undefined,
        paddingTop: isFullscreen ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: isFullscreen ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStretched((prev) => !prev)}
            aria-label={isStretched ? 'Fit video' : 'Stretch video'}
            aria-pressed={isStretched}
            title={isStretched ? 'Fit video' : 'Stretch video'}
            disabled={isFullscreen}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/70 p-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStretched ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-400">{isRetrying ? 'Retrying player...' : 'Loading player...'}</p>
            </div>
          </div>
        )}
        {(iframeError || loadTimeout) && !isRetrying && (
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
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundColor: '#000',
            visibility: 'visible',
            display: 'block',
            zIndex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: isFullscreen || !isStretched ? 'scale(1)' : 'scale(1.2)',
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease',
          }}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${provider?.displayName || 'Streaming'} Player`}
          name="streaming-player"
          loading="eager"
          {...(vendorAttrs)}
          onError={() => {
            if (import.meta.env.DEV) {
              console.error(`[${providerId}] Iframe failed to load:`, vidLinkUrl)
            }
            setIframeError(true)
          }}
          onLoad={() => {
            if (import.meta.env.DEV) {
              console.log(`[${providerId}] Iframe loaded successfully:`, vidLinkUrl)
            }
            setIframeLoaded(true)
          }}
        />
      </div>
    </div>
  )
}
