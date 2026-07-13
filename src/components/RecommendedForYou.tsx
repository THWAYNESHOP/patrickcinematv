import { useRecommendations } from '../hooks/useRecommendations'
import ContentCarousel from './Home/ContentCarousel'
import { useStore } from '../store/useStore'

interface RecommendationsProps {
  allContent: Array<{ id: string | number; title: string; poster?: string; genre?: string; rating?: string | number; type?: string }>
  carouselId: string
  carouselStateProps?: any
}

export default function RecommendedForYou({ allContent, carouselId, carouselStateProps = {} }: RecommendationsProps) {
  const { recommendations } = useRecommendations(allContent)
  const { getAverageRatingForMedia } = useStore()

  if (recommendations.length === 0) {
    return null
  }

  const contentForCarousel = recommendations.map((item: any) => {
    const original = allContent.find(c => c.id === Number(item.id))
    const userRating = getAverageRatingForMedia(String(item.id))
    const realRating = original?.rating || (userRating > 0 ? userRating.toFixed(1) : '0')
    return {
      id: item.id,
      title: item.title,
      poster: original?.poster || '',
      type: original?.type || 'movie',
      rating: realRating,
    }
  })

  return (
    <section className="mb-10 md:mb-12">
      <div className="mb-4 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold text-white">Recommended For You</h2>
        <p className="text-sm text-gray-400 mt-1">Based on your watch history</p>
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
