import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Settings, PiIcon, Gauge, Hd } from 'lucide-react'

interface PlayerControlsProps {
  isPlaying: boolean
  isMuted: boolean
  isFullscreen: boolean
  currentTime: number
  duration: number
  volume: number
  playbackSpeed: number
  quality: string
  onPlayPause: () => void
  onMute: () => void
  onFullscreen: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onPlaybackSpeedChange: (speed: number) => void
  onQualityChange: (quality: string) => void
  onPiP?: () => void
  showPiP?: boolean
}

export default function PlayerControls({
  isPlaying,
  isMuted,
  isFullscreen,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  quality,
  onPlayPause,
  onMute,
  onFullscreen,
  onSeek,
  onVolumeChange,
  onPlaybackSpeedChange,
  onQualityChange,
  onPiP,
  showPiP = true,
}: PlayerControlsProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const resetHideTimer = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      setIsVisible(true)
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    }

    const handleMouseMove = () => {
      resetHideTimer()
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const controls = controlsRef.current
    if (controls) {
      controls.addEventListener('mousemove', handleMouseMove)
      controls.addEventListener('mouseleave', handleMouseLeave)
      resetHideTimer()
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      if (controls) {
        controls.removeEventListener('mousemove', handleMouseMove)
        controls.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    onSeek(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    onVolumeChange(newVolume)
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={controlsRef}
      className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/20 cursor-pointer group" role="slider" aria-label="Video progress" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={currentTime} aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}>
        <div
          className="h-full bg-primary relative group-hover:h-2 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek video"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4" role="toolbar" aria-label="Video player controls">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="text-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          {/* Volume */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={onMute}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="text-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              aria-pressed={isMuted}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div
              className={`absolute bottom-full left-0 mb-2 p-2 bg-black/90 rounded-lg transition-opacity ${
                showVolumeSlider ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              role="dialog"
              aria-label="Volume control"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 accent-primary"
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={isMuted ? 0 : volume}
              />
            </div>
          </div>

          {/* Time */}
          <div className="text-white text-sm" aria-live="polite" aria-atomic="true">
            <span aria-label="Current time">{formatTime(currentTime)}</span>
            <span className="mx-2" aria-hidden="true">/</span>
            <span aria-label="Duration">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Quality Selector */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="text-white hover:text-primary transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label="Video quality"
              aria-expanded={showQualityMenu}
              aria-haspopup="true"
            >
              <Hd className="w-5 h-5" aria-hidden="true" />
              <span className="text-xs">{quality}</span>
            </button>
            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 shadow-xl border border-white/10 min-w-[100px]" role="menu" aria-label="Quality options">
                {['Auto', '1080p', '720p', '480p', '360p'].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onQualityChange(q)
                      setShowQualityMenu(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      q === quality
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                    role="menuitem"
                    aria-label={`Set quality to ${q}`}
                    aria-selected={q === quality}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-white hover:text-primary transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label="Playback speed"
              aria-expanded={showSpeedMenu}
              aria-haspopup="true"
            >
              <Gauge className="w-5 h-5" aria-hidden="true" />
              <span className="text-xs">{playbackSpeed}x</span>
            </button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 shadow-xl border border-white/10 min-w-[120px]" role="menu" aria-label="Playback speed options">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onPlaybackSpeedChange(speed)
                      setShowSpeedMenu(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      speed === playbackSpeed
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                    role="menuitem"
                    aria-label={`Set playback speed to ${speed}x`}
                    aria-selected={speed === playbackSpeed}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="text-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* PiP */}
          {showPiP && onPiP && (
            <button
              onClick={onPiP}
              className="text-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label="Picture in picture"
            >
              <PiIcon className="w-5 h-5" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={onFullscreen}
            className="text-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
