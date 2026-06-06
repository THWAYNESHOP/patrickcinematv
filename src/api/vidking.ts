export const vidkingApi = {
  getMovieEmbedUrl(tmdbId: string, options?: {
    color?: string
    autoPlay?: boolean
    nextEpisode?: boolean
    episodeSelector?: boolean
    progress?: number
  }): string {
    const params = new URLSearchParams()
    
    if (options?.color) params.append('color', options.color)
    if (options?.autoPlay) params.append('autoplay', '1')
    if (options?.nextEpisode) params.append('next_episode', '1')
    if (options?.episodeSelector) params.append('episode_selector', '1')
    if (options?.progress) params.append('t', options.progress.toString())
    
    const queryString = params.toString()
    return `https://vidsrc.to/embed/movie/${tmdbId}${queryString ? `?${queryString}` : ''}`
  },

  getTVEmbedUrl(tmdbId: string, season: number, episode: number, options?: {
    color?: string
    autoPlay?: boolean
    nextEpisode?: boolean
    episodeSelector?: boolean
    progress?: number
  }): string {
    const params = new URLSearchParams()
    
    if (options?.color) params.append('color', options.color)
    if (options?.autoPlay) params.append('autoplay', '1')
    if (options?.nextEpisode) params.append('next_episode', '1')
    if (options?.episodeSelector) params.append('episode_selector', '1')
    if (options?.progress) params.append('t', options.progress.toString())
    
    const queryString = params.toString()
    return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}${queryString ? `?${queryString}` : ''}`
  },

  // Progress tracking hook for VidSrc player
  setupProgressTracking(callback: (data: PlayerEventData) => void): () => void {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const parsed = JSON.parse(event.data)
          if (parsed.type === 'PLAYER_EVENT') {
            callback(parsed.data)
          }
        }
      } catch (error) {
        console.error('Error parsing player event:', error)
      }
    }

    window.addEventListener('message', handleMessage)

    // Return cleanup function
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  },
}

export interface PlayerEventData {
  event: 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked'
  currentTime: number
  duration: number
  progress: number
  id: string
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  timestamp: number
}
