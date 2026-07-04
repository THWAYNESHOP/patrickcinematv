import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Radio, ArrowLeft, Minimize2, Crop, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { sportsApi, Stream } from '../api/sports'
import { useToast } from '../hooks/useToast'

type FitMode = 'contain' | 'cover' | 'fill'

export default function SportsPlayer() {
  if (import.meta.env.DEV) {
    console.log('[SportsPlayer] Mounting')
  }
  const { source, id, matchId } = useParams()
  const location = useLocation()
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [directStream, setDirectStream] = useState<{ url: string; name: string } | null>(null)
  const [fitMode, setFitMode] = useState<FitMode>('contain')
  const [showStretchNotice, setShowStretchNotice] = useState(false)
  const stretchNoticeTimeoutRef = useRef<number | null>(null)
  const toast = useToast()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isStretchMode = fitMode === 'fill'
  const fitModes: Array<{ value: FitMode; label: string; icon: ReactNode }> = [
    { value: 'contain', label: 'Fit', icon: <Minimize2 className="w-4 h-4" /> },
    { value: 'cover', label: 'Fill', icon: <Crop className="w-4 h-4" /> },
    { value: 'fill', label: 'Stretch', icon: <Maximize2 className="w-4 h-4" /> },
  ]
  const fitIndex = fitModes.findIndex((mode) => mode.value === fitMode)
  const currentFitMode = fitModes[fitIndex] || fitModes[0]

  const cycleFitMode = (step: number) => {
    const nextIndex = (fitIndex + step + fitModes.length) % fitModes.length
    const nextMode = fitModes[nextIndex].value
    window.localStorage.setItem('sports-player-fit-mode', nextMode)
    setFitMode(nextMode)

    if (nextMode === 'fill') {
      setShowStretchNotice(true)
      if (stretchNoticeTimeoutRef.current) {
        window.clearTimeout(stretchNoticeTimeoutRef.current)
      }
      stretchNoticeTimeoutRef.current = window.setTimeout(() => {
        setShowStretchNotice(false)
        stretchNoticeTimeoutRef.current = null
      }, 3000)
    } else {
      setShowStretchNotice(false)
      if (stretchNoticeTimeoutRef.current) {
        window.clearTimeout(stretchNoticeTimeoutRef.current)
        stretchNoticeTimeoutRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (stretchNoticeTimeoutRef.current) {
        window.clearTimeout(stretchNoticeTimeoutRef.current)
      }
    }
  }, [])

  const syncFullscreenState = () => {
    const fullscreenElement = document.fullscreenElement
    setIsFullscreen(
      fullscreenElement === playerContainerRef.current ||
        (playerContainerRef.current?.contains(fullscreenElement as Element) ?? false)
    )
  }

  const lockScreenOrientation = async (orientation: 'landscape' | 'portrait') => {
    if ('orientation' in screen && typeof screen.orientation?.lock === 'function') {
      try {
        await screen.orientation.lock(orientation)
      } catch (error) {
        console.warn('Unable to lock orientation:', error)
      }
    }
  }

  const requestPlayerFullscreen = async () => {
    const element = playerContainerRef.current || iframeRef.current
    if (!element) return

    if ('requestFullscreen' in element) {
      await element.requestFullscreen()
      await lockScreenOrientation('landscape')
    } else if ('webkitRequestFullscreen' in element) {
      ;(element as any).webkitRequestFullscreen()
    }
  }

  const exitPlayerFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      if ('orientation' in screen && typeof screen.orientation?.unlock === 'function') {
        screen.orientation.unlock()
      }
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitPlayerFullscreen()
    } else {
      requestPlayerFullscreen()
    }
  }

  useEffect(() => {
    const savedFitMode = window.localStorage.getItem('sports-player-fit-mode') as FitMode | null
    if (savedFitMode && ['contain', 'cover', 'fill'].includes(savedFitMode)) {
      setFitMode(savedFitMode)
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    syncFullscreenState()

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  useEffect(() => {
    // Check if this is a direct IPTV stream from Live TV
    const state = location.state as { streamUrl?: string; channelName?: string } | null
    if (state?.streamUrl) {
      setDirectStream({
        url: state.streamUrl,
        name: state.channelName || 'Live Channel',
      })
      setLoading(false)
    } else {
      // Otherwise, fetch from sports API
      async function fetchStreams() {
        // Handle both route patterns: /sports/:source/:id and /sports/:matchId
        const streamSource = source || 'alpha' // default source if not provided
        const streamId = id || matchId

        if (!streamId) {
          setStreams([])
          setFetchError('No valid stream ID found for this match.')
          setLoading(false)
          return
        }

        try {
          setFetchError(null)
          setLoading(true)
          const data = await sportsApi.getStreams(streamSource, streamId)
          if (data.length === 0) {
            setFetchError('No streams available for this match right now.')
          }
          setStreams(data)
          setLoading(false)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to fetch streams.'
          console.error('Error fetching streams:', error)
          setFetchError('Unable to load match streams. Please try again.')
          toast.error(`Stream load failed: ${message}`)
          setLoading(false)
        }
      }

      fetchStreams()
    }

    // Cleanup iframe on unmount
    return () => {
      if (import.meta.env.DEV) {
        console.log('[SportsPlayer] Cleaning up iframe')
      }
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank'
      }
    }
  }, [source, id, matchId, location.state, retryCount, toast])





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepBlack">
        <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepBlack px-4">
        <div className="max-w-xl w-full glass rounded-3xl border border-primary/20 bg-primary/10 p-6 text-center">
          <p className="text-sm font-semibold text-primary">Unable to load live streams</p>
          <p className="mt-3 text-gray-200">{fetchError}</p>
          <button
            type="button"
            onClick={() => {
              setFetchError(null)
              setLoading(true)
              setRetryCount((prev) => prev + 1)
            }}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!directStream && streams.length === 0) {
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
    <div className="bg-deepBlack">
      <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {directStream ? directStream.name : 'Live Match'}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              {directStream ? 'Live TV Channel' : `Stream ${selectedStream + 1} of ${streams.length}`}
            </p>
          </div>

          {/* Player Container */}
          <div
            ref={playerContainerRef}
            className="overflow-hidden transition-all duration-200 glass-strong rounded-lg mb-6"
            style={isStretchMode && !isFullscreen ? { minHeight: '70vh' } : undefined}
          >
            {/* Player Wrapper */}
            <div className={`relative bg-black ${isStretchMode ? 'h-[70vh] sm:h-[80vh]' : 'aspect-video'}`}>
              {/* LIVE Indicator */}
              <div className="absolute top-3 left-3 z-50 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
                <div className="w-2 h-2 bg-red-50 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">LIVE NOW</span>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="absolute top-3 right-3 z-50 inline-flex items-center justify-center rounded-full border border-white/15 bg-black/60 p-2 text-white transition hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>


              {/* Stream iframe container with dynamic object-fit and rotation */}
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={directStream ? directStream.url : currentStream.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    objectFit: fitMode,
                  }}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                />
              </div>
            </div>

            <div className="absolute left-4 right-4 bottom-4 z-40 flex justify-center">
              <div className="glass rounded-full px-2 py-1 shadow-lg shadow-black/40 backdrop-blur-xl flex items-center gap-1 max-w-[240px] w-full justify-center">
                <button
                  type="button"
                  onClick={() => cycleFitMode(-1)}
                  aria-label="Previous scale mode"
                  className="rounded-full border border-white/15 bg-black/70 p-1.5 transition hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-1 text-xs font-semibold text-white transition-all duration-300">
                  {currentFitMode.icon}
                  <span>{currentFitMode.label}</span>
                  {isStretchMode && showStretchNotice && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                      Stretch Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => cycleFitMode(1)}
                  aria-label="Next scale mode"
                  className="rounded-full border border-white/15 bg-black/70 p-1.5 transition hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Stream Selector - only show for sports API streams */}
          {!directStream && streams.length > 1 && (
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

          {/* Stream Info - only show for sports API streams */}
          {!directStream && (
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
