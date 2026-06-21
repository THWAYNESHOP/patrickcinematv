import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Tv, Radio, Trophy, Globe, Users, Zap } from 'lucide-react';
import { cdnLiveTvApi, CDNChannel, CDNSportEvent } from '../api/cdnlivetv';
import { iptvChannels } from '../data/iptvChannels';

function ChannelLogo({ channel, size = 'md' }: { channel: CDNChannel; size?: 'md' | 'lg' }) {
  const [errored, setErrored] = useState(false);
  const dims = size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  if (channel.image && !errored) {
    return (
      <img
        src={channel.image}
        alt={channel.name}
        onError={() => setErrored(true)}
        className={`${dims} rounded-xl object-contain bg-black/40 p-1`}
      />
    );
  }
  return (
    <div className={`${dims} rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/5 text-white font-bold uppercase`}>
      {channel.name.charAt(0)}
    </div>
  );
}

export default function IPTVPlayer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
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

        if (channelsData.length === 0) {
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
        setGroupedChannels(cdnLiveTvApi.groupChannelsByCountry(fallbackChannels));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const countries = useMemo(
    () =>
      Object.entries(groupedChannels)
        .map(([country, list]) => ({ country, code: list[0]?.code || '', count: list.length }))
        .sort((a, b) => b.count - a.count),
    [groupedChannels]
  );

  const visibleChannels = useMemo(
    () =>
      channels.filter((ch) => {
        const country = cdnLiveTvApi.getCountryName(ch.code);
        const matchesCountry = selectedCountry === 'all' || country === selectedCountry;
        const matchesSearch =
          !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCountry && matchesSearch;
      }),
    [channels, selectedCountry, searchQuery]
  );

  const featured = useMemo(() => {
    const byViewers = [...visibleChannels].sort((a, b) => b.viewers - a.viewers);
    // When viewer counts are unavailable (all 0), build a varied spotlight by
    // picking the first channel from each country instead of an alphabetical run.
    if (byViewers.every((c) => c.viewers === 0)) {
      const seen = new Set<string>();
      const varied: CDNChannel[] = [];
      for (const ch of visibleChannels) {
        const key = cdnLiveTvApi.getCountryName(ch.code);
        if (!seen.has(key)) {
          seen.add(key);
          varied.push(ch);
        }
        if (varied.length >= 12) break;
      }
      return varied;
    }
    return byViewers.slice(0, 10);
  }, [visibleChannels]);

  const showSpotlight = activeTab === 'channels' && !searchQuery && featured.length > 4;

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

  const stats = [
    { icon: Tv, label: 'Channels', value: channels.length.toString() },
    { icon: Globe, label: 'Countries', value: Object.keys(groupedChannels).length.toString() },
    { icon: Trophy, label: 'Live Events', value: sportsEvents.length.toString() },
    { icon: Zap, label: 'Quality', value: 'HD' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-deepBlack via-darkSurface to-deepBlack pt-16 md:pt-20 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute -top-24 -right-16 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative container mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-gray-200 uppercase">Streaming now</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            <span className="neon-text">Live</span>
            <span className="text-white">streams</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-sm sm:text-base mb-6">
            Thousands of live TV channels and sports events from around the world, in one place.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels, teams or tournaments..."
              className="w-full pl-12 pr-4 py-3 glass rounded-2xl focus:border-primary focus:outline-none text-white placeholder-gray-500"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Icon className="w-6 h-6 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-white leading-none">{s.value}</p>
                    <p className="text-[11px] sm:text-xs text-gray-400 truncate">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
              activeTab === 'channels'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'glass text-gray-300 hover:bg-white/15'
            }`}
          >
            <Tv className="w-4 h-4" />
            Live Channels
          </button>
          <button
            onClick={() => setActiveTab('sports')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
              activeTab === 'sports'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'glass text-gray-300 hover:bg-white/15'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Sports Events
          </button>
        </div>

        {/* Channels */}
        {activeTab === 'channels' && (
          <>
            {/* Country filter chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedCountry('all')}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCountry === 'all'
                    ? 'bg-primary text-white'
                    : 'glass text-gray-300 hover:bg-white/15'
                }`}
              >
                <Globe className="w-4 h-4" />
                All
                <span className="text-xs opacity-70">{channels.length}</span>
              </button>
              {countries.map(({ country, code, count }) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCountry === country
                      ? 'bg-primary text-white'
                      : 'glass text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <span>{cdnLiveTvApi.getCountryFlag(code)}</span>
                  {country}
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              ))}
            </div>

            {/* On Now spotlight */}
            {showSpotlight && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-5 h-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">On Now</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {featured.map((channel) => (
                    <button
                      key={`feat-${channel.name}`}
                      onClick={() => handleChannelClick(channel)}
                      className="group relative shrink-0 w-56 sm:w-64 text-left rounded-2xl overflow-hidden glass card-hover"
                    >
                      <div className="relative h-28 bg-gradient-to-br from-primary/25 via-darkSurface to-deepBlack flex items-center justify-center">
                        <ChannelLogo channel={channel} size="lg" />
                        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-[10px] font-bold text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                        </span>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-9 h-9 text-white" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-white font-semibold truncate group-hover:text-primary transition-colors">
                          {channel.name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          {channel.viewers > 0 ? (
                            <>
                              <Users className="w-3.5 h-3.5" />
                              {channel.viewers.toLocaleString()} watching
                            </>
                          ) : (
                            <>
                              <span>{cdnLiveTvApi.getCountryFlag(channel.code)}</span>
                              {cdnLiveTvApi.getCountryName(channel.code)}
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Channel grid */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {selectedCountry === 'all' ? 'All Channels' : selectedCountry}
              </h2>
              <span className="text-sm text-gray-400">{visibleChannels.length} channels</span>
            </div>

            {visibleChannels.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No channels found{searchQuery && ` matching "${searchQuery}"`}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {visibleChannels.map((channel) => (
                  <button
                    key={channel.name}
                    onClick={() => handleChannelClick(channel)}
                    className="group relative flex flex-col items-center text-center gap-3 p-4 rounded-2xl glass hover:neon-border transition-all"
                  >
                    <span
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        channel.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                    <div className="relative">
                      <ChannelLogo channel={channel} />
                      <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                        {channel.name}
                      </p>
                      {channel.viewers > 0 && (
                        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {channel.viewers.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sports */}
        {activeTab === 'sports' && (
          <div className="space-y-4">
            {filteredSports.map((event) => (
              <div key={event.gameID} className="glass rounded-2xl overflow-hidden neon-border">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        event.status === 'live' ? 'bg-red-500/20 text-red-400' :
                        event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400 truncate">{event.tournament}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 shrink-0">{event.time}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <img src={event.homeTeamIMG} alt={event.homeTeam} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{event.homeTeam}</p>
                        <p className="text-xs text-gray-400">Home</p>
                      </div>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-primary shrink-0">vs</div>
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 justify-end">
                      <div className="text-right min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{event.awayTeam}</p>
                        <p className="text-xs text-gray-400">Away</p>
                      </div>
                      <img src={event.awayTeamIMG} alt={event.awayTeam} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0" />
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
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-primary/20 rounded-lg transition-colors group"
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
