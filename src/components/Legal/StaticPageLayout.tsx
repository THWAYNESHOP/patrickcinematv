import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface StaticPageLayoutProps {
  title: string
  children: React.ReactNode
}

export default function StaticPageLayout({ title, children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="container mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white tracking-tight">{title}</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-base">{children}</div>
      </div>
    </div>
  )
}
