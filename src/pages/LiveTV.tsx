import { useMemo, useRef, useState } from 'react'
import { Link2, Loader2, Search, Upload, X } from 'lucide-react'
import { liveTvChannels, channelCategories, LiveTvChannel, ChannelCategory } from '../data/liveTvChannels'
import ChannelCard from '../components/LiveTV/ChannelCard'
import LiveTvPlayer from '../components/LiveTV/LiveTvPlayer'
import { parseM3UPlaylist } from '../components/LiveTV/m3u'

type ImportState = 'idle' | 'loading' | 'ready' | 'error'

export default function LiveTV() {
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel | null>(null)
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

  const groupedChannels = channelCategories.reduce((acc, category) => {
    const categoryChannels = filteredChannels.filter((channel) => channel.category === category)
    if (categoryChannels.length > 0) {
      acc[category] = categoryChannels
    }
    return acc
  }, {} as Record<ChannelCategory, LiveTvChannel[]>)

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
  }

  if (selectedChannel) {
    return <LiveTvPlayer channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8 bg-deepBlack">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Live TV</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Watch live sports channels from around the world
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

        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-darkSurface border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'glass hover:bg-white/15 text-gray-300'
              }`}
            >
              All Channels
            </button>
            {channelCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'glass hover:bg-white/15 text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredChannels.length === 0 ? (
          <div className="glass rounded-lg p-12 text-center border border-white/5">
            <p className="text-gray-400 text-lg">No channels found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="mt-4 bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : selectedCategory === 'all' ? (
          <div className="space-y-8">
            {channelCategories.map((category) => {
              const categoryChannels = groupedChannels[category]
              if (!categoryChannels?.length) return null

              return (
                <section key={category}>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
                    {category}
                    <span className="text-gray-400 text-base font-normal ml-2">
                      ({categoryChannels.length})
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {categoryChannels.map((channel) => (
                      <ChannelCard key={channel.id} channel={channel} onWatch={setSelectedChannel} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedChannels).map(([category, channels]) => (
              <section key={category}>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
                  {category}
                  <span className="text-gray-400 text-base font-normal ml-2">
                    ({channels.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {channels.map((channel) => (
                    <ChannelCard key={channel.id} channel={channel} onWatch={setSelectedChannel} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
