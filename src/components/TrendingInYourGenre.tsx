import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import ContentCarousel from './Home/ContentCarousel'
import { useWatchBehavior } from '../hooks/useWatchBehavior'
import { useStore } from '../store/useStore'
import type { MovieSummary } from '../api/tmdb'

interface TrendingInYourGenreProps {
  allContent: MovieSummary[]
  carouselId: string
  carouselStateProps?: Record<string, unknown>
  limit?: number
}

/**
 * Shows trending content specifically in genres the user watches
 * Personalized based on user's watch history
 */
export default function TrendingInYourGenre({
  allContent,
  carouselId,
  carouselStateProps = {},
  limit = 10,
}: TrendingInYourGenreProps) {
  const watchBehavior = useWatchBehavior()
  const getAverageRatingForMedia = useStore((state) => state.getAverageRatingForMedia)

  const contentForCarousel: MovieSummary[] = useMemo(() => {
    if (!watchBehavior?.favoriteGenres?.length || !allContent?.length) {
      return []
    }

    const userGenres = watchBehavior.favoriteGenres.map(g => g.genre)

    // Filter trending content by user's preferred genres
    const filteredContent = allContent
      .filter(item => userGenres.includes(item.type || ''))
      .map(item => {
        let score = 0

        // Trending score
        if (item.popularity && item.popularity > 50) {
          score += (item.popularity - 50) / 10
        }

        // Rating score
        const rating = parseFloat(item.rating || '0') || 0
        if (rating >= 7) score += rating

        // Recent releases get a boost
        if (item.year && item.year >= 2024) {
          score += 10
        }

        return { ...item, _score: score }
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...item }) => ({
        ...item,
        rating: String(getAverageRatingForMedia(String(item.id)) || item.rating || '0'),
      }))

    return filteredContent
  }, [watchBehavior.favoriteGenres, allContent.length, limit, getAverageRatingForMedia])

  if (!watchBehavior?.favoriteGenres?.length || contentForCarousel.length === 0) {
    return null
  }

  return (
    <section className="mb-10 md:mb-12">
      <div className="mb-4 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Trending in Your Genres</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Hot picks from {watchBehavior.favoriteGenres[0]?.genre || 'your favorite genres'}
            </p>
          </div>
        </div>
      </div>
      <ContentCarousel
        title=""
        items={contentForCarousel}
        type="movie"
        carouselId={carouselId}
        {...carouselStateProps}
      />
    </section>
  )
}
