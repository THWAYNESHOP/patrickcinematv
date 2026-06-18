import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Play, Tv, Radio } from 'lucide-react';
import { iptvChannels, IPTVChannel } from '../data/iptvChannels';

export default function IPTVPlayer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const filteredCategories = iptvCategories.filter((category) => {
    if (!searchQuery) return true;
    return category.channels.some((channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleChannelClick = (channel: IPTVChannel) => {
    navigate(`/sports-player/${channel.id}`, {
      state: { streamUrl: channel.url, channelName: channel.name },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkBackground via-darkSurface to-darkBackground pt-20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">Live TV</h1>
            <p className="text-gray-400">Watch your favorite sports channels live</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:border-primary focus:outline-none text-white placeholder-gray-400 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3">
              <Tv className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {iptvCategories.reduce((acc, cat) => acc + cat.channels.length, 0)}
                </p>
                <p className="text-gray-400 text-sm">Total Channels</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">{iptvCategories.length}</p>
                <p className="text-gray-400 text-sm">Categories</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">HD</p>
                <p className="text-gray-400 text-sm">Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name} className="glass rounded-lg overflow-hidden neon-border">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xl font-semibold text-white">{category.name}</span>
                  <span className="text-sm text-gray-400">({category.channels.length} channels)</span>
                </div>
                {expandedCategories.has(category.name) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedCategories.has(category.name) && (
                <div className="border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                    {category.channels
                      .filter((channel) =>
                        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => handleChannelClick(channel)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                            <Play className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white font-medium group-hover:text-primary transition-colors">
                              {channel.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {channel.region} • {channel.language}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No channels found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to get all channels flat
const iptvCategories = iptvChannels;

