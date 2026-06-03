import { Search, X } from 'lucide-react'
import { ChannelCategory, LiveTvChannel } from '../../data/liveTvChannels'

interface LiveTvBrowserProps {
  channels: LiveTvChannel[]
  selectedChannelId: string | null
  onSelectChannel: (channel: LiveTvChannel) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  selectedCategory: ChannelCategory | 'all'
  onSelectCategory: (category: ChannelCategory | 'all') => void
  channelCategories: ChannelCategory[]
}

export default function LiveTvBrowser({
  channels,
  selectedChannelId,
  onSelectChannel,
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onSelectCategory,
  channelCategories,
}: LiveTvBrowserProps) {
  return (
    <aside className="glass-strong rounded-xl overflow-hidden border border-white/10">
      <div className="p-4 sm:p-5 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-darkSurface border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => onSelectCategory('all')}
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
              onClick={() => onSelectCategory(category)}
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

      <div className="max-h-[70vh] lg:max-h-[calc(100vh-14rem)] overflow-y-auto">
        <div className="p-3 sm:p-4 space-y-3">
          {channels.map((channel) => {
            const isActive = channel.id === selectedChannelId
            const badgeText = channel.isHD ? 'HD' : 'SD'

            return (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full text-left rounded-xl border transition-all duration-200 p-3 flex items-center gap-3 ${
                  isActive
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-14 h-14 rounded-lg bg-darkSurface border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {channel.logo ? (
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary/80">
                      {channel.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{channel.name}</p>
                      <p className="text-xs text-gray-400 truncate">{channel.category}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold tracking-wide px-2 py-1 rounded-full ${
                        channel.isHD ? 'bg-accent text-deepBlack' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {badgeText}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span className="text-red-400 font-bold">LIVE</span>
                    <span className="text-gray-500">Ready to play</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
