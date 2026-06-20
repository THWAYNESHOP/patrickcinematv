import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react'

interface CustomPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  onProgress?: (progress: number) => void
}

export default function CustomPlayer({ src, poster, title, autoPlay = false, onProgress }: CustomPlayerProps) {
  console.log('[CustomPlayer] Mounting with src:', src)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    console.log('[CustomPlayer] Video element mounted')
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const progress = (video.currentTime / video.duration) * 100
      onProgress?.(progress)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onProgress])

  useEffect(() => {
    let hideControlsTimeout: ReturnType<typeof setTimeout>
    if (showControls) {
      hideControlsTimeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }
    return () => clearTimeout(hideControlsTimeout)
  }, [showControls, isPlaying])

  // Touch event handlers for mobile
  const handleTouchStart = () => {
    setShowControls(true)
  }

  const handleTouchEnd = () => {
    let hideControlsTimeout: ReturnType<typeof setTimeout>
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
    return () => clearTimeout(hideControlsTimeout)
  }


  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const seekTime = (parseFloat(e.target.value) / 100) * video.duration
    video.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(video.currentTime + 10, video.duration)
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(video.currentTime - 10, 0)
  }


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative bg-black overflow-hidden flex items-center justify-center aspect-video">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full"
          style={{
            objectFit: 'contain',
          }}
          onClick={togglePlay}
          autoPlay={autoPlay}
          controls={false}
          playsInline
        />
      </div>

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity z-50 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4 pointer-events-auto">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 md:h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-neonPink neon-glow"
            style={{ height: '8px' }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
            <button
              onClick={togglePlay}
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors neon-glow min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={skipBackward}
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <SkipBack className="w-5 h-5 md:w-5 md:h-5" />
            </button>

            <button
              onClick={skipForward}
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <SkipForward className="w-5 h-5 md:w-5 md:h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {isMuted ? <VolumeX className="w-5 h-5 md:w-5 md:h-5" /> : <Volume2 className="w-5 h-5 md:w-5 md:h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 md:w-20 h-2 md:h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-neonPink"
              />
            </div>

            <span className="text-xs md:text-sm text-gray-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

        </div>
      </div>

      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 glass px-4 py-2 rounded-lg z-40 pointer-events-none">
          <p className="text-sm font-semibold neon-text">{title}</p>
        </div>
      )}
    </div>
  )
}
