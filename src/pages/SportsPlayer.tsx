import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Maximize2, Radio, RotateCw } from 'lucide-react'
import { sportsApi, Stream } from '../api/sports'
import { useScreenMode } from '../hooks/useScreenMode'
import ScreenModeButton from '../components/Player/ScreenModeButton'

export default function SportsPlayer() {
  console.log('[SportsPlayer] Mounting')
  const { source, id, matchId } = useParams()
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [rotation, setRotation] = useState(0)
  const { mode, label, cycleMode, showToast } = useScreenMode()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    async function fetchStreams() {
      // Handle both route patterns: /sports/:source/:id and /sports/:matchId
      const streamSource = source || 'alpha' // default source if not provided
      const streamId = id || matchId

      if (!streamId) {
        setStreams([])
        setLoading(false)
        return
      }

      try {
        const data = await sportsApi.getStreams(streamSource, streamId)
        setStreams(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching streams:', error)
        setLoading(false)
      }
    }

    fetchStreams()
  }, [source, id, matchId])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

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

  const toggleFullscreen = async () => {
    const container = playerContainerRef.current
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

  const toggleRotation = () => {
    setRotation((prev) => (prev + 90) % 360)
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepBlack">
        <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepBlack">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No streams available</p>
        </div>
      </div>
    )
  }

  const currentStream = streams[selectedStream]

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-deepBlack`}>
      <div className={isFullscreen ? 'w-full h-full' : `min-h-screen py-6 sm:py-8 ${mode === 'fill' ? 'px-0' : 'px-3 sm:px-4 md:px-8'}`}>
        <div className={isFullscreen ? 'w-full h-full flex flex-col' : `container mx-auto ${mode === 'fill' ? 'max-w-none' : 'max-w-7xl'}`}>
          {/* Header - Hidden in fullscreen */}
          {!isFullscreen && mode !== 'fill' && (
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Live Match</h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                Stream {selectedStream + 1} of {streams.length}
              </p>
            </div>
          )}

          {/* Player Container */}
          <div
            ref={playerContainerRef}
            className={`overflow-hidden transition-all duration-200 ${
              isFullscreen ? 'mb-0 w-full h-full' : mode === 'fill' ? 'mb-0 w-full' : 'glass-strong rounded-lg mb-6'
            }`}
          >
            {/* Player Wrapper */}
            <div
              className={`relative bg-black ${
                isFullscreen
                  ? 'w-full h-full'
                  : mode === 'fill'
                  ? 'w-full h-full'
                  : 'aspect-video'
              }`}
              style={{
                width: isFullscreen ? '100vw' : mode === 'fill' ? '100%' : undefined,
                height: isFullscreen ? '100dvh' : mode === 'fill' ? '100%' : undefined,
                maxWidth: mode === 'fill' ? 'none' : undefined,
                maxHeight: mode === 'fill' ? 'none' : undefined,
              }}
            >
              {/* LIVE Indicator */}
              <div className="absolute top-3 left-3 z-50 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
                <div className="w-2 h-2 bg-red-50 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">LIVE NOW</span>
              </div>

              {/* Player Controls - Always show on mobile, otherwise in landscape */}
              {(isMobile || isLandscape) && (
                <div className="absolute bottom-3 right-3 z-50 flex gap-2 pointer-events-auto">
                  {/* Screen Mode Toggle */}
                  <ScreenModeButton label={label} onClick={cycleMode} showToast={showToast} />

                  {/* Rotate Toggle */}
                  <button
                    onClick={toggleRotation}
                    title="Rotate Video"
                    className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95 pointer-events-auto"
                    aria-label="Rotate video"
                  >
                    <RotateCw className="w-5 h-5" style={{ transform: `rotate(${rotation}deg)` }} />
                  </button>

                  {/* Fullscreen Toggle */}
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

              {/* Stream iframe container with dynamic object-fit and rotation */}
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: mode === 'fill' ? '0' : undefined,
                  margin: mode === 'fill' ? '0' : undefined,
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={currentStream.embedUrl}
                  className={`w-full h-full ${mode === 'contain' ? 'object-contain' : mode === 'cover' ? 'object-cover' : 'object-fill'}`}
                  style={{
                    transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
                    transition: 'transform 0.3s ease',
                  }}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                />
              </div>
            </div>
          </div>

          {/* Stream Selector - Hidden in fullscreen */}
          {!isFullscreen && streams.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Select Stream</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {streams.map((stream, index) => (
                  <button
                    key={`${stream.id}-${stream.streamNo}-${index}`}
                    onClick={() => setSelectedStream(index)}
                    className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 ${
                      selectedStream === index
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'glass hover:bg-white/15 text-gray-300'
                    }`}
                  >
                    <Radio className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {stream.language || `Stream ${stream.streamNo}`}
                      {stream.hd && ' HD'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stream Info - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Stream Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Stream Number</p>
                  <p className="font-semibold text-white">{currentStream.streamNo}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Language</p>
                  <p className="font-semibold text-white">{currentStream.language || 'Default'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Quality</p>
                  <p className="font-semibold text-white">{currentStream.hd ? 'HD' : 'SD'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Source</p>
                  <p className="font-semibold text-white">{currentStream.source}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
