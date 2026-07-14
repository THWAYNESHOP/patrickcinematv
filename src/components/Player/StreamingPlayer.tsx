import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { STREAMING_PROVIDERS } from '../../lib/streamingProviders'
import { useTVDetection } from '../../hooks/useTVDetection'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { getPlayerRetryDecision } from './playerRetry'
import PlayerControls from './PlayerControls'

const MAX_PLAYBACK_DURATION = 24 * 60 * 60 // 24 hours in seconds

function isValidPlaybackTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_PLAYBACK_DURATION
}

function clampPlaybackTime(value: number, upperBound = MAX_PLAYBACK_DURATION) {
  return Math.min(Math.max(0, value), upperBound)
}

interface StreamingPlayerProps {
  src: string
  providerId: string
  onProgress?: (data: { progress: number; currentTime: number; duration: number }) => void
  onError?: () => void
  onProviderSwitch?: (currentProvider: string) => void
  className?: string
}

export default function StreamingPlayer({
  src,
  providerId,
  onProgress,
  onError,
  onProviderSwitch,
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

  // Custom player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [quality, setQuality] = useState('Auto')
  const [showCustomControls] = useState(true)
  const [autoSwitchAttempt, setAutoSwitchAttempt] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')
  
  // Touch gesture state
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const initialPinchDistanceRef = useRef<number | null>(null)
  
  // Analytics tracking
  const watchStartTimeRef = useRef<number | null>(null)
  const totalWatchTimeRef = useRef(0)
  const lastAnalyticsSendRef = useRef(Date.now())

  // Buffer detection ref
  const lastTimeUpdateRef = useRef(Date.now())
  const lastProgressUpdateRef = useRef<{ wallTime: number; currentTime: number } | null>(null)
  const MAX_PLAYBACK_RATE = 4

  const provider = STREAMING_PROVIDERS[providerId]
  const providerOrder = Object.keys(STREAMING_PROVIDERS)

  // Custom control handlers (defined before useEffect that uses them)
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLAYER_COMMAND', command: isPlaying ? 'pause' : 'play' },
      '*'
    )
  }, [isPlaying])

  const handleMute = useCallback(() => {
    setIsMuted(!isMuted)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLAYER_COMMAND', command: isMuted ? 'unmute' : 'mute' },
      '*'
    )
  }, [isMuted])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLAYER_COMMAND', command: 'seek', time },
      '*'
    )
  }, [])

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLAYER_COMMAND', command: 'volume', volume: newVolume },
      '*'
    )
  }, [])

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLAYER_COMMAND', command: 'speed', speed },
      '*'
    )
  }, [])

  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'PLAYER_COMMAND', command: 'quality', quality: newQuality },
      '*'
    )
  }, [])

  // Network quality monitoring
  useEffect(() => {
    if (!isOnline) {
      setNetworkQuality('poor')
      return
    }

    // Simple network quality estimation based on connection
    type NavigatorConnection = {
      effectiveType?: string
      downlink?: number
      addEventListener?: (event: string, cb: EventListenerOrEventListenerObject) => void
      removeEventListener?: (event: string, cb: EventListenerOrEventListenerObject) => void
    }

    const connection = (navigator as unknown as Navigator & { connection?: NavigatorConnection }).connection
    if (connection) {
      const updateNetworkQuality = () => {
        const effectiveType = connection.effectiveType
        const downlink = typeof connection.downlink === 'number' ? connection.downlink : 0

        if (downlink >= 10 || effectiveType === '4g') {
          setNetworkQuality('excellent')
        } else if (downlink >= 5 || effectiveType === '3g') {
          setNetworkQuality('good')
        } else if (downlink >= 2) {
          setNetworkQuality('fair')
        } else {
          setNetworkQuality('poor')
        }
      }

      updateNetworkQuality()
      const handleConnectionChange = () => {
        updateNetworkQuality()
      }

      if (connection.addEventListener) {
        connection.addEventListener('change', handleConnectionChange)
      }
      return () => {
        if (connection.removeEventListener) {
          connection.removeEventListener('change', handleConnectionChange)
        }
      }
    }
  }, [isOnline])

  // Buffer detection
  useEffect(() => {
    if (!isPlaying) {
      setIsBuffering(false)
      return
    }

    const checkBuffer = () => {
      const timeSinceUpdate = Date.now() - lastTimeUpdateRef.current
      setIsBuffering(timeSinceUpdate > 2000)
    }

    const interval = setInterval(checkBuffer, 500)

    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) {
      lastTimeUpdateRef.current = Date.now()
    }
  }, [currentTime, isPlaying])

  // Watch time analytics tracking
  useEffect(() => {
    if (isPlaying && !watchStartTimeRef.current) {
      watchStartTimeRef.current = Date.now()
    } else if (!isPlaying && watchStartTimeRef.current) {
      // Paused - add elapsed time to total
      const elapsed = Date.now() - watchStartTimeRef.current
      totalWatchTimeRef.current += elapsed
      watchStartTimeRef.current = null
    }
  }, [isPlaying])

  // Send analytics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastSend = now - lastAnalyticsSendRef.current
      
      if (timeSinceLastSend >= 60000) { // Send every minute
        const currentSessionTime = watchStartTimeRef.current 
          ? now - watchStartTimeRef.current 
          : 0
        const totalWatchTime = totalWatchTimeRef.current + currentSessionTime
        
        // In a real implementation, you would send this to your analytics service
        const analyticsData = {
          providerId,
          watchDuration: Math.floor(totalWatchTime / 1000), // seconds
          currentTime,
          videoDuration: duration,
          quality,
          networkQuality,
          isBuffering
        }
        
        if (import.meta.env.DEV) {
          console.log('Analytics:', analyticsData)
        }
        
        lastAnalyticsSendRef.current = now
      }
    }, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [providerId, currentTime, duration, quality, networkQuality, isBuffering])

  // Send final analytics on unmount
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      const currentSessionTime = watchStartTimeRef.current 
        ? now - watchStartTimeRef.current 
        : 0
      const totalWatchTime = totalWatchTimeRef.current + currentSessionTime
      
      if (import.meta.env.DEV && totalWatchTime > 0) {
        const finalAnalytics = {
          providerId,
          totalWatchTime: Math.floor(totalWatchTime / 1000),
          quality,
          networkQuality
        }
        console.log('Final Analytics:', finalAnalytics)
      }
    }
    
    return cleanup
  }, [providerId, quality, networkQuality])

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

    const applyPlaybackUpdate = (
      newCurrentTime: number,
      newDuration: number,
      progressCallback?: (progress: number, currentTime: number, duration: number) => void,
      allowBackward = false
    ) => {
      const wallTime = Date.now()
      const last = lastProgressUpdateRef.current
      const safeDuration = clampPlaybackTime(newDuration, MAX_PLAYBACK_DURATION)
      const safeCurrentTime = clampPlaybackTime(newCurrentTime, safeDuration)

      if (last) {
        const wallDeltaSeconds = Math.max((wallTime - last.wallTime) / 1000, 0.05)
        const timeDelta = safeCurrentTime - last.currentTime
        const playbackRate = timeDelta / wallDeltaSeconds

        if (!allowBackward && timeDelta < -5) {
          return false
        }

        if (playbackRate > MAX_PLAYBACK_RATE && timeDelta > 5) {
          return false
        }
      }

      lastProgressUpdateRef.current = { wallTime, currentTime: safeCurrentTime }
      lastTimeUpdateRef.current = wallTime
      setCurrentTime(safeCurrentTime)
      setDuration(safeDuration)

      if (typeof progressCallback === 'function' && safeDuration > 0) {
        const progressPercent = clampPlaybackTime((safeCurrentTime / safeDuration) * 100, 100)
        progressCallback(progressPercent, safeCurrentTime, safeDuration)
      }

      return true
    }

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
        const watched = mediaData?.progress?.watched
        const duration = mediaData?.progress?.duration

        if (isValidPlaybackTime(watched) && isValidPlaybackTime(duration) && duration > 0) {
          applyPlaybackUpdate(watched, duration, (progressPercent, currentTime, duration) => {
            onProgress?.({ progress: progressPercent, currentTime, duration })
          })
        }
      }

      // Handle PLAYER_EVENT events (VidLink style)
      if (event.data?.type === 'PLAYER_EVENT') {
        const eventData = event.data.data
        if (eventData?.event === 'play') setIsPlaying(true)
        if (eventData?.event === 'pause') setIsPlaying(false)

        const reportedTime = eventData?.currentTime
        const reportedDuration = eventData?.duration
        const hasValidDuration = isValidPlaybackTime(reportedDuration)
        const hasValidTime = isValidPlaybackTime(reportedTime)

        if (hasValidDuration) {
          setDuration(clampPlaybackTime(reportedDuration, MAX_PLAYBACK_DURATION))
        }

        if (hasValidTime) {
          applyPlaybackUpdate(
            reportedTime,
            hasValidDuration ? reportedDuration : MAX_PLAYBACK_DURATION,
            (progressPercent, currentTime, duration) => {
              onProgress?.({ progress: progressPercent, currentTime, duration })
            },
            eventData?.event === 'seeked'
          )
        }
      }

      // Handle VidKing style progress events
      if (event.data?.type === 'progress') {
        const { currentTime: reportedTime, duration } = event.data
        if (isValidPlaybackTime(reportedTime) && isValidPlaybackTime(duration) && duration > 0) {
          applyPlaybackUpdate(reportedTime, duration, (progressPercent, currentTime, duration) => {
            onProgress?.({ progress: progressPercent, currentTime, duration })
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
        // Auto-switch to next provider if retry attempts exhausted
        if (autoSwitchAttempt < providerOrder.length - 1) {
          const currentProviderIndex = providerOrder.indexOf(providerId)
          const nextProviderIndex = (currentProviderIndex + 1) % providerOrder.length
          const nextProvider = providerOrder[nextProviderIndex]
          
          setAutoSwitchAttempt((prev) => prev + 1)
          onProviderSwitch?.(nextProvider)
          
          // Reset error state for new provider
          setIframeError(false)
          setLoadTimeout(false)
          setIframeLoaded(false)
          setRetryAttempt(0)
        }
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
  }, [iframeError, isOnline, isRetrying, retryAttempt, providerId, providerOrder, autoSwitchAttempt, onProviderSwitch])

  useEffect(() => {
    setIframeError(false)
    setLoadTimeout(false)
    setIframeLoaded(false)
    setRetryAttempt(0)
    setIsRetrying(false)
  }, [src, providerId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      // Only handle shortcuts when player is focused or in fullscreen
      if (!isFullscreen && document.activeElement !== containerRef.current) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          handlePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSeek(Math.max(0, currentTime - 10))
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSeek(Math.min(duration, currentTime + 10))
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange(Math.max(0, volume - 0.1))
          break
        case 'm':
          e.preventDefault()
          handleMute()
          break
        case 'f':
          e.preventDefault()
          setIsFullscreen(!isFullscreen)
          break
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          e.preventDefault()
          const percent = parseInt(e.key) * 10
          handleSeek((duration * percent) / 100)
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentTime, duration, volume, isPlaying, isMuted, isFullscreen, handlePlayPause, handleMute, handleSeek, handleVolumeChange])

  const vidLinkUrl = src

  const vendorAttrs: Partial<React.IframeHTMLAttributes<HTMLIFrameElement>> = {
    // Cross-browser fullscreen attribute (React uses allowFullScreen)
    allowFullScreen: true,
  }

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime
    
    if (timeSinceLastClick < 300) {
      // Double click detected
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const centerX = rect.width / 2
      
      if (clickX < centerX) {
        // Left side - seek backward 10 seconds
        handleSeek(Math.max(0, currentTime - 10))
      } else {
        // Right side - seek forward 10 seconds
        handleSeek(Math.min(duration, currentTime + 10))
      }
      setLastClickTime(0)
    } else {
      setLastClickTime(now)
    }
  }, [currentTime, duration, handleSeek, lastClickTime])

  // Touch gesture handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture start
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      initialPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent default to stop scrolling during gestures
    if (e.touches.length === 1 && touchStartRef.current) {
      const dx = e.touches[0].clientX - touchStartRef.current.x
      const dy = e.touches[0].clientY - touchStartRef.current.y
      
      // Horizontal swipe detection (seek)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        e.preventDefault()
      }
    } else if (e.touches.length === 2 && initialPinchDistanceRef.current) {
      // Pinch zoom detection
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const currentDistance = Math.sqrt(dx * dx + dy * dy)
      
      if (Math.abs(currentDistance - initialPinchDistanceRef.current) > 30) {
        e.preventDefault()
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0 && touchStartRef.current) {
      const touchEnd = e.changedTouches[0]
      const dx = touchEnd.clientX - touchStartRef.current.x
      const dy = touchEnd.clientY - touchStartRef.current.y
      const dt = Date.now() - touchStartRef.current.time
      
      // Swipe detection (horizontal swipe for seeking)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50 && dt < 300) {
        const seekAmount = Math.abs(dx) / 50 * 10 // Scale swipe distance to seek time
        if (dx > 0) {
          handleSeek(Math.min(duration, currentTime + seekAmount))
        } else {
          handleSeek(Math.max(0, currentTime - seekAmount))
        }
      }
      
      touchStartRef.current = null
    } else if (e.touches.length === 0) {
      initialPinchDistanceRef.current = null
    }
  }, [currentTime, duration, handleSeek])

  const handlePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (iframeRef.current) {
        // Note: PiP for iframes is limited, this is a placeholder
        // In practice, you'd need to request PiP on a video element inside the iframe
        console.warn('Picture-in-Picture for iframes requires video element access')
      }
    } catch (error) {
      console.error('PiP error:', error)
    }
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
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
          allow="autoplay; encrypted-media; picture-in-picture"
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
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-white text-sm font-medium">Buffering...</span>
            </div>
          </div>
        )}
        {/* Network Quality Indicator */}
        {networkQuality && !isFullscreen && (
          <div className="absolute top-3 left-3 z-20">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              networkQuality === 'excellent' ? 'bg-green-500/80 text-white' :
              networkQuality === 'good' ? 'bg-blue-500/80 text-white' :
              networkQuality === 'fair' ? 'bg-yellow-500/80 text-white' :
              'bg-red-500/80 text-white'
            }`}>
              {networkQuality === 'excellent' ? 'Excellent' :
               networkQuality === 'good' ? 'Good' :
               networkQuality === 'fair' ? 'Fair' : 'Poor'}
            </div>
          </div>
        )}
        {showCustomControls && (
          <PlayerControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            playbackSpeed={playbackSpeed}
            quality={quality}
            onPlayPause={handlePlayPause}
            onMute={handleMute}
            onFullscreen={() => setIsFullscreen(!isFullscreen)}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onPlaybackSpeedChange={handlePlaybackSpeedChange}
            onQualityChange={handleQualityChange}
            onPiP={handlePiP}
          />
        )}
      </div>
    </div>
  )
}
