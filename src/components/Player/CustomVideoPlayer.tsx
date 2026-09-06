import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import PlayerControls from './PlayerControls'
import { ScalingMode } from '../../types/player'

interface CustomVideoPlayerProps {
  src: string
  poster?: string
  streamType?: 'hls' | 'mp4' | 'dash'
}

export default function CustomVideoPlayer({ src, poster, streamType = 'hls' }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [scalingMode, setScalingMode] = useState<ScalingMode>('fit')
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
    const elem = containerRef.current
    if (!elem) return

    if (!document.fullscreenElement) {
      await elem.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = newVolume
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      video.muted = false
    }
  }

  const handlePlaybackSpeedChange = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const handleSeek = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleScalingModeChange = (mode: ScalingMode) => {
    setScalingMode(mode)
  }



  const getVideoStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      transition: 'all 0.3s ease',
    }

    switch (scalingMode) {
      case 'stretch':
        style.objectFit = 'fill'
        break
      case 'zoom':
        style.objectFit = 'cover'
        break
      case 'crop':
        style.objectFit = 'cover'
        style.transform = 'scale(1.2)'
        break
      case '16:9':
        style.aspectRatio = '16 / 9'
        style.objectFit = 'contain'
        break
      case '4:3':
        style.aspectRatio = '4 / 3'
        style.objectFit = 'contain'
        break
      case 'fit':
      default:
        style.objectFit = 'contain'
        break
    }

    return style
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video">
      <video
        ref={videoRef}
        style={getVideoStyle()}
        poster={poster}
        controls={false}
        playsInline
      />
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-sm text-gray-200">
          {error}
        </div>
      ) : null}

      <PlayerControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        playbackSpeed={playbackSpeed}
        quality="HD"
        scalingMode={scalingMode}
        onPlayPause={togglePlay}
        onMute={toggleMute}
        onFullscreen={toggleFullscreen}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onPlaybackSpeedChange={handlePlaybackSpeedChange}
        onQualityChange={() => {}}
        onScalingModeChange={handleScalingModeChange}
        showPiP={true}
        onPiP={() => {
          if (videoRef.current) {
            videoRef.current.requestPictureInPicture().catch(console.error)
          }
        }}
      />
    </div>
  )
}
