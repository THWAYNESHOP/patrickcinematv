import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Tv, Trophy, Globe, Users, Zap, Star, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import { cdnLiveTvApi, CDNChannel, CDNSportEvent } from '../api/cdnlivetv';
import { iptvChannels } from '../data/iptvChannels';

// Define categories
const CATEGORIES = [
  { id: 'all', name: 'All', icon: Globe },
  { id: 'sports', name: 'Sports', icon: Trophy },
  { id: 'movies', name: 'Movies', icon: Tv },
  { id: 'news', name: 'News', icon: TrendingUp },
  { id: 'kids', name: 'Kids', icon: Star },
  { id: 'music', name: 'Music', icon: Zap },
  { id: 'international', name: 'International', icon: Globe },
  { id: 'recent', name: 'Recently Added', icon: Clock },
];

// Category metadata
const CATEGORY_INFO: Record<string, { description: string }> = {
  sports: { description: 'Live sports from around the world - football, basketball, cricket and more.' },
  movies: { description: '24/7 movie channels featuring the latest blockbusters and timeless classics.' },
  news: { description: 'Breaking news and live coverage from global news networks.' },
  kids: { description: 'Family-friendly channels with cartoons, shows and educational content.' },
  music: { description: 'Live music channels, concerts and music videos 24 hours a day.' },
  international: { description: 'Channels from every corner of the globe in multiple languages.' },
  recent: { description: 'Newly added channels to our streaming lineup.' },
  all: { description: 'Browse our complete collection of live TV channels.' },
};

function ChannelLogo({ channel, size = 'lg' }: { channel: CDNChannel; size?: 'md' | 'lg' | 'xl' }) {
  const [errored, setErrored] = useState(false);
  const dims = size === 'xl' ? 'w-16 h-16' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const rounded = size === 'xl' ? 'rounded-2xl' : 'rounded-xl';
  
  if (channel.image && !errored) {
    return (
      <img
        src={channel.image}
        alt={channel.name}
        onError={() => setErrored(true)}
        className={`${dims} ${rounded} object-contain bg-black/50 p-2`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${dims} ${rounded} flex items-center justify-center bg-gradient-to-br from-primary/40 to-primary/10 text-white font-bold uppercase text-lg`}>
      {channel.name.charAt(0)}
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      LIVE
    </span>
  );
}

function ChannelCard({ channel, onClick, size = 'normal' }: { channel: CDNChannel; onClick: () => void; size?: 'normal' | 'large' }) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 ${
        size === 'large' ? 'p-6' : 'p-4'
      }`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between mb-3">
        <ChannelLogo channel={channel} size={size === 'large' ? 'xl' : 'lg'} />
        <LiveBadge />
      </div>

      <div className="space-y-1">
        <p className={`font-semibold text-white truncate group-hover:text-primary transition-colors ${
          size === 'large' ? 'text-lg' : 'text-sm'
        }`}>
          {channel.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{cdnLiveTvApi.getCountryFlag(channel.code)}</span>
          <span className="truncate">{cdnLiveTvApi.getCountryName(channel.code)}</span>
        </div>
        {channel.viewers > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
            <Users className="w-3 h-3" />
            <span>{channel.viewers.toLocaleString()} watching</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
          <Play className="w-6 h-6 text-white ml-1" />
        </div>
      </div>
    </button>
  );
}

function CategorySection({
  title,
  description,
  channels,
  onChannelClick,
  initialCount = 6,
}: {
  title: string;
  description: string;
  channels: CDNChannel[];
  onChannelClick: (channel: CDNChannel) => void;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleChannels = expanded ? channels : channels.slice(0, initialCount);

  if (channels.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
        {channels.length > initialCount && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            {expanded ? 'Show Less' : 'View All'}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {visibleChannels.map((channel, idx) => (
          <ChannelCard
            key={`${channel.name}-${idx}`}
            channel={channel}
            onClick={() => onChannelClick(channel)}
          />
        ))}
      </div>
    </section>
  );
}

function TrendingCarousel({ channels, onChannelClick }: { channels: CDNChannel[]; onChannelClick: (channel: CDNChannel) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (channels.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-white">Trending Live</h2>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
        >
          {channels.map((channel, idx) => (
            <div key={`trending-${channel.name}-${idx}`} className="min-w-[300px] snap-start">
              <ChannelCard channel={channel} onClick={() => onChannelClick(channel)} size="large" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function IPTVPlayer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<CDNChannel[]>([]);
  const [sportsEvents, setSportsEvents] = useState<CDNSportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'channels' | 'sports'>('channels');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [channelsData, sportsData] = await Promise.all([
          cdnLiveTvApi.getChannels(),
          cdnLiveTvApi.getAllSports(),
        ]);

        let processedChannels: CDNChannel[] = [];
        
        if (channelsData.length === 0) {
          iptvChannels.forEach(category => {
            category.channels.forEach(channel => {
              processedChannels.push({
                name: channel.name,
                code: channel.region.substring(0, 2).toLowerCase(),
                url: channel.url,
                image: channel.logo || '',
                status: 'online',
                viewers: Math.floor(Math.random() * 1000),
              });
            });
          });
        } else {
          processedChannels = channelsData;
        }

        setChannels(processedChannels);

        const allEvents: CDNSportEvent[] = [];
        const sportsDataKey = Object.keys(sportsData)[0];
        if (sportsDataKey && sportsData[sportsDataKey]) {
          const sports = sportsData[sportsDataKey];
          if (sports.Soccer) allEvents.push(...sports.Soccer);
          if (sports.NBA) allEvents.push(...sports.NBA);
          if (sports.NHL) allEvents.push(...sports.NHL);
          if (sports.NFL) allEvents.push(...sports.NFL);
        }
        setSportsEvents(allEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
        const fallbackChannels: CDNChannel[] = [];
        iptvChannels.forEach(category => {
          category.channels.forEach(channel => {
            fallbackChannels.push({
              name: channel.name,
              code: channel.region.substring(0, 2).toLowerCase(),
              url: channel.url,
              image: channel.logo || '',
              status: 'online',
              viewers: Math.floor(Math.random() * 1000),
            });
          });
        });
        setChannels(fallbackChannels);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Categorize channels
  const categorizedChannels = useMemo(() => {
    const categories: Record<string, CDNChannel[]> = {
      sports: [],
      movies: [],
      news: [],
      kids: [],
      music: [],
      international: [],
      recent: [],
    };

    const sportsKeywords = ['sport', 'espn', 'fox', 'sky', 'bein', 'nba', 'nfl', 'nhl', 'mlb', 'football', 'cricket', 'tennis', 'basketball', 'racing'];
    const movieKeywords = ['movie', 'film', 'cinema', 'hbo', 'star', 'showtime'];
    const newsKeywords = ['news', 'cnn', 'bbc', 'fox news', 'msnbc', 'al jazeera'];
    const kidsKeywords = ['kids', 'cartoon', 'disney', 'nickelodeon', 'nick jr', 'cnn'];
    const musicKeywords = ['music', 'mtv', 'vh1', 'spotify', 'apple music'];

    channels.forEach(channel => {
      const name = channel.name.toLowerCase();
      let categorized = false;

      if (sportsKeywords.some(k => name.includes(k))) {
        categories.sports.push(channel);
        categorized = true;
      }
      if (movieKeywords.some(k => name.includes(k))) {
        categories.movies.push(channel);
        categorized = true;
      }
      if (newsKeywords.some(k => name.includes(k))) {
        categories.news.push(channel);
        categorized = true;
      }
      if (kidsKeywords.some(k => name.includes(k))) {
        categories.kids.push(channel);
        categorized = true;
      }
      if (musicKeywords.some(k => name.includes(k))) {
        categories.music.push(channel);
        categorized = true;
      }

      if (!categorized) {
        categories.international.push(channel);
      }

      categories.recent.push(channel);
    });

    return categories;
  }, [channels]);

  const trendingChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.viewers - a.viewers).slice(0, 10);
  }, [channels]);

  const visibleChannels = useMemo(() => {
    const filtered = channels.filter((ch) => 
      !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (activeCategory === 'all') return filtered;
    
    return categorizedChannels[activeCategory] || [];
  }, [channels, activeCategory, searchQuery, categorizedChannels]);

  const handleChannelClick = (channel: CDNChannel) => {
    navigate(`/sports/cdn/${channel.name}`, {
      state: { streamUrl: channel.url, channelName: channel.name },
    });
  };

  const handleSportClick = (event: CDNSportEvent, channelUrl: string) => {
    navigate(`/sports/cdn/${event.gameID}`, {
      state: { streamUrl: channelUrl, channelName: `${event.homeTeam} vs ${event.awayTeam}` },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deepBlack via-darkSurface to-deepBlack pt-20 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deepBlack via-darkSurface to-deepBlack pt-16 md:pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-gray-200 uppercase">Streaming now</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            <span className="text-primary">Live</span>
            <span className="text-white">streams</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-sm sm:text-base mb-8">
            Premium live TV and sports from around the world. Thousands of channels in one place.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels, teams or tournaments..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl focus:border-primary focus:outline-none text-white placeholder-gray-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-20 bg-deepBlack/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Tabs */}
          <div className="flex gap-2 py-4 border-b border-white/5">
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                activeTab === 'channels'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Tv className="w-4 h-4" />
              Live Channels
            </button>
            <button
              onClick={() => setActiveTab('sports')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                activeTab === 'sports'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Sports Events
            </button>
          </div>

          {/* Category Filters */}
          {activeTab === 'channels' && !searchQuery && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = cat.id === 'all' ? channels.length : (categorizedChannels[cat.id]?.length || 0);
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                    {count > 0 && (
                      <span className="text-xs opacity-70">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-12">
        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <>
            {!searchQuery && (
              <>
                {/* Trending Live Carousel */}
                <TrendingCarousel channels={trendingChannels} onChannelClick={handleChannelClick} />

                {/* Category Sections */}
                {activeCategory === 'all' ? (
                  <>
                    {Object.entries(categorizedChannels).map(([key, chans]) => {
                      if (key === 'recent' || chans.length === 0) return null;
                      const catInfo = CATEGORY_INFO[key];
                      const catName = CATEGORIES.find(c => c.id === key)?.name || key;
                      
                      return (
                        <CategorySection
                          key={key}
                          title={catName}
                          description={catInfo?.description || ''}
                          channels={chans}
                          onChannelClick={handleChannelClick}
                        />
                      );
                    })}
                  </>
                ) : (
                  <CategorySection
                    title={CATEGORIES.find(c => c.id === activeCategory)?.name || activeCategory}
                    description={CATEGORY_INFO[activeCategory]?.description || ''}
                    channels={visibleChannels}
                    onChannelClick={handleChannelClick}
                    initialCount={14}
                  />
                )}
              </>
            )}

            {/* Search Results */}
            {searchQuery && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{searchQuery}"
                </h2>
                {visibleChannels.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-400 text-lg">No channels found matching "{searchQuery}".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                    {visibleChannels.map((channel, idx) => (
                      <ChannelCard
                        key={`search-${channel.name}-${idx}`}
                        channel={channel}
                        onClick={() => handleChannelClick(channel)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Sports Tab */}
        {activeTab === 'sports' && (
          <div className="space-y-4">
            {sportsEvents.map((event) => (
              <div key={event.gameID} className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-primary/30 transition-all">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        event.status === 'live' ? 'bg-red-500/20 text-red-400' :
                        event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400 truncate">{event.tournament}</span>
                    </div>
                    <span className="text-sm text-gray-400 shrink-0">{event.time}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <img src={event.homeTeamIMG} alt={event.homeTeam} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-black/30" />
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{event.homeTeam}</p>
                        <p className="text-xs text-gray-400">Home</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-primary shrink-0">vs</div>
                    <div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
                      <div className="text-right min-w-0">
                        <p className="text-white font-semibold text-lg truncate">{event.awayTeam}</p>
                        <p className="text-xs text-gray-400">Away</p>
                      </div>
                      <img src={event.awayTeamIMG} alt={event.awayTeam} className="w-14 h-14 rounded-xl object-cover shrink-0 bg-black/30" />
                    </div>
                  </div>

                  {event.channels && event.channels.length > 0 && (
                    <div className="border-t border-white/10 pt-5">
                      <p className="text-sm text-gray-400 mb-3 font-medium">Available Channels:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.channels.map((channel, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSportClick(event, channel.url)}
                            className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-primary/20 rounded-xl transition-all group"
                          >
                            <img src={channel.image} alt={channel.channel_name} className="w-8 h-8 rounded-lg bg-black/30" />
                            <span className="text-sm text-white group-hover:text-primary transition-colors font-medium">
                              {channel.channel_name}
                            </span>
                            {parseInt(channel.viewers) > 0 && (
                              <span className="text-xs text-gray-400">({channel.viewers})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sportsEvents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No sports events found{searchQuery && ` matching "${searchQuery}"`}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
