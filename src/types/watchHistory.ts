export type MediaType = 'movie' | 'tv' | 'sports' | 'anime'

export interface WatchHistoryItem {
  id: string
  title: string
  poster: string
  type: MediaType
  timestamp: number
  duration?: number
}
