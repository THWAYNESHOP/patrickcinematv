import { useEffect, useRef, useState } from 'react'
import { RotateCw, Maximize2, Settings, Volume2 } from 'lucide-react'
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
  const [showSettings, setShowSettings] = useState(false)
  const [quality, setQuality] = useState('auto')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [audioTrack, setAudioTrack] = useState('default')
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
        case 'r':
          e.preventDefault()
          // Toggle rotation
          toggleRotation()
          break
        case 's':
          e.preventDefault()
          // Toggle settings
          setShowSettings((prev: boolean) => !prev)
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
            transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
            transition: 'transform 0.3s ease',
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
      {/* Controls - Always show on mobile, otherwise in landscape */}
      {(isMobile || isLandscape) && (
        <>
          <div className="absolute bottom-3 right-3 z-50 flex gap-2 pointer-events-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95 pointer-events-auto"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
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

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute bottom-16 right-3 z-50 bg-darkSurface/95 backdrop-blur-xl rounded-xl border border-white/10 p-4 w-64 animate-fade-in">
              <h3 className="text-white font-semibold mb-3">Video Settings</h3>
              
              {/* Quality Selector */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Quality</label>
                <div className="grid grid-cols-2 gap-2">
                  {['auto', '1080p', '720p', '480p', '360p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        quality === q
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {q === 'auto' ? 'Auto' : q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Speed */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Playback Speed</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Track */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Audio Track</label>
                <div className="grid grid-cols-2 gap-2">
                  {['default', 'english', 'spanish', 'french'].map((track) => (
                    <button
                      key={track}
                      onClick={() => setAudioTrack(track)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        audioTrack === track
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      {track.charAt(0).toUpperCase() + track.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
