import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import type { MovieSummary } from '../api/tmdb'

export interface UserGenrePreference {
  genre: string
  count: number
  averageRating: number
  lastWatched: number
}

export interface WatchBehaviorStats {
  totalWatched: number
  averageRating: number
  favoriteGenres: UserGenrePreference[]
  recentlyWatched: Array<{ id: string; title: string; timestamp: number }>
  topRatedWatches: Array<{ id: string; title: string; rating: number }>
}

export function useWatchBehavior() {
  // Use individual selectors to get stable references
  const watchHistory = useStore((state) => state.watchHistory)
  const reviews = useStore((state) => state.reviews)
  const myList = useStore((state) => state.myList)

  const stats: WatchBehaviorStats = useMemo(() => {
    if (!watchHistory || watchHistory.length === 0) {
      return {
        totalWatched: 0,
        averageRating: 0,
        favoriteGenres: [],
        recentlyWatched: [],
        topRatedWatches: [],
      }
    }

    // Calculate average rating
    const ratings = reviews.map(r => r.rating)
    const averageRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0

    // Get recently watched
    const recentlyWatched = watchHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(item => ({
        id: item.id,
        title: item.title,
        timestamp: item.timestamp,
      }))

    // Get top rated watches
    const topRatedWatches = reviews
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map(review => ({
        id: review.mediaId,
        title: review.mediaTitle,
        rating: review.rating,
      }))

    // Genre preferences based on watch history
    const genreMap = new Map<string, { count: number; totalRating: number; lastWatched: number }>()
    
    watchHistory.forEach(item => {
      const currentEntry = genreMap.get(item.type) || { count: 0, totalRating: 0, lastWatched: 0 }
      const itemReview = reviews.find(r => r.mediaId === item.id)
      const rating = itemReview?.rating || 0
      
      genreMap.set(item.type, {
        count: currentEntry.count + 1,
        totalRating: currentEntry.totalRating + rating,
        lastWatched: Math.max(currentEntry.lastWatched, item.timestamp),
      })
    })

    const favoriteGenres: UserGenrePreference[] = Array.from(genreMap.entries())
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        averageRating: data.count > 0 ? data.totalRating / data.count : 0,
        lastWatched: data.lastWatched,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      totalWatched: watchHistory.length,
      averageRating,
      favoriteGenres,
      recentlyWatched,
      topRatedWatches,
    }
  }, [watchHistory, reviews, myList])

  return stats
}

/**
 * Generates "Because You Watched" recommendations based on a specific item
 * Similar items are recommended based on genre, rating, and year proximity
 */
export function useBecauseYouWatched(item: MovieSummary | null, allContent: MovieSummary[]) {
  return useMemo(() => {
    if (!item || allContent.length === 0) return []

    const scored = allContent
      .filter(content => content.id !== item.id)
      .map(content => {
        let score = 0

        // Same type is a strong match
        if (content.type === item.type) {
          score += 20
        }

        // Year proximity (within 3 years is good)
        if (item.year && content.year) {
          const yearDiff = Math.abs(item.year - content.year)
          if (yearDiff <= 3) score += 15
          else if (yearDiff <= 10) score += 5
        }

        // Similar rating (within 1 point is good)
        const itemRating = parseFloat(item.rating || '0') || 0
        const contentRating = parseFloat(content.rating || '0') || 0
        if (itemRating > 0 && contentRating > 0) {
          const ratingDiff = Math.abs(itemRating - contentRating)
          if (ratingDiff <= 1) score += 10
          else if (ratingDiff <= 2) score += 5
        }

        // High-rated content gets a boost
        if (contentRating >= 7.5) score += 5

        // Trending/popular content boost
        if (content.popularity && content.popularity > 50) score += 3

        return { ...content, _score: score }
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, 10)
      .map(({ _score, ...content }) => content)

    return scored
  }, [item, allContent])
}
