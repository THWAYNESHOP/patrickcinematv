import { AlertCircle } from 'lucide-react'

interface ErrorBannerProps {
  error: string | null
  onRetry?: () => void | Promise<void>
  isRetrying?: boolean
}

export default function ErrorBanner({ error, onRetry, isRetrying = false }: ErrorBannerProps) {
  if (!error) return null

  return (
    <div className="mb-8">
      <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">Loading failed</p>
            <p className="mt-1 text-sm text-gray-200">{error}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  )
}
