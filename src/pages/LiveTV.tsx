import { useEffect, useMemo, useRef, useState } from 'react'
import { Link2, Loader2, Upload } from 'lucide-react'
import { liveTvChannels, channelCategories, LiveTvChannel, ChannelCategory } from '../data/liveTvChannels'
import LiveTvPlayer from '../components/LiveTV/LiveTvPlayer'
import LiveTvBrowser from '../components/LiveTV/LiveTvBrowser'
import { parseM3UPlaylist } from '../components/LiveTV/m3u'

type ImportState = 'idle' | 'loading' | 'ready' | 'error'

export default function LiveTV() {
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel>(liveTvChannels[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | 'all'>('all')
  const [importedChannels, setImportedChannels] = useState<LiveTvChannel[]>([])
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [importState, setImportState] = useState<ImportState>('idle')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allChannels = useMemo(() => [...importedChannels, ...liveTvChannels], [importedChannels])

  const filteredChannels = allChannels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const currentChannelIsVisible = filteredChannels.some((channel) => channel.id === selectedChannel.id)

  useEffect(() => {
    if (!filteredChannels.length) return
    if (!currentChannelIsVisible) {
      setSelectedChannel(filteredChannels[0])
    }
  }, [filteredChannels, currentChannelIsVisible])

  const handleImportedText = (text: string) => {
    const parsed = parseM3UPlaylist(text)

    if (parsed.length === 0) {
      setImportedChannels([])
      setImportState('error')
      setImportMessage('No playable channels were found in that playlist.')
      return
    }

    const mappedChannels: LiveTvChannel[] = parsed.map((entry, index) => ({
      id: `imported-${index}-${entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: entry.name,
      category: entry.category,
      streamUrl: entry.streamUrl,
      isHD: entry.isHD,
      logo: entry.logo,
    }))

    setImportedChannels(mappedChannels)
    setImportState('ready')
    setImportMessage(`Loaded ${mappedChannels.length} channels from the playlist.`)
    setSelectedCategory('all')
    setSelectedChannel(mappedChannels[0])
  }

  const handleFileImport = async (file: File | null) => {
    if (!file) return

    setImportState('loading')
    setImportMessage('')

    try {
      const text = await file.text()
      handleImportedText(text)
    } catch (error) {
      setImportState('error')
      setImportMessage('Unable to read that playlist file.')
      console.error('M3U file import failed:', error)
    }
  }

  const handleUrlImport = async () => {
    if (!playlistUrl.trim()) return

    setImportState('loading')
    setImportMessage('')

    try {
      const response = await fetch(playlistUrl.trim())

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const text = await response.text()
      handleImportedText(text)
    } catch (error) {
      setImportState('error')
      setImportMessage(
        'Unable to fetch that playlist URL. If it is on another domain, it may be blocked by CORS.'
      )
      console.error('M3U URL import failed:', error)
    }
  }

  const clearImportedPlaylist = () => {
    setImportedChannels([])
    setPlaylistUrl('')
    setImportState('idle')
    setImportMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setSelectedChannel(liveTvChannels[0])
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8 bg-deepBlack">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Live TV</h1>
          <p className="text-sm sm:text-base text-gray-400">
            IPTV-style browsing with channels built into the player layout
          </p>
        </div>

        <div className="mb-6 sm:mb-8 glass rounded-xl border border-white/10 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1 relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Paste a playlist URL"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="w-full bg-darkSurface border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-3 rounded-xl font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import M3U
              </button>

              <button
                onClick={handleUrlImport}
                disabled={!playlistUrl.trim() || importState === 'loading'}
                className="inline-flex items-center justify-center gap-2 glass hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors"
              >
                {importState === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
                Load URL
              </button>

              {importedChannels.length > 0 && (
                <button
                  onClick={clearImportedPlaylist}
                  className="glass hover:bg-white/15 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  Clear import
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".m3u,.m3u8,.txt"
            className="hidden"
            onChange={(e) => handleFileImport(e.target.files?.[0] ?? null)}
          />

          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="text-sm text-gray-400">
              Use a local `.m3u` file or a playlist URL you are allowed to fetch.
            </div>
            {importMessage && (
              <div
                className={`text-sm ${
                  importState === 'error' ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {importMessage}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
          <div className="space-y-6">
            <div className="glass-strong rounded-xl overflow-hidden border border-white/10">
              <LiveTvPlayer channel={selectedChannel} onClose={() => {}} embedded />
            </div>

            <div className="glass rounded-xl border border-white/10 p-4 sm:p-5">
              <h2 className="text-xl font-semibold text-white mb-4">Now Playing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Channel</p>
                  <p className="font-semibold text-white">{selectedChannel.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="font-semibold text-white">{selectedChannel.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Quality</p>
                  <p className="font-semibold text-white">{selectedChannel.isHD ? 'HD' : 'SD'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mode</p>
                  <p className="font-semibold text-white">IPTV Player</p>
                </div>
              </div>
            </div>
          </div>

          <LiveTvBrowser
            channels={filteredChannels}
            selectedChannelId={selectedChannel.id}
            onSelectChannel={setSelectedChannel}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            channelCategories={channelCategories}
          />
        </div>

        {filteredChannels.length === 0 && (
          <div className="mt-6 glass rounded-lg p-12 text-center border border-white/5">
            <p className="text-gray-400 text-lg">No channels found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
