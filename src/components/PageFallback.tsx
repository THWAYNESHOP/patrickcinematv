import { CardSkeleton, HeroSkeleton } from './Skeleton'

export default function PageFallback() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-deepBlack px-4 sm:px-6 md:px-12 lg:px-16 py-8">
      <div className="container mx-auto space-y-10">
        <HeroSkeleton />

        <section className="space-y-8">
          <div className="h-8 w-56 bg-gray-800 rounded animate-pulse" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <CardSkeleton key={`bottom-${index}`} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
