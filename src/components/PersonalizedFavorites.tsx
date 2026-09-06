import { useMemo } from 'react'
import { Heart } from 'lucide-react'
import ContentCarousel from './Home/ContentCarousel'
import { useStore } from '../store/useStore'
import type { MovieSummary } from '../api/tmdb'

interface PersonalizedFavoritesProps {
  allContent: MovieSummary[]
  carouselId: string
  carouselStateProps?: Record<string, unknown>
  limit?: number
}

export default function PersonalizedFavorites({
  allContent,
  carouselId,
  carouselStateProps = {},
  limit = 10,
}: PersonalizedFavoritesProps) {
  const reviews = useStore((state) => state.reviews)

  const contentForCarousel: MovieSummary[] = useMemo(() => {
    if (!reviews || reviews.length === 0) return []

    return reviews
      .filter((review) => review.rating >= 4)
      .sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((review) => {
        const matchedContent = allContent.find(content => String(content.id) === review.mediaId)

        return {
          id: review.mediaId,
          title: review.mediaTitle,
          poster: review.mediaPoster,
          type: review.mediaType,
          rating: matchedContent?.rating || review.rating.toFixed(1),
        }
      })
  }, [allContent, limit, reviews])

  if (contentForCarousel.length === 0) {
    return null
  }

  return (
    <section className="mb-10 md:mb-12">
      <div className="mb-4 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Your Favorites</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Based on your highest-rated titles
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
