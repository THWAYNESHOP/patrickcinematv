import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Hls from 'hls.js'
import { AlertCircle, Clock3, Heart, Loader2, Maximize2, Minimize, Play, Search, Star, Tv2, Wifi, WifiOff, Expand } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import sportsPlaylist from '../data/sports-playlist.m3u?raw'
import {
  cleanStreamUrl,
  getPlaybackKind,
  parseIptvPlaylist,
  checkStreamStatus,
  type IptvChannel,
} from '../components/IPTV/playlist'

type PlaybackError = {
  title: string
  message: string
}

const FAVORITES_STORAGE_KEY = 'patrickCinemaSportsFavorites'
const RECENT_STORAGE_KEY = 'patrickCinemaSportsRecent'

export default function IPTVPlayer() {
  const channels = useMemo(() => parseIptvPlaylist(sportsPlaylist), [])
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id ?? '')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Спортивные')
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(FAVORITES_STORAGE_KEY, [])
  const [recentIds, setRecentIds] = useLocalStorage<string[]>(RECENT_STORAGE_KEY, [])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isStretched, setIsStretched] = useState(false)
  const [playbackError, setPlaybackError] = useState<PlaybackError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [retryToken, setRetryToken] = useState(0)
  const [streamStatus, setStreamStatus] = useState<Record<string, boolean>>({})
  const [isOnline, setIsOnline] = useState(true)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const categories = useMemo(() => {
    const unique = new Set(channels.map((channel) => channel.category).filter(Boolean))
    return ['All', ...Array.from(unique)]
  }, [channels])

  const selectedChannel = useMemo<IptvChannel | undefined>(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? channels[0],
    [channels, selectedChannelId]
  )

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return channels.filter((channel) => {
      const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory
      const haystack = `${channel.name} ${channel.category} ${channel.group ?? ''}`.toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      return matchesCategory && matchesSearch
    })
  }, [channels, searchQuery, selectedCategory])

  const favoriteChannels = useMemo(
    () => favoriteIds.map((id) => channels.find((channel) => channel.id === id)).filter(Boolean) as IptvChannel[],
    [channels, favoriteIds]
  )

  const recentChannels = useMemo(
    () => recentIds.map((id) => channels.find((channel) => channel.id === id)).filter(Boolean) as IptvChannel[],
    [channels, recentIds]
  )

  const playbackKind = useMemo(() => (selectedChannel ? getPlaybackKind(selectedChannel) : 'unsupported'), [selectedChannel])
  const isBlockedByHeaders = selectedChannel?.hasUnsupportedHeaders ?? false

  useEffect(() => {
    if (!channels.length) return
    if (!selectedChannelId) {
      setSelectedChannelId(channels[0].id)
      return
    }

    if (filteredChannels.length && !filteredChannels.some((channel) => channel.id === selectedChannelId)) {
      setSelectedChannelId(filteredChannels[0].id)
    }
  }, [channels, filteredChannels, selectedChannelId])

  useEffect(() => {
    if (!selectedChannel) return

    setRecentIds((previous) => {
      const next = [selectedChannel.id, ...previous.filter((id) => id !== selectedChannel.id)]
      return next.slice(0, 12)
    })
  }, [selectedChannel, setRecentIds])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    setPlaybackError(null)

    if (!selectedChannel || !video) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const cleanUrl = cleanStreamUrl(selectedChannel.streamUrl)

    if (playbackKind === 'iframe') {
      setIsLoading(false)
      return
    }

    const supportsNativeHls =
      video.canPlayType('application/vnd.apple.mpegurl') !== '' ||
      video.canPlayType('application/x-mpegURL') !== ''

    const directVideo = /\.(mp4|webm)(\?|$)/i.test(cleanUrl)

    if (directVideo) {
      video.src = cleanUrl
      video.load()
      video.play().catch(() => {
        setPlaybackError({
          title: 'Playback Error',
          message: 'Could not autoplay. Click play to start.',
        })
        setIsLoading(false)
      })
      video.onloadedmetadata = () => setIsLoading(false)
      video.onerror = () => {
        setPlaybackError({
          title: 'Stream Error',
          message: 'Unable to load the video file.',
        })
        setIsLoading(false)
      }
      return
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        debug: false,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false
        },
      })

      hlsRef.current = hls
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(cleanUrl)
      })
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        video.play().catch(() => {
          console.log('Autoplay blocked, user interaction required')
        })
      })
      
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover')
              hls.recoverMediaError()
              break
            default:
              console.log('Fatal error:', data.details)
              setPlaybackError({
                title: 'Stream Error',
                message: isBlockedByHeaders
                  ? 'This stream requires custom headers and cannot be played directly in a browser.'
                  : data.details === 'manifestLoadError'
                    ? 'The playlist could not be loaded. The stream may be offline or blocked.'
                    : 'Unable to load the stream. Please try another channel.',
              })
              setIsLoading(false)
          }
        }
      })
      
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log('Stream loading timeout')
          setPlaybackError({
            title: 'Loading Timeout',
            message: 'The stream is taking too long to load. It may be offline or blocked.',
          })
          setIsLoading(false)
        }
      }, 20000)
      
      return () => {
        clearTimeout(timeout)
        hls.destroy()
      }
    }

    if (supportsNativeHls) {
      video.src = cleanUrl
      video.load()
      video.play().catch(() => {
        setPlaybackError({
          title: 'Playback Error',
          message: 'Could not autoplay. Click play to start.',
        })
        setIsLoading(false)
      })
      video.onloadedmetadata = () => setIsLoading(false)
      video.onerror = () => {
        setPlaybackError({
          title: 'Stream Error',
          message: 'Unable to load the stream.',
        })
        setIsLoading(false)
      }
      return
    }

    setPlaybackError({
      title: 'Stream Error',
      message: 'This browser does not support HLS playback for this stream.',
    })
    setIsLoading(false)
  }, [isBlockedByHeaders, playbackKind, retryToken, selectedChannel])

  const toggleFavorite = (channelId: string) => {
    setFavoriteIds((previous) => {
      if (previous.includes(channelId)) {
        return previous.filter((id) => id !== channelId)
      }

      return [channelId, ...previous].slice(0, 50)
    })
  }

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return

    if (!document.fullscreenElement) {
      await playerContainerRef.current.requestFullscreen().catch(() => {})
    } else {
      await document.exitFullscreen()
    }
  }

  const toggleStretch = () => {
    setIsStretched(!isStretched)
  }

  const handleSelectChannel = (channel: IptvChannel) => {
    setSelectedChannelId(channel.id)
    setPlaybackError(null)
  }

  const handleRetry = () => {
    setPlaybackError(null)
    setRetryToken((value) => value + 1)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  const handleFailover = () => {
    const currentIndex = filteredChannels.findIndex((c) => c.id === selectedChannelId)
    const nextIndex = (currentIndex + 1) % filteredChannels.length
    if (filteredChannels[nextIndex]) {
      handleSelectChannel(filteredChannels[nextIndex])
    }
  }

  const currentChannelIsFavorite = selectedChannel ? favoriteIds.includes(selectedChannel.id) : false
  const playbackModeLabel =
    playbackKind === 'iframe' ? 'Embed' : playbackKind === 'video' ? 'Direct Video' : playbackKind === 'hls' ? 'HLS' : 'Blocked'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-24 pb-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-400/80">Patrick Cinema TV</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">Sports IPTV Player</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-400">
              Live sports channels from around the world with favorites, search, and category filters.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2">
              <Tv2 className="h-4 w-4 text-blue-400" />
              <span>{channels.length} channels</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2">
              <Clock3 className="h-4 w-4 text-blue-400" />
              <span>{recentChannels.length} recent</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2">
              <Heart className="h-4 w-4 text-blue-400" />
              <span>{favoriteChannels.length} favorites</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="order-2 lg:order-1 space-y-4">
            <div className="backdrop-blur-xl rounded-2xl border border-blue-500/20 bg-slate-900/60 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search channels..."
                  className="w-full rounded-xl border border-blue-500/20 bg-slate-800/50 py-3 pl-11 pr-4 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
                />
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => {
                  const isActive = selectedCategory === category
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm transition ${
                        isActive
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-blue-500/20 bg-slate-800/50 text-gray-300 hover:border-blue-500/40 hover:bg-slate-700/50'
                      }`}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>

            {favoriteChannels.length > 0 && (
              <SectionCard title="Favorites" count={favoriteChannels.length}>
                <ChannelStrip
                  channels={favoriteChannels}
                  selectedChannelId={selectedChannel?.id ?? ''}
                  onSelect={handleSelectChannel}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavorite}
                />
              </SectionCard>
            )}

            {recentChannels.length > 0 && (
              <SectionCard title="Recently Watched" count={recentChannels.length}>
                <ChannelStrip
                  channels={recentChannels}
                  selectedChannelId={selectedChannel?.id ?? ''}
                  onSelect={handleSelectChannel}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={toggleFavorite}
                />
              </SectionCard>
            )}

            <SectionCard title="Channels" count={filteredChannels.length}>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                {filteredChannels.map((channel) => {
                  const isSelected = channel.id === selectedChannel?.id
                  const isFavorite = favoriteIds.includes(channel.id)
                  return (
                    <div
                      key={channel.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectChannel(channel)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleSelectChannel(channel)
                        }
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500/20 bg-slate-800/50 hover:border-blue-500/40 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900/50 text-xs font-semibold text-white">
                        {channel.logo ? (
                          <img src={channel.logo} alt="" className="h-full w-full rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <span>{channel.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-white">{channel.name}</p>
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-300 animate-pulse">
                            LIVE
                          </span>
                        </div>
                        <p className="truncate text-sm text-gray-400">{channel.category}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {channel.is4K ? <Badge label="4K" tone="gold" /> : channel.isHD ? <Badge label="HD" tone="emerald" /> : null}
                          {channel.hasUnsupportedHeaders && <Badge label="Browser blocked" tone="rose" />}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleFavorite(channel.id)
                        }}
                        className={`rounded-full border p-2 transition ${
                          isFavorite
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-blue-500/20 bg-slate-900/30 text-gray-400 hover:border-blue-500/40 hover:text-white'
                        }`}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  )
                })}

                {filteredChannels.length === 0 && (
                  <div className="rounded-xl border border-dashed border-blue-500/20 bg-slate-800/30 p-8 text-center text-sm text-gray-400">
                    No channels match your search.
                  </div>
                )}
              </div>
            </SectionCard>
          </aside>

          <section className="order-1 lg:order-2 space-y-4">
            <div ref={playerContainerRef} className="backdrop-blur-xl overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/60">
              <div className={`relative bg-black ${isStretched ? 'object-cover' : ''}`}>
                <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg shadow-red-600/20">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  LIVE NOW
                </div>

                <div className="absolute right-4 top-4 z-20 max-w-[70%] rounded-full bg-black/70 px-3 py-1.5 backdrop-blur">
                  <span className="block truncate text-xs font-semibold text-white">
                    {selectedChannel?.name ?? 'Select a channel'}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                  <button
                    type="button"
                    onClick={toggleStretch}
                    className="rounded-lg bg-blue-500/80 p-2.5 text-white transition hover:bg-blue-500"
                    aria-label="Toggle stretch"
                    title="Stretch to fill"
                  >
                    <Expand className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="rounded-lg bg-blue-500/80 p-2.5 text-white transition hover:bg-blue-500"
                    aria-label="Toggle fullscreen"
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>
                </div>

                {isLoading && !playbackError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-14 w-14 animate-spin text-blue-400" />
                      <p className="mt-4 text-sm text-gray-300">Loading stream...</p>
                    </div>
                  </div>
                )}

                {playbackError ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 px-6 text-center">
                    <div className="max-w-md">
                      <AlertCircle className="mx-auto mb-4 h-16 w-16 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">{playbackError.title}</h2>
                      <p className="mt-2 text-sm text-gray-400">{playbackError.message}</p>
                      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-600"
                        >
                          <Play className="h-4 w-4" />
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={handleFailover}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20"
                        >
                          Try Next Channel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {selectedChannel && !playbackError && (
                  <>
                    {playbackKind === 'iframe' ? (
                      <iframe
                        key={`${selectedChannel.id}-${retryToken}`}
                        src={selectedChannel.playbackUrl}
                        className={`aspect-video w-full bg-black ${isStretched ? 'object-cover' : ''}`}
                        style={isStretched ? { objectFit: 'cover', width: '100%', height: '100%' } : {}}
                        title={selectedChannel.name}
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        frameBorder="0"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                          setPlaybackError({
                            title: 'Stream Error',
                            message: 'Unable to load the embed source.',
                          })
                          setIsLoading(false)
                        }}
                      />
                    ) : (
                      <video
                        key={`${selectedChannel.id}-${retryToken}`}
                        ref={videoRef}
                        className={`aspect-video w-full bg-black ${isStretched ? 'object-cover' : ''}`}
                        style={isStretched ? { objectFit: 'cover', width: '100%', height: '100%' } : {}}
                        controls
                        autoPlay
                        playsInline
                        muted
                        onCanPlay={() => {
                          setIsLoading(false)
                          videoRef.current?.play().catch(() => {
                            console.log('Autoplay blocked after canPlay')
                          })
                        }}
                        onLoadedMetadata={() => {
                          setIsLoading(false)
                          videoRef.current?.play().catch(() => {
                            console.log('Autoplay blocked after loadedMetadata')
                          })
                        }}
                        onPlaying={() => setIsLoading(false)}
                        onWaiting={() => setIsLoading(true)}
                        onError={() => {
                          setPlaybackError({
                            title: 'Stream Error',
                            message: isBlockedByHeaders
                              ? 'This stream cannot be played directly in a browser.'
                              : 'Unable to load the stream. Please try another channel.',
                          })
                          setIsLoading(false)
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="backdrop-blur-xl rounded-2xl border border-blue-500/20 bg-slate-900/60 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">Now Playing</h2>
                  <p className="text-sm text-gray-400">
                    {selectedChannel ? 'Selected from the sports playlist.' : 'Choose a channel from the list.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectedChannel && toggleFavorite(selectedChannel.id)}
                    disabled={!selectedChannel}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                      currentChannelIsFavorite
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-blue-500/20 bg-slate-800/50 text-gray-300 hover:border-blue-500/40 hover:bg-slate-700/50 hover:text-white'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Heart className={`h-4 w-4 ${currentChannelIsFavorite ? 'fill-current' : ''}`} />
                    {currentChannelIsFavorite ? 'Favorited' : 'Add Favorite'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoBlock label="Channel" value={selectedChannel?.name ?? 'None'} />
                <InfoBlock label="Category" value={selectedChannel?.category ?? 'None'} />
                <InfoBlock label="Quality" value={selectedChannel?.is4K ? '4K' : selectedChannel?.isHD ? 'HD' : 'SD'} />
                <InfoBlock label="Playback" value={playbackModeLabel} />
              </div>

              {selectedChannel && (
                <div className="mt-4 rounded-xl border border-blue-500/20 bg-slate-800/30 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Stream Source</p>
                  <p className="mt-2 break-all text-sm text-gray-300">{selectedChannel.playbackUrl}</p>
                  <p className="mt-3 text-sm text-gray-400">
                    {isBlockedByHeaders
                      ? 'This stream cannot be played directly in a browser.'
                      : 'Direct browser playback is attempted with HLS.js when needed.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <section className="backdrop-blur-xl rounded-2xl border border-blue-500/20 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-300">{title}</h2>
        <span className="rounded-full border border-blue-500/20 bg-slate-800/50 px-2.5 py-1 text-xs text-gray-400">{count}</span>
      </div>
      {children}
    </section>
  )
}

function ChannelStrip({
  channels,
  selectedChannelId,
  onSelect,
  favoriteIds,
  onToggleFavorite,
}: {
  channels: IptvChannel[]
  selectedChannelId: string
  onSelect: (channel: IptvChannel) => void
  favoriteIds: string[]
  onToggleFavorite: (channelId: string) => void
}) {
  return (
    <div className="space-y-2">
      {channels.map((channel) => {
        const isSelected = channel.id === selectedChannelId
        const isFavorite = favoriteIds.includes(channel.id)
        return (
          <div
            key={channel.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(channel)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(channel)
              }
            }}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
              isSelected
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-blue-500/20 bg-slate-800/50 hover:border-blue-500/40 hover:bg-slate-700/50'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900/50 text-[10px] font-bold text-white">
              {channel.logo ? (
                <img src={channel.logo} alt="" className="h-full w-full rounded-lg object-cover" loading="lazy" />
              ) : (
                <span>{channel.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{channel.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="truncate text-xs text-gray-400">{channel.category}</span>
                {channel.is4K ? <Badge label="4K" tone="gold" /> : channel.isHD ? <Badge label="HD" tone="emerald" /> : null}
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleFavorite(channel.id)
              }}
              className={`rounded-full border p-2 transition ${
                isFavorite
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-500/20 bg-slate-900/30 text-gray-400 hover:border-blue-500/40 hover:text-white'
              }`}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-slate-800/30 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  )
}

function Badge({ label, tone }: { label: string; tone: 'emerald' | 'gold' | 'rose' }) {
  const toneClasses = {
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    gold: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${toneClasses[tone]}`}>
      {label}
    </span>
  )
}
