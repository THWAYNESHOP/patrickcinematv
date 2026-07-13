interface LoadingSkeletonProps {
  className?: string
  variant?: 'default' | 'circle' | 'text'
  ariaLabel?: string
}

export default function LoadingSkeleton({ 
  className = '', 
  variant = 'default',
  ariaLabel = 'Loading...'
}: LoadingSkeletonProps) {
  const variantClasses = {
    default: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4',
  }

  return (
    <div 
      className={`skeleton ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading card">
      <LoadingSkeleton className="h-48 w-full rounded-xl" ariaLabel="Loading poster" />
      <LoadingSkeleton variant="text" className="w-3/4" ariaLabel="Loading title" />
      <LoadingSkeleton variant="text" className="w-1/2" ariaLabel="Loading metadata" />
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full" role="status" aria-label="Loading hero banner">
      <LoadingSkeleton className="h-full w-full" ariaLabel="Loading hero image" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <LoadingSkeleton variant="text" className="h-8 w-2/3" ariaLabel="Loading title" />
        <LoadingSkeleton variant="text" className="h-4 w-1/2" ariaLabel="Loading metadata" />
        <LoadingSkeleton className="h-10 w-32 rounded-full" ariaLabel="Loading buttons" />
      </div>
    </div>
  )
}

export function CarouselSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4" role="status" aria-label="Loading carousel">
      {Array.from({ length: count }, (_, i) => i).map((i) => (
        <div key={i} className="flex-shrink-0 w-36 sm:w-44 md:w-52 space-y-2">
          <LoadingSkeleton className="h-52 w-full rounded-xl" ariaLabel={`Loading item ${i + 1}`} />
          <LoadingSkeleton variant="text" className="w-full" ariaLabel={`Loading title ${i + 1}`} />
        </div>
      ))}
    </div>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading text">
      {Array.from({ length: lines }, (_, i) => i).map((i) => (
        <LoadingSkeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
          ariaLabel={`Loading line ${i + 1}`}
        />
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: count }, (_, i) => i).map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-darkSurface rounded-xl">
          <LoadingSkeleton className="h-16 w-16 rounded-lg" ariaLabel={`Loading thumbnail ${i + 1}`} />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-3/4" ariaLabel={`Loading title ${i + 1}`} />
            <LoadingSkeleton variant="text" className="w-1/2" ariaLabel={`Loading metadata ${i + 1}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
