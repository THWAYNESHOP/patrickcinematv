import { AlertTriangle, RefreshCw } from 'lucide-react'

interface NetworkStatusBannerProps {
  message: string | null
  onRetry?: () => void
}

export default function NetworkStatusBanner({ message, onRetry }: NetworkStatusBannerProps) {
  if (!message) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-red-500/95 text-white px-4 py-3 text-sm md:text-base font-semibold shadow-lg backdrop-blur">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25"
          >
            <RefreshCw className="h-4 w-4" />
            Retry now
          </button>
        )}
      </div>
    </div>
  )
}
