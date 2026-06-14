export const vidkingApi = {
  getMovieEmbedUrl(id: string, options?: {
    color?: string
    autoPlay?: boolean
    nextEpisode?: boolean
    episodeSelector?: boolean
    progress?: number
  }): string {
    const params = new URLSearchParams()
    
    if (options?.autoPlay) params.append('autoPlay', 'true')
    if (options?.color) params.append('theme', options.color)
    if (options?.progress) params.append('startAt', options.progress.toString())
    
    const queryString = params.toString()
    const url = `https://vidfast.pro/movie/${id}${queryString ? `?${queryString}` : ''}`
    console.log('[Vidking API] Generated movie URL:', url)
    return url
  },

  getTVEmbedUrl(id: string, season: number, episode: number, options?: {
    color?: string
    autoPlay?: boolean
    nextEpisode?: boolean
    episodeSelector?: boolean
    progress?: number
  }): string {
    const params = new URLSearchParams()
    
    if (options?.autoPlay) params.append('autoPlay', 'true')
    if (options?.color) params.append('theme', options.color)
    if (options?.nextEpisode) {
      params.append('nextButton', 'true')
      params.append('autoNext', 'true')
    }
    if (options?.progress) params.append('startAt', options.progress.toString())
    
    const queryString = params.toString()
    const url = `https://vidfast.pro/tv/${id}/${season}/${episode}${queryString ? `?${queryString}` : ''}`
    console.log('[Vidking API] Generated TV URL:', url)
    return url
  },

  // Progress tracking hook for Vidking player
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
