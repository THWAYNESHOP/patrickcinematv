interface LoadingSkeletonProps {
  className?: string
}

export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`skeleton rounded ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-48 w-full" />
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-3 w-1/2" />
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] w-full">
      <LoadingSkeleton className="h-full w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <LoadingSkeleton className="h-8 w-2/3" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function CarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex-shrink-0 w-40 space-y-2">
          <LoadingSkeleton className="h-56 w-full rounded-lg" />
          <LoadingSkeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}
