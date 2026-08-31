import { useMemo } from 'react'
import { Play } from 'lucide-react'
import ContentCarousel from './Home/ContentCarousel'
import { useBecauseYouWatched } from '../hooks/useWatchBehavior'
import { useWatchHistory } from '../hooks/useWatchHistory'
import { useStore } from '../store/useStore'
import type { MovieSummary } from '../api/tmdb'

interface BecauseYouWatchedProps {
  allContent: MovieSummary[]
  carouselId: string
  carouselStateProps?: Record<string, unknown>
  limit?: number
}

export default function BecauseYouWatched({
  allContent,
  carouselId,
  carouselStateProps = {},
  limit = 3,
}: BecauseYouWatchedProps) {
  const { watchHistory } = useWatchHistory()
  const getAverageRatingForMedia = useStore((state) => state.getAverageRatingForMedia)

  // Get the most recently watched item
  const recentlyWatchedItem = useMemo(() => {
    if (!watchHistory || watchHistory.length === 0) return null
    
    const sorted = [...watchHistory].sort((a, b) => b.timestamp - a.timestamp)
    const recent = sorted[0]
    
    // Find the matching content item
    return allContent.find(item => String(item.id) === recent.id)
  }, [watchHistory, allContent.length])

  // Generate recommendations based on recently watched
  const recommendations = useBecauseYouWatched(recentlyWatchedItem || null, allContent)

  if (!recentlyWatchedItem || !recommendations || recommendations.length === 0) {
    return null
  }

  const contentForCarousel: MovieSummary[] = recommendations
    .slice(0, limit)
    .filter((item): item is MovieSummary => item != null)
    .map(item => ({
      ...item,
      rating: String(getAverageRatingForMedia(String(item.id)) || item.rating || '0'),
    }))

  return (
    <section className="mb-10 md:mb-12">
      <div className="mb-4 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Because you watched</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {recentlyWatchedItem.title}
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
