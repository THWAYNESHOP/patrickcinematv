import axios from 'axios'

const CDN_LIVE_TV_BASE = 'https://api.cdnlivetv.tv/api/v1'
const CDN_LIVE_TV_USER = 'cdnlivetv'
const CDN_LIVE_TV_PLAN = 'free'

export interface CDNChannel {
  name: string
  code: string
  url: string
  image: string
  status: string
  viewers: number
}

export interface CDNChannelsResponse {
  total_channels: number
  channels: CDNChannel[]
}

export interface CDNEventChannel {
  channel_name: string
  channel_code: string
  viewers: string
  url: string
  image: string
}

export interface CDNSportEvent {
  gameID: string
  homeTeam: string
  awayTeam: string
  homeTeamIMG: string
  awayTeamIMG: string
  time: string
  tournament: string
  country: string
  countryIMG: string
  status: string
  start: string
  end: string
  channels: CDNEventChannel[]
}

export interface CDNSportsResponse {
  [key: string]: {
    Soccer?: CDNSportEvent[]
    NBA?: CDNSportEvent[]
    NHL?: CDNSportEvent[]
    NFL?: CDNSportEvent[]
    total_events?: number
    total_events_soccer?: number
    total_events_NFL?: number
    total_events_nba?: number
    total_events_nhl?: number
  }
}

export const cdnLiveTvApi = {
  async getChannels(): Promise<CDNChannel[]> {
    try {
      const response = await axios.get<CDNChannelsResponse>(
        `${CDN_LIVE_TV_BASE}/channels/?user=${CDN_LIVE_TV_USER}&plan=${CDN_LIVE_TV_PLAN}`,
        { timeout: 10000 }
      )
      return response.data.channels || []
    } catch (error) {
      console.error('Error fetching CDN Live TV channels:', error)
      return []
    }
  },

  async getAllSports(): Promise<CDNSportsResponse> {
    try {
      const response = await axios.get<CDNSportsResponse>(
        `${CDN_LIVE_TV_BASE}/events/sports/?user=${CDN_LIVE_TV_USER}&plan=${CDN_LIVE_TV_PLAN}`,
        { timeout: 10000 }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching CDN Live TV sports:', error)
      return {}
    }
  },

  async getSoccerEvents(): Promise<CDNSportEvent[]> {
    try {
      const response = await axios.get<CDNSportsResponse>(
        `${CDN_LIVE_TV_BASE}/events/sports/soccer/?user=${CDN_LIVE_TV_USER}&plan=${CDN_LIVE_TV_PLAN}`,
        { timeout: 10000 }
      )
      return response.data['cdnlivetv.tv']?.Soccer || []
    } catch (error) {
      console.error('Error fetching soccer events:', error)
      return []
    }
  },

  async getNBAEvents(): Promise<CDNSportEvent[]> {
    try {
      const response = await axios.get<CDNSportsResponse>(
        `${CDN_LIVE_TV_BASE}/events/sports/nba/?user=${CDN_LIVE_TV_USER}&plan=${CDN_LIVE_TV_PLAN}`,
        { timeout: 10000 }
      )
      return response.data['cdnlivetv.tv']?.NBA || []
    } catch (error) {
      console.error('Error fetching NBA events:', error)
      return []
    }
  },

  async getNHLEvents(): Promise<CDNSportEvent[]> {
    try {
      const response = await axios.get<CDNSportsResponse>(
        `${CDN_LIVE_TV_BASE}/events/sports/nhl/?user=${CDN_LIVE_TV_USER}&plan=${CDN_LIVE_TV_PLAN}`,
        { timeout: 10000 }
      )
      return response.data['cdnlivetv.tv']?.NHL || []
    } catch (error) {
      console.error('Error fetching NHL events:', error)
      return []
    }
  },

  async getNFLEvents(): Promise<CDNSportEvent[]> {
    try {
      const response = await axios.get<CDNSportsResponse>(
        `${CDN_LIVE_TV_BASE}/events/sports/nfl/?user=${CDN_LIVE_TV_USER}&plan=${CDN_LIVE_TV_PLAN}`,
        { timeout: 10000 }
      )
      return response.data['cdnlivetv.tv']?.NFL || []
    } catch (error) {
      console.error('Error fetching NFL events:', error)
      return []
    }
  },

  // Helper to group channels by country
  groupChannelsByCountry(channels: CDNChannel[]): Record<string, CDNChannel[]> {
    const grouped: Record<string, CDNChannel[]> = {}
    
    channels.forEach(channel => {
      const country = this.getCountryName(channel.code)
      if (!grouped[country]) {
        grouped[country] = []
      }
      grouped[country].push(channel)
    })
    
    return grouped
  },

  // Helper to get country name from code
  getCountryName(code: string): string {
    const countryMap: Record<string, string> = {
      'us': 'United States',
      'gb': 'United Kingdom',
      'fr': 'France',
      'de': 'Germany',
      'au': 'Australia',
      'pt': 'Portugal',
      'hr': 'Croatia',
      'pl': 'Poland',
      'ca': 'Canada',
      'es': 'Spain',
      'it': 'Italy',
      'nl': 'Netherlands',
      'be': 'Belgium',
      'at': 'Austria',
      'ch': 'Switzerland',
      'se': 'Sweden',
      'no': 'Norway',
      'dk': 'Denmark',
      'fi': 'Finland',
      'gr': 'Greece',
      'tr': 'Turkey',
      'ru': 'Russia',
      'ua': 'Ukraine',
      'br': 'Brazil',
      'ar': 'Argentina',
      'mx': 'Mexico',
      'in': 'India',
      'jp': 'Japan',
      'kr': 'South Korea',
      'cn': 'China',
      'sg': 'Singapore',
      'my': 'Malaysia',
      'id': 'Indonesia',
      'th': 'Thailand',
      'vn': 'Vietnam',
      'ph': 'Philippines',
      'za': 'South Africa',
      'eg': 'Egypt',
      'ng': 'Nigeria',
      'ke': 'Kenya',
    }
    
    return countryMap[code.toLowerCase()] || code.toUpperCase()
  },

  // Helper to get country flag emoji
  getCountryFlag(code: string): string {
    const flagMap: Record<string, string> = {
      'us': '🇺🇸',
      'gb': '🇬🇧',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'au': '🇦🇺',
      'pt': '🇵🇹',
      'hr': '🇭🇷',
      'pl': '🇵🇱',
      'ca': '🇨🇦',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'nl': '🇳🇱',
      'be': '🇧🇪',
      'at': '🇦🇹',
      'ch': '🇨🇭',
      'se': '🇸🇪',
      'no': '🇳🇴',
      'dk': '🇩🇰',
      'fi': '🇫🇮',
      'gr': '🇬🇷',
      'tr': '🇹🇷',
      'ru': '🇷🇺',
      'ua': '🇺🇦',
      'br': '🇧🇷',
      'ar': '🇦🇷',
      'mx': '🇲🇽',
      'in': '🇮🇳',
      'jp': '🇯🇵',
      'kr': '🇰🇷',
      'cn': '🇨🇳',
      'sg': '🇸🇬',
      'my': '🇲🇾',
      'id': '🇮🇩',
      'th': '🇹🇭',
      'vn': '🇻🇳',
      'ph': '🇵🇭',
      'za': '🇿🇦',
      'eg': '🇪🇬',
      'ng': '🇳🇬',
      'ke': '🇰🇪',
    }
    
    return flagMap[code.toLowerCase()] || '🌍'
  },
}
