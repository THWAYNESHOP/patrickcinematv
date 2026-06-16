import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { sportsApi, Stream } from '../api/sports'

export default function SportsPlayer() {
  console.log('[SportsPlayer] Mounting')
  const { source, id, matchId } = useParams()
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState(0)
  const [loading, setLoading] = useState(true)
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
    <div className="bg-deepBlack">
      <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Live Match</h1>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              Stream {selectedStream + 1} of {streams.length}
            </p>
          </div>

          {/* Player Container */}
          <div
            ref={playerContainerRef}
            className="overflow-hidden transition-all duration-200 glass-strong rounded-lg mb-6"
          >
            {/* Player Wrapper */}
            <div className="relative bg-black aspect-video">
              {/* LIVE Indicator */}
              <div className="absolute top-3 left-3 z-50 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
                <div className="w-2 h-2 bg-red-50 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">LIVE NOW</span>
              </div>


              {/* Stream iframe container with dynamic object-fit and rotation */}
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={currentStream.embedUrl}
                  className="w-full h-full"
                  style={{
                    objectFit: 'contain',
                  }}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                />
              </div>
            </div>
          </div>

          {/* Stream Selector */}
          {streams.length > 1 && (
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

          {/* Stream Info */}
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
        </div>
      </div>
    </div>
  )
}
