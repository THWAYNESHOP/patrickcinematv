import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import ContentCarousel from './Home/ContentCarousel'
import { useContinueWatching } from '../hooks/useContinueWatching'
import { useStore } from '../store/useStore'
import type { MovieSummary } from '../api/tmdb'

interface ContinueWatchingCarouselProps {
  allContent: MovieSummary[]
  carouselId: string
  carouselStateProps?: Record<string, unknown>
  limit?: number
}

export default function ContinueWatchingCarousel({
  allContent,
  carouselId,
  carouselStateProps = {},
  limit = 10,
}: ContinueWatchingCarouselProps) {
  const { continueWatching } = useContinueWatching()
  const getAverageRatingForMedia = useStore((state) => state.getAverageRatingForMedia)

  const contentForCarousel: MovieSummary[] = useMemo(() => {
    if (!continueWatching || continueWatching.length === 0) return []

    return continueWatching
      .slice(0, limit)
      .map(item => {
        const matchedContent = allContent.find(content => String(content.id) === item.id)
        return {
          id: item.id,
          title: item.title,
          poster: item.poster,
          type: item.type,
          rating: String(getAverageRatingForMedia(item.id) || matchedContent?.rating || '0'),
          progress: item.progress,
        } as MovieSummary & { progress: number }
      })
  }, [continueWatching, allContent.length, limit, getAverageRatingForMedia])

  if (contentForCarousel.length === 0) {
    return null
  }

  return (
    <section className="mb-10 md:mb-12">
      <div className="mb-4 px-4 md:px-0">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Continue Watching</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Pick up where you left off
            </p>
          </div>
        </div>
      </div>
      <ContentCarousel
        title=""
        items={contentForCarousel}
        type="movie"
        carouselId={carouselId}
        showProgress={true}
        {...carouselStateProps}
      />
    </section>
  )
}
