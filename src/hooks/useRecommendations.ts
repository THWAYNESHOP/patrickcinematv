import { useMemo } from 'react'
import { useWatchHistory } from './useWatchHistory'

export interface RecommendationScore {
  id: string | number
  title: string
  score: number
  reason: string
}

export function useRecommendations(allContent: Array<{ id: number | string; title: string; genre?: string; rating?: string | number }>) {
  const { watchHistory } = useWatchHistory()

  const recommendations: RecommendationScore[] = useMemo(() => {
    const watchedIds = new Set(watchHistory.map((h: any) => String(h.id)))

    if (watchHistory.length === 0) {
      return allContent.slice(0, 10).map((item, idx) => ({
        id: item.id,
        title: item.title,
        score: 50 - idx,
        reason: 'Featured content',
      }))
    }

    const scored: RecommendationScore[] = allContent
      .filter(item => !watchedIds.has(String(item.id)))
      .map(item => {
        const score = 50 + Math.random() * 20 - 10

        return {
          id: item.id,
          title: item.title,
          score,
          reason: 'Recommended for you',
        }
      })
      .sort((a, b) => b.score - a.score)

    return scored.slice(0, 12)
  }, [allContent, watchHistory])

  return { recommendations }
}
