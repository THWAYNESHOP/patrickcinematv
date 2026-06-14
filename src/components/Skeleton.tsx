export function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-44 md:w-52">
      <div className="bg-darkSurface rounded-xl overflow-hidden border border-white/5">
        <div className="relative aspect-[2/3] bg-gray-800 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-gray-700 rounded animate-pulse" />
            <div className="w-12 h-4 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[90vh] md:h-[100vh] overflow-hidden bg-deepBlack">
      <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-deepBlack via-deepBlack/75 to-deepBlack/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/55 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-3xl space-y-6">
            <div className="h-24 md:h-32 lg:h-40 bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-40 bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MatchSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="relative w-full h-28 bg-gray-800 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-12 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-8 w-full bg-gray-700 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export function SearchSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 bg-darkSurface rounded-xl border border-white/5">
      <div className="w-20 h-28 bg-gray-800 rounded-lg animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-700 rounded animate-pulse w-3/4" />
        <div className="flex items-center gap-2">
          <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
