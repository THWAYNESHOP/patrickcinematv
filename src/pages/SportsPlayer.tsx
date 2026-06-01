import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Maximize, Minimize, Maximize2, Radio } from 'lucide-react'
import { sportsApi, Stream } from '../api/sports'

type FitMode = 'contain' | 'cover'

export default function SportsPlayer() {
  const { source, id } = useParams()
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fitMode, setFitMode] = useState<FitMode>('contain')
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    async function fetchStreams() {
      if (!source || !id) {
        setStreams([])
        setLoading(false)
        return
      }

      try {
        const data = await sportsApi.getStreams(source, id)
        setStreams(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching streams:', error)
        setLoading(false)
      }
    }

    fetchStreams()
  }, [source, id])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await playerContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed:', err)
        })
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  const toggleFitMode = () => {
    setFitMode(fitMode === 'contain' ? 'cover' : 'contain')
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
      <div className={isFullscreen ? 'w-full h-full' : 'min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8'}>
        <div className={isFullscreen ? 'w-full h-full flex flex-col' : 'container mx-auto max-w-7xl'}>
          {/* Header - Hidden in fullscreen */}
          {!isFullscreen && (
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
            className={`glass-strong rounded-lg overflow-hidden mb-6 transition-all duration-200 ${
              isFullscreen ? 'rounded-none mb-0 w-full h-full' : ''
            }`}
          >
            {/* Player Wrapper */}
            <div
              className={`relative bg-black ${
                isFullscreen ? 'w-full h-full' : 'aspect-video'
              }`}
            >
              {/* LIVE Indicator */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-red-50 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">LIVE NOW</span>
              </div>

              {/* Player Controls */}
              <div className="absolute bottom-3 right-3 z-20 flex gap-2">
                {/* Fit/Stretch Toggle */}
                <button
                  onClick={toggleFitMode}
                  title={fitMode === 'contain' ? 'Switch to Fill' : 'Switch to Fit'}
                  className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95"
                  aria-label="Toggle fit mode"
                >
                  {fitMode === 'contain' ? (
                    <Maximize className="w-5 h-5" />
                  ) : (
                    <Minimize className="w-5 h-5" />
                  )}
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95"
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stream iframe with dynamic object-fit */}
              <iframe
                ref={iframeRef}
                src={currentStream.embedUrl}
                className={`w-full h-full ${
                  fitMode === 'contain' ? 'object-contain' : 'object-cover'
                }`}
                style={{
                  objectFit: fitMode === 'contain' ? 'contain' : 'cover',
                }}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
              />
            </div>
          </div>

          {/* Stream Selector - Hidden in fullscreen */}
          {!isFullscreen && streams.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Select Stream</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {streams.map((stream, index) => (
                  <button
                    key={stream.id}
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
