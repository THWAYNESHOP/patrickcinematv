import { useEffect, useMemo, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Pause, Play, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react'

interface CustomVideoPlayerProps {
  src: string
  title: string
  poster?: string
  streamType?: 'hls' | 'mp4' | 'dash'
}

export default function CustomVideoPlayer({ src, title, poster, streamType = 'hls' }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (streamType === 'hls' && Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Unable to load the HLS stream.')
        }
      })
      return () => hls.destroy()
    }

    if (streamType === 'hls' && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else if (streamType === 'mp4') {
      video.src = src
    } else {
      video.src = src
    }
  }, [src, streamType])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => setDuration(video.duration || 0)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [src])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      await video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const toggleFullscreen = async () => {
    const elem = videoRef.current?.parentElement
    if (!elem) return

    if (!document.fullscreenElement) {
      await elem.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = useMemo(() => (duration > 0 ? (currentTime / duration) * 100 : 0), [currentTime, duration])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black"
        poster={poster}
        controls={false}
        playsInline
      />
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-sm text-gray-200">
          {error}
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm text-white">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Play or pause">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={toggleMute} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Mute or unmute">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{title}</span>
            <button onClick={toggleFullscreen} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Toggle fullscreen">
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
