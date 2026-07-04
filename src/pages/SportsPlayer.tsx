import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Radio, ArrowLeft, Minimize2, Maximize2 } from 'lucide-react'
import { sportsApi, Stream } from '../api/sports'
import { useToast } from '../hooks/useToast'

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
  const toast = useToast()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    const container = playerContainerRef.current
    const iframe = iframeRef.current
    // Try making the player container fullscreen first
    if (container && 'requestFullscreen' in container) {
      try {
        await container.requestFullscreen()
        void lockScreenOrientation('landscape')
        return
      } catch (error) {
        console.warn('Container fullscreen request failed:', error)
      }
    }

    // Fallback: try requesting fullscreen on the iframe element itself
    if (iframe && 'requestFullscreen' in iframe) {
      try {
        await iframe.requestFullscreen()
        void lockScreenOrientation('landscape')
        return
      } catch (error) {
        console.warn('Iframe fullscreen request failed:', error)
      }
    }

    // Last resort: if the iframe exposes a postMessage API, ask it to enter fullscreen
    try {
      iframe?.contentWindow?.postMessage({ type: 'request-fullscreen' }, '*')
      // orientation lock may be handled by the embedded player when it enters fullscreen
    } catch (error) {
      console.warn('Unable to postMessage to iframe for fullscreen:', error)
    }
  }

  const exitPlayerFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      if ('orientation' in screen && typeof screen.orientation?.unlock === 'function') {
        void screen.orientation.unlock()
      }
    }
  }

  const syncFullscreenState = () => {
    const fullscreenElement = document.fullscreenElement
    setIsFullscreen(
      fullscreenElement === playerContainerRef.current ||
        (playerContainerRef.current?.contains(fullscreenElement as Element) ?? false)
    )
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitPlayerFullscreen()
    } else {
      requestPlayerFullscreen()
    }
  }

  useEffect(() => {
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
            className={`overflow-hidden transition-all duration-200 glass-strong mb-6 ${
              isFullscreen ? 'rounded-none w-screen h-screen' : 'rounded-lg'
            }`}
            style={isFullscreen ? { background: 'black' } : undefined}
          >
            {/* Player Wrapper */}
            <div className="relative bg-black aspect-video sm:aspect-[16/9]">
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


              {/* Stream iframe container with dynamic object-fit */}
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={directStream ? directStream.url : currentStream.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%'
                  }}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                />
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
