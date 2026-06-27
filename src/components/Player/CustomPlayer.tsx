import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Monitor, Clock } from 'lucide-react'

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
  const [showSleepTimerMenu, setShowSleepTimerMenu] = useState(false)
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null)
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0)

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

    // Cleanup on unmount
    return () => {
      console.log('[CustomPlayer] Cleaning up video player')
      video.pause()
      video.src = ''
      video.load()
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

  // Sleep Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (sleepTimerMinutes !== null) {
      const endTime = Date.now() + sleepTimerMinutes * 60 * 1000

      interval = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now())
        setSleepTimerRemaining(remaining)

        if (remaining <= 0) {
          setSleepTimerMinutes(null)
          clearInterval(interval)
          const video = videoRef.current
          if (video) {
            video.pause()
            setIsPlaying(false)
          }
        }
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [sleepTimerMinutes])

  const startSleepTimer = (minutes: number) => {
    setSleepTimerMinutes(minutes)
    setShowSleepTimerMenu(false)
  }

  const cancelSleepTimer = () => {
    setSleepTimerMinutes(null)
  }

  // Picture-in-Picture
  const togglePiP = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await video.requestPictureInPicture()
      }
    } catch (error) {
      console.error('PiP error:', error)
    }
  }

  const formatSleepTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

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
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors neon-glow min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={skipBackward}
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
            >
              <SkipBack className="w-5 h-5 md:w-5 md:h-5" />
            </button>

            <button
              onClick={skipForward}
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
            >
              <SkipForward className="w-5 h-5 md:w-5 md:h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
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

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Sleep Timer */}
            <div className="relative">
              <button
                onClick={() => setShowSleepTimerMenu(!showSleepTimerMenu)}
                className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
              >
                <Clock className="w-5 h-5 md:w-5 md:h-5" />
              </button>

              {showSleepTimerMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-darkSurface border border-white/10 rounded-xl p-3 shadow-2xl z-50 min-w-[160px]">
                  <div className="flex flex-col gap-2">
                    {[15, 30, 60, 120].map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => startSleepTimer(minutes)}
                        className="px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg tv-focusable tv-touch-target"
                      >
                        {minutes} min
                      </button>
                    ))}
                    {sleepTimerMinutes !== null && (
                      <button
                        onClick={cancelSleepTimer}
                        className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg tv-focusable tv-touch-target"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="p-3 md:p-2 hover:bg-white/20 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
            >
              <Monitor className="w-5 h-5 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Sleep Timer Remaining Indicator */}
        {sleepTimerMinutes !== null && (
          <div className="absolute top-4 right-4 glass px-3 py-2 rounded-lg z-40 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              {formatSleepTime(sleepTimerRemaining)}
            </span>
          </div>
        )}
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
