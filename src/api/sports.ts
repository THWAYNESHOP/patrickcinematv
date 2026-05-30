import axios from 'axios'

const SPORTS_API_BASE = 'https://streamed.pk/api'

export interface Stream {
  id: string
  streamNo: number
  language: string
  hd: boolean
  embedUrl: string
  source: string
}

export interface MatchSource {
  source: string
  id: string
}

export interface Match {
  id: string
  title: string
  homeTeam: string
  awayTeam: string
  league: string
  status: string
  time: string
  score: string
  sport: string
  poster?: string
  date?: number
  sources?: MatchSource[]
}

interface StreamedMatch {
  id: string
  title: string
  category?: string
  date?: number
  poster?: string
  teams?: {
    home?: { name?: string }
    away?: { name?: string }
  }
  sources?: MatchSource[]
}

function getMatchTime(date?: number, showDate = false): string {
  if (!date) return 'Live'

  const matchDate = new Date(date)
  if (Number.isNaN(matchDate.getTime())) return 'Live'

  return new Intl.DateTimeFormat(undefined, {
    ...(showDate ? { month: 'short', day: 'numeric' } : {}),
    hour: '2-digit',
    minute: '2-digit',
  }).format(matchDate)
}

function getPosterUrl(poster?: string): string | undefined {
  if (!poster) return undefined
  return poster.startsWith('http') ? poster : `${SPORTS_API_BASE.replace('/api', '')}${poster}`
}

function normalizeMatch(match: StreamedMatch, status: 'LIVE' | 'UPCOMING' = 'LIVE'): Match {
  const [fallbackHome, fallbackAway] = match.title.split(/\s+vs\s+/i)
  const homeTeam = match.teams?.home?.name || fallbackHome || match.title
  const awayTeam = match.teams?.away?.name || fallbackAway || 'Opponent'
  const sport = match.category || 'sports'

  return {
    id: match.id,
    title: match.title,
    homeTeam,
    awayTeam,
    league: sport.toUpperCase(),
    status,
    time: getMatchTime(match.date, status === 'UPCOMING'),
    score: 'vs',
    sport,
    poster: getPosterUrl(match.poster),
    date: match.date,
    sources: match.sources || [],
  }
}

export const sportsApi = {
  async getLiveMatches(): Promise<Match[]> {
    try {
      console.log('Fetching live matches from:', `${SPORTS_API_BASE}/matches/live`)
      const response = await axios.get(`${SPORTS_API_BASE}/matches/live`, {
        timeout: 10000,
      })
      console.log('Live matches response:', response.data)
      return Array.isArray(response.data)
        ? response.data.map((match: StreamedMatch) => normalizeMatch(match))
        : []
    } catch (error) {
      console.error('Error fetching live matches:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        })
      }
      // Return mock data as fallback
      return this.getMockMatches()
    }
  },

  async getUpcomingMatches(): Promise<Match[]> {
    try {
      console.log('Fetching upcoming matches from:', `${SPORTS_API_BASE}/matches/all`)
      const response = await axios.get(`${SPORTS_API_BASE}/matches/all`, {
        timeout: 10000,
      })
      const now = Date.now()

      return Array.isArray(response.data)
        ? response.data
            .filter((match: StreamedMatch) => match.date && match.date > now)
            .sort((a: StreamedMatch, b: StreamedMatch) => (a.date || 0) - (b.date || 0))
            .map((match: StreamedMatch) => normalizeMatch(match, 'UPCOMING'))
        : []
    } catch (error) {
      console.error('Error fetching upcoming matches:', error)
      return this.getMockMatches().map((match) => ({
        ...match,
        status: 'UPCOMING',
        time: 'Soon',
      }))
    }
  },

  async getStreams(source: string, id: string): Promise<Stream[]> {
    try {
      console.log('Fetching streams from:', `${SPORTS_API_BASE}/stream/${source}/${id}`)
      const response = await axios.get(`${SPORTS_API_BASE}/stream/${source}/${id}`, {
        timeout: 10000,
      })
      console.log('Streams response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching streams:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        })
      }
      // Return mock data as fallback
      return this.getMockStreams()
    }
  },

  getStreamUrl(source: string, id: string): string {
    return `${SPORTS_API_BASE}/stream/${source}/${id}`
  },

  // Available sources
  sources: ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'intel'] as const,

  // Mock data fallback
  getMockMatches(): Match[] {
    return [
      {
        id: '1',
        title: 'Manchester United vs Liverpool',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        league: 'Premier League',
        status: 'LIVE',
        time: '67\'',
        score: '2 - 1',
        sport: 'football',
        sources: [{ source: 'alpha', id: 'match1' }],
      },
      {
        id: '2',
        title: 'Real Madrid vs Barcelona',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        league: 'La Liga',
        status: 'LIVE',
        time: '34\'',
        score: '1 - 0',
        sport: 'football',
        sources: [{ source: 'bravo', id: 'match2' }],
      },
      {
        id: '3',
        title: 'Lakers vs Warriors',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        league: 'NBA',
        status: 'LIVE',
        time: 'Q3',
        score: '98 - 95',
        sport: 'basketball',
        sources: [{ source: 'charlie', id: 'match3' }],
      },
    ]
  },

  getMockStreams(): Stream[] {
    return [
      {
        id: 'stream1',
        streamNo: 1,
        language: 'English',
        hd: true,
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        source: 'alpha',
      },
      {
        id: 'stream2',
        streamNo: 2,
        language: 'Spanish',
        hd: true,
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        source: 'alpha',
      },
    ]
  },
}
