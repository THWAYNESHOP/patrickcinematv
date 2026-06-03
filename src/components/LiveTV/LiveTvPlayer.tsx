import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Maximize2, Minimize, X } from 'lucide-react'
import { LiveTvChannel } from '../../data/liveTvChannels'
import { getProxyUrl, inferPlaybackMode } from './m3u'

interface LiveTvPlayerProps {
  channel: LiveTvChannel
  onClose: () => void
  embedded?: boolean
}

export default function LiveTvPlayer({ channel, onClose, embedded = false }: LiveTvPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const originalStreamUrl = channel.streamUrl
  const streamUrl = useMemo(() => getProxyUrl(originalStreamUrl), [originalStreamUrl])
  const playbackMode = useMemo(() => inferPlaybackMode(originalStreamUrl), [originalStreamUrl])

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    const timeout = window.setTimeout(() => {
      if (playbackMode === 'iframe') {
        setIsLoading(false)
      }
    }, 12000)

    return () => window.clearTimeout(timeout)
  }, [streamUrl, playbackMode])

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

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleVideoCanPlay = () => {
    setIsLoading(false)
  }

  const handleVideoError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const canPlayNativeHls = useMemo(() => {
    if (typeof document === 'undefined') return true

    const probe = document.createElement('video')
    return (
      probe.canPlayType('application/vnd.apple.mpegurl') !== '' ||
      probe.canPlayType('application/x-mpegURL') !== ''
    )
  }, [])

  const showUnsupportedHlsError =
    playbackMode === 'video' && streamUrl.toLowerCase().includes('.m3u8') && !canPlayNativeHls

  useEffect(() => {
    if (showUnsupportedHlsError) {
      setIsLoading(false)
      setHasError(true)
    }
  }, [showUnsupportedHlsError])

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-deepBlack`}>
      <div
        className={
          embedded
            ? 'w-full h-full flex flex-col'
            : isFullscreen
              ? 'w-full h-full flex flex-col'
              : 'min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8'
        }
      >
        <div className={embedded ? 'w-full h-full flex flex-col' : isFullscreen ? 'w-full h-full flex flex-col' : 'container mx-auto max-w-7xl'}>
          {!embedded && !isFullscreen && (
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Live TV</h1>
                <p className="text-sm sm:text-base text-gray-400 mt-2">{channel.name}</p>
              </div>
              <button
                onClick={onClose}
                className="glass hover:bg-white/15 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}

          <div
            ref={playerContainerRef}
            className={`glass-strong rounded-lg overflow-hidden mb-6 transition-all duration-200 ${
              isFullscreen ? 'rounded-none mb-0 w-full h-full' : ''
            }`}
          >
            <div className={`relative bg-black ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}>
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-red-50 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">LIVE NOW</span>
              </div>

              <div className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full max-w-[70%]">
                <span className="text-xs font-semibold text-white truncate block">{channel.name}</span>
              </div>

              <div className="absolute bottom-3 right-3 z-20 flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                {isFullscreen && (
                  <button
                    onClick={onClose}
                    title="Close Player"
                    className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95"
                    aria-label="Close player"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-10">
                  <div className="text-center p-6 max-w-md">
                    <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold mb-2">Stream Error</p>
                    <p className="text-gray-400 text-sm">
                      {showUnsupportedHlsError
                        ? 'This browser does not support native HLS playback for this stream.'
                        : 'Unable to load the stream. Check the source URL and try again.'}
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false)
                        setIsLoading(true)
                        if (playbackMode === 'video' && videoRef.current) {
                          videoRef.current.load()
                        }
                      }}
                      className="mt-4 bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {playbackMode === 'video' ? (
                <video
                  ref={videoRef}
                  src={streamUrl}
                  className="w-full h-full bg-black"
                  controls
                  autoPlay
                  playsInline
                  muted
                  onCanPlay={handleVideoCanPlay}
                  onLoadedMetadata={handleVideoCanPlay}
                  onError={handleVideoError}
                />
              ) : (
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  title={channel.name}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                  onLoad={handleIframeLoad}
                  onError={handleVideoError}
                />
              )}
            </div>
          </div>

          {!embedded && !isFullscreen && (
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Channel Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Channel Name</p>
                  <p className="font-semibold text-white">{channel.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="font-semibold text-white">{channel.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Quality</p>
                  <p className="font-semibold text-white">{channel.isHD ? 'HD' : 'SD'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mode</p>
                  <p className="font-semibold text-white">{playbackMode === 'video' ? 'Video' : 'Embed'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
