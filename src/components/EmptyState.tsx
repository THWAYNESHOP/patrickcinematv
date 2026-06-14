import { Film, Search, Clock, Heart, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-results' | 'no-watch-history' | 'no-continue-watching' | 'no-my-list' | 'error' | 'no-content'
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const icons = {
  'no-results': Search,
  'no-watch-history': Clock,
  'no-continue-watching': Clock,
  'no-my-list': Heart,
  'error': AlertCircle,
  'no-content': Film
}

const defaultTitles = {
  'no-results': 'No results found',
  'no-watch-history': 'No watch history yet',
  'no-continue-watching': 'Nothing to continue watching',
  'no-my-list': 'Your list is empty',
  'error': 'Something went wrong',
  'no-content': 'No content available'
}

const defaultMessages = {
  'no-results': 'Try adjusting your search or filters',
  'no-watch-history': 'Start watching content to build your history',
  'no-continue-watching': 'Watch something to see it here',
  'no-my-list': 'Add content to your list to see it here',
  'error': 'Please try again later',
  'no-content': 'Check back later for new content'
}

export default function EmptyState({ type, title, message, action }: EmptyStateProps) {
  const Icon = icons[type]
  const displayTitle = title || defaultTitles[type]
  const displayMessage = message || defaultMessages[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{displayTitle}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{displayMessage}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
