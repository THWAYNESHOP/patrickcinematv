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
  const myList = useStore((state) => state.myList)
  const getAverageRatingForMedia = useStore((state) => state.getAverageRatingForMedia)

  const contentForCarousel: MovieSummary[] = useMemo(() => {
    if (!myList || myList.length === 0) return []

    // Sort by rating (highest first) and limit
    return myList
      .map(item => {
        const matchedContent = allContent.find(content => String(content.id) === item.id)
        const userRating = getAverageRatingForMedia(item.id)
        
        return {
          id: item.id,
          title: item.title,
          poster: item.poster,
          type: item.type,
          rating: userRating > 0 ? String(userRating.toFixed(1)) : String(matchedContent?.rating || '0'),
          userRating,
        }
      })
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
      .slice(0, limit)
      .map(({ userRating: _userRating, ...item }) => item as MovieSummary)
  }, [myList.length, limit, getAverageRatingForMedia])

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
              {myList.length} item{myList.length !== 1 ? 's' : ''} in your list
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
