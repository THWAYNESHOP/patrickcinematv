import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center py-16">
      <p className="text-8xl md:text-9xl font-extrabold text-primary/20 select-none">404</p>
      <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-3">Page not found</h1>
      <p className="text-gray-400 max-w-md mb-10">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nexastream:open-search'))}
          className="inline-flex items-center gap-2 glass hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </div>
    </div>
  )
}
