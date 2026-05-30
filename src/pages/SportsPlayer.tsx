import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { sportsApi, Stream } from '../api/sports'

export default function SportsPlayer() {
  const { source, id } = useParams()
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState(0)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neonPink border-t-transparent rounded-full" />
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No streams available</p>
        </div>
      </div>
    )
  }

  const currentStream = streams[selectedStream]

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 neon-text">Live Match</h1>
        
        {/* Player */}
        <div className="glass-strong rounded-lg overflow-hidden mb-6">
          <div className="relative aspect-video bg-black">
            {/* Stream Selector */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {streams.map((stream, index) => (
                <button
                  key={stream.id}
                  onClick={() => setSelectedStream(index)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedStream === index
                      ? 'bg-neonPink text-white'
                      : 'glass hover:bg-white/20'
                  }`}
                >
                  {stream.language || `Stream ${stream.streamNo}`} {stream.hd && 'HD'}
                </button>
              ))}
            </div>

            {/* Stream iframe */}
            <iframe
              src={currentStream.embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>

        {/* Stream Info */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Stream Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Stream Number</p>
              <p className="font-semibold">{currentStream.streamNo}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Language</p>
              <p className="font-semibold">{currentStream.language || 'Default'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Quality</p>
              <p className="font-semibold">{currentStream.hd ? 'HD' : 'SD'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Source</p>
              <p className="font-semibold">{currentStream.source}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
