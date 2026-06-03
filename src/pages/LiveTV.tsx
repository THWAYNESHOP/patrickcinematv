import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { liveTvChannels, channelCategories, LiveTvChannel, ChannelCategory } from '../data/liveTvChannels';
import ChannelCard from '../components/LiveTV/ChannelCard';
import LiveTvPlayer from '../components/LiveTV/LiveTvPlayer';

export default function LiveTV() {
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | 'all'>('all');

  // Filter channels based on search and category
  const filteredChannels = liveTvChannels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group channels by category
  const groupedChannels = channelCategories.reduce((acc, category) => {
    const categoryChannels = filteredChannels.filter((ch) => ch.category === category);
    if (categoryChannels.length > 0) {
      acc[category] = categoryChannels;
    }
    return acc;
  }, {} as Record<ChannelCategory, LiveTvChannel[]>);

  if (selectedChannel) {
    return <LiveTvPlayer channel={selectedChannel} onClose={() => setSelectedChannel(null)} />;
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8 bg-deepBlack">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Live TV</h1>
          <p className="text-sm sm:text-base text-gray-400">
            Watch live sports channels from around the world
          </p>
        </div>

        {/* Search Bar */}
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

        {/* Category Filter */}
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

        {/* Channels Grid */}
        {filteredChannels.length === 0 ? (
          <div className="glass rounded-lg p-12 text-center border border-white/5">
            <p className="text-gray-400 text-lg">No channels found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : selectedCategory === 'all' ? (
          // Show all channels in a single grid when "All" is selected
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredChannels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onWatch={setSelectedChannel} />
            ))}
          </div>
        ) : (
          // Show channels grouped by category
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
  );
}
