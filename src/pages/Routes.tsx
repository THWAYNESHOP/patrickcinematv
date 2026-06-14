import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'

// Lazy load all pages for code splitting
const Home = lazy(() => import('./Home'))
const Movies = lazy(() => import('./Movies'))
const TVSeries = lazy(() => import('./TVSeries'))
const Sports = lazy(() => import('./Sports'))
const LiveTV = lazy(() => import('./LiveTV'))
const Anime = lazy(() => import('./Anime'))
const Trending = lazy(() => import('./Trending'))
const MyList = lazy(() => import('./MyList'))
const MovieDetails = lazy(() => import('./MovieDetails'))
const TVDetails = lazy(() => import('./TVDetails'))
const SportsPlayer = lazy(() => import('./SportsPlayer'))

// Loading component for Suspense
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-deepBlack">
      <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
    </div>
  )
}

export default function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/movies" element={<PageTransition><Movies /></PageTransition>} />
          <Route path="/tv" element={<PageTransition><TVSeries /></PageTransition>} />
          <Route path="/sports" element={<PageTransition><Sports /></PageTransition>} />
          <Route path="/live-tv" element={<PageTransition><LiveTV /></PageTransition>} />
          <Route path="/anime" element={<PageTransition><Anime /></PageTransition>} />
          <Route path="/trending" element={<PageTransition><Trending /></PageTransition>} />
          <Route path="/my-list" element={<PageTransition><MyList /></PageTransition>} />
          <Route path="/movie/:id" element={<PageTransition><MovieDetails /></PageTransition>} />
          <Route path="/tv/:id" element={<PageTransition><TVDetails /></PageTransition>} />
          <Route path="/sports/:source/:id" element={<PageTransition><SportsPlayer /></PageTransition>} />
          <Route path="/sports/:matchId" element={<PageTransition><SportsPlayer /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
