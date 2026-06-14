import { useMemo } from 'react'

interface ContentItem {
  id: string | number
  title: string
  type: 'movie' | 'tv' | 'anime' | 'sports'
  genres?: string[]
  year?: number
  rating?: string
}

export function useSimilarContent(
  currentItem: ContentItem | null,
  allContent: ContentItem[],
  limit: number = 8
) {
  const similarContent = useMemo(() => {
    if (!currentItem) return []

    const scored = allContent
      .filter(item => item.id !== currentItem.id)
      .map(item => {
        let score = 0

        // Same type gets bonus
        if (item.type === currentItem.type) score += 3

        // Genre matching (if available)
        if (currentItem.genres && item.genres) {
          const sharedGenres = currentItem.genres.filter(g => item.genres?.includes(g))
          score += sharedGenres.length * 2
        }

        // Year proximity (within 5 years)
        if (currentItem.year && item.year) {
          const yearDiff = Math.abs(currentItem.year - item.year)
          if (yearDiff <= 5) score += (5 - yearDiff) * 0.5
        }

        // Rating proximity
        if (currentItem.rating && item.rating) {
          const ratingDiff = Math.abs(parseFloat(currentItem.rating) - parseFloat(item.rating))
          if (ratingDiff <= 1) score += 1
        }

        // Title similarity (simple check)
        const currentTitleWords = currentItem.title.toLowerCase().split(' ')
        const itemTitleWords = item.title.toLowerCase().split(' ')
        const sharedWords = currentTitleWords.filter(w => itemTitleWords.includes(w))
        score += sharedWords.length * 0.5

        return { item, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item)

    return scored
  }, [currentItem, allContent, limit])

  return similarContent
}
