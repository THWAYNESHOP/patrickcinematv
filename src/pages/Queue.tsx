import QueueManager from '../components/QueueManager'
import { Link } from 'react-router-dom'

export default function Queue() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Your Queue</h1>
            <p className="text-gray-400 mt-2">Organize what to watch next and manage your priority queue.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
          >
            Browse Content
          </Link>
        </div>

        <div className="glass rounded-3xl border border-white/10 bg-darkSurface p-6">
          <QueueManager />
        </div>
      </div>
    </div>
  )
}
