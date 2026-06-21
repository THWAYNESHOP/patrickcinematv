import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronRight, Play, Tv, Radio, Trophy } from 'lucide-react';
import { cdnLiveTvApi, CDNChannel, CDNSportEvent } from '../api/cdnlivetv';
import { iptvChannels } from '../data/iptvChannels';

export default function IPTVPlayer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [channels, setChannels] = useState<CDNChannel[]>([]);
  const [groupedChannels, setGroupedChannels] = useState<Record<string, CDNChannel[]>>({});
  const [sportsEvents, setSportsEvents] = useState<CDNSportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'channels' | 'sports'>('channels');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [channelsData, sportsData] = await Promise.all([
          cdnLiveTvApi.getChannels(),
          cdnLiveTvApi.getAllSports(),
        ]);
        
        // If API returns empty data, use fallback
        if (channelsData.length === 0) {
          console.log('CDN Live TV API returned no channels, using fallback data');
          // Convert fallback IPTV channels to CDN format
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
          setGroupedChannels(cdnLiveTvApi.groupChannelsByCountry(fallbackChannels));
        } else {
          setChannels(channelsData);
          setGroupedChannels(cdnLiveTvApi.groupChannelsByCountry(channelsData));
        }
        
        // Extract all sports events
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
        // Use fallback data on error
        console.log('Error fetching CDN Live TV data, using fallback data');
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
        setGroupedChannels(cdnLiveTvApi.groupChannelsByCountry(fallbackChannels));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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

  const filteredCountries = Object.entries(groupedChannels).filter(([_country, countryChannels]) => {
    if (!searchQuery) return true;
    return countryChannels.some((channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredSports = sportsEvents.filter((event) => {
    if (!searchQuery) return true;
    return (
      event.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tournament.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
      <div className="min-h-screen bg-gradient-to-br from-darkBackground via-darkSurface to-darkBackground pt-20 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkBackground via-darkSurface to-darkBackground pt-20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold neon-text mb-2">Live TV</h1>
            <p className="text-gray-400">Watch your favorite channels and sports events live</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-12 pr-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:border-primary focus:outline-none text-white placeholder-gray-400 w-64"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'channels'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'glass text-gray-300 hover:bg-white/15'
            }`}
          >
            <Tv className="w-5 h-5" />
            Channels
          </button>
          <button
            onClick={() => setActiveTab('sports')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'sports'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'glass text-gray-300 hover:bg-white/15'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Sports Events
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3">
              <Tv className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">{channels.length}</p>
                <p className="text-gray-400 text-sm">Total Channels</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">{Object.keys(groupedChannels).length}</p>
                <p className="text-gray-400 text-sm">Countries</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-lg p-6 neon-border">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-white">{sportsEvents.length}</p>
                <p className="text-gray-400 text-sm">Sports Events</p>
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

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-4">
            {filteredCountries.map(([country, countryChannels]) => (
              <div key={country} className="glass rounded-lg overflow-hidden neon-border">
                <button
                  onClick={() => toggleCategory(country)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cdnLiveTvApi.getCountryFlag(countryChannels[0]?.code || '')}</span>
                    <span className="text-xl font-semibold text-white">{country}</span>
                    <span className="text-sm text-gray-400">({countryChannels.length} channels)</span>
                  </div>
                  {expandedCategories.has(country) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedCategories.has(country) && (
                  <div className="border-t border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                      {countryChannels
                        .filter((channel) =>
                          channel.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((channel) => (
                          <button
                            key={channel.name}
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
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${channel.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                                  {channel.status}
                                </span>
                                {channel.viewers > 0 && (
                                  <span className="text-xs text-gray-400">• {channel.viewers} viewers</span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No channels found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Sports Tab */}
        {activeTab === 'sports' && (
          <div className="space-y-4">
            {filteredSports.map((event) => (
              <div key={event.gameID} className="glass rounded-lg overflow-hidden neon-border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.status === 'live' ? 'bg-red-500/20 text-red-400' :
                        event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400">{event.tournament}</span>
                    </div>
                    <span className="text-sm text-gray-400">{event.time}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img src={event.homeTeamIMG} alt={event.homeTeam} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="text-white font-semibold">{event.homeTeam}</p>
                        <p className="text-xs text-gray-400">Home</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">vs</div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-semibold">{event.awayTeam}</p>
                        <p className="text-xs text-gray-400">Away</p>
                      </div>
                      <img src={event.awayTeamIMG} alt={event.awayTeam} className="w-12 h-12 rounded-lg object-cover" />
                    </div>
                  </div>

                  {event.channels && event.channels.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm text-gray-400 mb-3">Available Channels:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.channels.map((channel, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSportClick(event, channel.url)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-primary/20 rounded-lg transition-colors group"
                          >
                            <img src={channel.image} alt={channel.channel_name} className="w-6 h-6 rounded" />
                            <span className="text-sm text-white group-hover:text-primary transition-colors">
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
            {filteredSports.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No sports events found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

