import { useMemo } from 'react'
import { useWatchHistory } from './useWatchHistory'
import { useMyList } from './useMyList'

export function usePersonalizedRecommendations(allContent: any[]) {
  const { watchHistory } = useWatchHistory()
  const { myList } = useMyList()

  const recommendations = useMemo(() => {
    if (!allContent || allContent.length === 0) return []

    // Get genres from watch history and my list
    const userPreferences = new Set<string>()
    
    // Extract genres from watch history (simplified - in real app would have genre data)
    watchHistory.slice(0, 10).forEach(item => {
      // In a real implementation, you'd have genre data in the item
      // For now, we'll use the content type as a preference
      userPreferences.add(item.type)
    })

    // Extract genres from my list
    myList.slice(0, 10).forEach(item => {
      userPreferences.add(item.type)
    })

    // Score content based on user preferences
    const scoredContent = allContent.map(item => {
      let score = 0

      // Boost score if content matches user's preferred types
      if (userPreferences.has(item.type)) {
        score += 10
      }

      // Boost score if content is in my list (show similar items)
      const isInMyList = myList.some(listItem => listItem.id === item.id)
      if (isInMyList) {
        score += 5
      }

      // Boost score if content was recently watched
      const wasRecentlyWatched = watchHistory.some(historyItem => historyItem.id === item.id)
      if (wasRecentlyWatched) {
        score += 3
      }

      // Boost trending content
      if (item.rating && parseFloat(item.rating) > 7.5) {
        score += 5
      }

      // Boost new releases
      if (item.year && item.year >= 2023) {
        score += 3
      }

      return { ...item, score }
    })

    // Sort by score and return top recommendations
    return scoredContent
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ _score, ...item }) => item)
  }, [allContent, watchHistory, myList])

  return recommendations
}
