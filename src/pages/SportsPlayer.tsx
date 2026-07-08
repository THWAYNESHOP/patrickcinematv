import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Radio, ArrowLeft, Minimize2, Maximize2 } from 'lucide-react'
import { sportsApi, Stream } from '../api/sports'
import { useToast } from '../hooks/useToast'

export default function SportsPlayer() {
  if (import.meta.env.DEV) {
    console.log('[SportsPlayer] Mounting')
  }
  const { source, id, matchId } = useParams()
  const location = useLocation()
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [directStream, setDirectStream] = useState<{ url: string; name: string } | null>(null)
  const { error: toastError } = useToast()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isStretched, setIsStretched] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  // Toggle: when true prefer server-provided `healthScore` when available
  const [preferExplicitHealthOnly, setPreferExplicitHealthOnly] = useState(true)

  const computeHealthScore = (s: Stream) => {
    const explicit = s.healthScore
    if (typeof explicit === 'number') return explicit
    if (preferExplicitHealthOnly) return 0
    const hdScore = s.hd ? 100 : 50
    const thumbScore = s.thumbnail ? 10 : 0
    const streamNoScore = typeof s.streamNo === 'number' ? Math.max(0, 10 - s.streamNo) : 0
    return hdScore + thumbScore + streamNoScore
  }

  // Provider-first grouping memoized near the top so hooks order stays stable
  const groups = useMemo(() => {
    const groupsMap = new Map<string, { label: string; items: { stream: Stream; index: number }[] }>()
    streams.forEach((stream, idx) => {
      const provider = stream.source || 'unknown'
      const key = provider
      const label = provider
      if (!groupsMap.has(key)) groupsMap.set(key, { label, items: [] })
      groupsMap.get(key)!.items.push({ stream, index: idx })
    })

    // Convert to array and sort items within each provider by health score desc
    return Array.from(groupsMap.entries()).map(([key, v]) => {
      const items = v.items.slice().sort((a, b) => computeHealthScore(b.stream) - computeHealthScore(a.stream))
      return { key, label: v.label, items }
    })
  }, [streams])
  // Derive a safe display default for open groups so hooks order stays stable
  const displayOpenGroups = Object.keys(openGroups).length > 0 ? openGroups : groups.length > 0 ? { [groups[0].key]: true } : openGroups
  const lockScreenOrientation = async (orientation: 'landscape' | 'portrait') => {
    if ('orientation' in screen && typeof screen.orientation?.lock === 'function') {
      try {
        await screen.orientation.lock(orientation)
      } catch (error) {
        console.warn('Unable to lock orientation:', error)
      }
    }
  }

  const requestPlayerFullscreen = async () => {
    const container = playerContainerRef.current
    const iframe = iframeRef.current
    // Try making the player container fullscreen first
    if (container && 'requestFullscreen' in container) {
      try {
        await container.requestFullscreen()
        void lockScreenOrientation('landscape')
        return
      } catch (error) {
        console.warn('Container fullscreen request failed:', error)
      }
    }

    // Fallback: try requesting fullscreen on the iframe element itself
    if (iframe && 'requestFullscreen' in iframe) {
      try {
        await iframe.requestFullscreen()
        void lockScreenOrientation('landscape')
        return
      } catch (error) {
        console.warn('Iframe fullscreen request failed:', error)
      }
    }

    // Last resort: if the iframe exposes a postMessage API, ask it to enter fullscreen
    try {
      iframe?.contentWindow?.postMessage({ type: 'request-fullscreen' }, '*')
      // orientation lock may be handled by the embedded player when it enters fullscreen
    } catch (error) {
      console.warn('Unable to postMessage to iframe for fullscreen:', error)
    }
  }

  const exitPlayerFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      if ('orientation' in screen && typeof screen.orientation?.unlock === 'function') {
        void screen.orientation.unlock()
      }
    }
  }

  const syncFullscreenState = () => {
    const fullscreenElement = document.fullscreenElement
    // Only consider the player container itself as fullscreen. If an embedded iframe
    // enters fullscreen on its own, we don't want the outer container to switch
    // into the fullscreen layout (prevents uncontrolled layout stretching).
    setIsFullscreen(fullscreenElement === playerContainerRef.current)
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitPlayerFullscreen()
    } else {
      requestPlayerFullscreen()
    }
  }
  
  useEffect(() => {
    document.addEventListener('fullscreenchange', syncFullscreenState)
    syncFullscreenState()

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  const state = location.state as { streamUrl?: string; channelName?: string } | null
  const directStreamUrl = state?.streamUrl
  const directStreamChannelName = state?.channelName

  useEffect(() => {
    // Check if this is a direct IPTV stream from Live TV
    if (directStreamUrl) {
      setDirectStream({
        url: directStreamUrl,
        name: directStreamChannelName || 'Live Channel',
      })
      setStreams([])
      setSelectedStream(0)
      setFetchError(null)
      setLoading(false)
      return
    }

    setDirectStream(null)

    // Otherwise, fetch from sports API
    async function fetchStreams() {
      // Handle both route patterns: /sports/:source/:id and /sports/:matchId
      const streamSource = source || 'alpha' // default source if not provided
      const streamId = id || matchId

      if (!streamId) {
        setStreams([])
        setSelectedStream(0)
        setFetchError('No valid stream ID found for this match.')
        setLoading(false)
        return
      }

      try {
        setFetchError(null)
        setLoading(true)
        const data = await sportsApi.getStreams(streamSource, streamId)
        const normalizedStreams = Array.isArray(data) ? data : []
        setStreams(normalizedStreams)

        // Auto-select best stream by health score when available
        if (normalizedStreams.length > 0) {
          let bestIdx = 0
          let bestScore = computeHealthScore(normalizedStreams[0])
          normalizedStreams.forEach((st, i) => {
            const score = computeHealthScore(st)
            if (score > bestScore) {
              bestScore = score
              bestIdx = i
            }
          })
          setSelectedStream(bestIdx)
        } else {
          setSelectedStream(0)
        }

        if (normalizedStreams.length === 0) {
          setFetchError('No streams available for this match right now.')
        }
        setLoading(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to fetch streams.'
        console.error('Error fetching streams:', error)
        setStreams([])
        setSelectedStream(0)
        setFetchError('Unable to load match streams. Please try again.')
        toastError(`Stream load failed: ${message}`)
        setLoading(false)
      }
    }

    fetchStreams()

    // Cleanup iframe on unmount
    return () => {
      if (import.meta.env.DEV) {
        console.log('[SportsPlayer] Cleaning up iframe')
      }
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank'
      }
    }
  }, [source, id, matchId, directStreamUrl, directStreamChannelName, retryCount, toastError])





  if (loading) {
    return (
      <div className="flex items-center justify-center bg-deepBlack py-8">
        <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center bg-deepBlack px-4 py-8">
        <div className="max-w-xl w-full glass rounded-3xl border border-primary/20 bg-primary/10 p-6 text-center">
          <p className="text-sm font-semibold text-primary">Unable to load live streams</p>
          <p className="mt-3 text-gray-200">{fetchError}</p>
          <button
            type="button"
            onClick={() => {
              setFetchError(null)
              setLoading(true)
              setRetryCount((prev) => prev + 1)
            }}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!directStream && streams.length === 0) {
    return (
      <div className="flex items-center justify-center bg-deepBlack py-8">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No streams available</p>
        </div>
      </div>
    )
  }

  const currentStream = streams[selectedStream]
  

  

  return (
    <div className="bg-deepBlack px-2 py-2 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5 backdrop-blur-sm sm:px-4 sm:py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => window.history.back()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-white/10 sm:h-10 sm:w-10"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-2xl">
                  {directStream ? directStream.name : 'Live Match'}
                </h1>
                <p className="mt-0.5 text-xs text-gray-400 sm:mt-1 sm:text-sm">
                  {directStream ? 'Live TV Channel' : `Stream ${selectedStream + 1} of ${streams.length}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Player Container */}
        <div
          ref={playerContainerRef}
          className={`overflow-hidden border border-white/10 bg-black/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition-all duration-300 w-full rounded-[20px] sm:rounded-[24px]`}
        >
          <div className="relative w-full overflow-hidden bg-black transition-all duration-300 aspect-video">
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs">
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500 sm:h-2.5 sm:w-2.5" />
                Live
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsStretched((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/70 p-2 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
                  aria-label={isStretched ? 'Fit video' : 'Stretch video'}
                >
                  {isStretched ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isStretched ? 'Fit' : 'Stretch'}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/70 p-2 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden">
              <iframe
                ref={iframeRef}
                src={directStream ? directStream.url : currentStream.embedUrl}
                className="absolute inset-0 h-full w-full"
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100%'
                }}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
              />
            </div>
          </div>
        </div>

        {/* Creative grouping prototype: quick picks + smart groups */}
        {!directStream && streams.length > 0 && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-2.5 shadow-sm sm:p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Quick Picks</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(() => {
                const recommended = streams
                  .slice()
                  .sort((a, b) => Number(b.hd) - Number(a.hd) || (a.streamNo || 0) - (b.streamNo || 0))
                  .slice(0, 5)
                return recommended.map((s, i) => (
                  <button
                    key={`quick-${s.id}-${i}`}
                    onClick={() => setSelectedStream(streams.indexOf(s))}
                    className={`inline-flex items-center gap-3 min-w-[160px] rounded-xl border px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                      streams.indexOf(s) === selectedStream
                        ? 'border-primary/70 bg-primary text-white'
                        : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-6 bg-gray-800 rounded-sm flex items-center justify-center text-xs text-gray-200">{s.hd ? 'HD' : 'SD'}</div>
                    <div className="truncate">{s.language || `Stream ${s.streamNo}`}</div>
                  </button>
                ))
              })()}
            </div>

            <h3 className="mt-3 mb-2 text-sm font-semibold text-white">Smart Groups</h3>
            <div className="space-y-2">
              {/* Trending (uses top recommended) */}
              <div className="border border-white/6 rounded-lg">
                <div className="w-full flex items-center justify-between px-3 py-2 bg-black/10 rounded-t-lg">
                  <div>
                    <div className="text-sm font-semibold text-white">Trending Now</div>
                    <div className="text-xs text-gray-400">Top quality feeds</div>
                  </div>
                  <div className="text-gray-300">▾</div>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {streams
                      .slice()
                      .sort((a, b) => Number(b.hd) - Number(a.hd))
                      .slice(0, 6)
                        .map((stream, idx) => (
                        <button
                          key={`tr-${stream.id}-${idx}`}
                          onClick={() => setSelectedStream(streams.indexOf(stream))}
                          className={`rounded-xl border px-2.5 py-2 text-left text-sm font-medium transition-all duration-200 ${
                            selectedStream === streams.indexOf(stream)
                              ? 'border-primary/70 bg-primary text-white'
                              : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Radio className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{stream.language || `Stream ${stream.streamNo}`}{stream.hd ? ' · HD' : ''}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Language-first group (pick most common language) */}
              {(() => {
                const byLang = new Map<string, Stream[]>()
                streams.forEach((s) => {
                  const L = s.language || 'Default'
                  if (!byLang.has(L)) byLang.set(L, [])
                  byLang.get(L)!.push(s)
                })
                const topLang = Array.from(byLang.entries()).sort((a, b) => b[1].length - a[1].length)[0]
                if (!topLang) return null
                const [lang, list] = topLang
                return (
                  <div key={`lang-${lang}`} className="border border-white/6 rounded-lg">
                    <div className="w-full flex items-center justify-between px-3 py-2 bg-black/10 rounded-t-lg">
                      <div>
                        <div className="text-sm font-semibold text-white">Language: {lang}</div>
                        <div className="text-xs text-gray-400">{list.length} streams</div>
                      </div>
                      <div className="text-gray-300">▾</div>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {list.slice(0, 6).map((stream, idx) => (
                          <button
                            key={`lang-${lang}-${stream.id}-${idx}`}
                            onClick={() => setSelectedStream(streams.indexOf(stream))}
                            className={`rounded-xl border px-2.5 py-2 text-left text-sm font-medium transition-all duration-200 ${
                              selectedStream === streams.indexOf(stream)
                                ? 'border-primary/70 bg-primary text-white'
                                : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Radio className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{stream.language || `Stream ${stream.streamNo}`}{stream.hd && ' HD'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
        {!directStream && streams.length > 1 && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-2.5 shadow-sm sm:p-4">
            <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-300 sm:mb-3 sm:text-sm">Select Stream</h3>

            {/* Group streams client-side by source + language + quality */}
            {/* compute groups from streams */}
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.key} className="border border-white/6 rounded-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => {
                        const currently = prev[g.key] !== undefined ? prev[g.key] : !!displayOpenGroups[g.key]
                        return { ...prev, [g.key]: !currently }
                      })
                    }
                    className="w-full flex items-center justify-between px-3 py-2 bg-black/10 hover:bg-white/5 rounded-t-lg"
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white truncate">{g.label}</div>
                      <div className="text-xs text-gray-400">{g.items.length} streams</div>
                    </div>
                    <div className="text-gray-300">{displayOpenGroups[g.key] ? '▾' : '▸'}</div>
                  </button>

                  {displayOpenGroups[g.key] && (
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {g.items.map(({ stream, index }) => (
                          <button
                            key={`${stream.id}-${stream.streamNo}-${index}`}
                            onClick={() => setSelectedStream(index)}
                            className={`rounded-xl border px-2.5 py-2 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] sm:px-3 sm:py-2.5 ${
                              selectedStream === index
                                ? 'border-primary/70 bg-primary text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]'
                                : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Radio className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">
                                {stream.language || `Stream ${stream.streamNo}`}
                                {stream.hd && ' HD'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stream Info - only show for sports API streams */}
        {!directStream && (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-2.5 shadow-sm sm:p-4">
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-300 sm:mb-3 sm:text-sm">Stream Information</h2>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400">Configure selection heuristic</div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={preferExplicitHealthOnly}
                  onChange={(e) => setPreferExplicitHealthOnly(e.target.checked)}
                  className="h-4 w-4 rounded border bg-black/20"
                />
                <span>Prefer server healthScore</span>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Stream Number</p>
                <p className="mt-1 font-semibold text-white">{currentStream.streamNo}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Language</p>
                <p className="mt-1 font-semibold text-white">{currentStream.language || 'Default'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Quality</p>
                <p className="mt-1 font-semibold text-white">{currentStream.hd ? 'HD' : 'SD'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Source</p>
                <p className="mt-1 font-semibold text-white">{currentStream.source}</p>
              </div>
            </div>
            {/* Auto-select indicator */}
            {currentStream && (
              <div className="mt-3 flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 border border-white/8 text-xs text-gray-300">
                  <span className="font-medium text-white">Auto-selected</span>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                    {currentStream.hd ? 'HD' : 'SD'}
                  </span>
                  <span className="text-xs text-gray-400">Score: {computeHealthScore(currentStream)}</span>
                  {currentStream.healthScore !== undefined && (
                    <span className="ml-2 text-[11px] text-gray-300">(server)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
