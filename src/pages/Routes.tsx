import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import PageFallback from '../components/PageFallback'

// Lazy load all pages for code splitting
const Home = lazy(() => import('./Home'))
const Movies = lazy(() => import('./Movies'))
const TVSeries = lazy(() => import('./TVSeries'))
const Sports = lazy(() => import('./Sports'))
const LiveTV = lazy(() => import('./LiveTV'))
const Anime = lazy(() => import('./Anime'))
const KenyanSeries = lazy(() => import('./KenyanSeries'))
const KenyanSeriesDetails = lazy(() => import('./KenyanSeriesDetails'))
const Trending = lazy(() => import('./Trending'))
const MyList = lazy(() => import('./MyList'))
const Profile = lazy(() => import('./Profile'))
const Queue = lazy(() => import('./Queue'))
const WatchHistory = lazy(() => import('./WatchHistory'))
const Settings = lazy(() => import('./Settings'))
const MovieDetails = lazy(() => import('./MovieDetails'))
const TVDetails = lazy(() => import('./TVDetails'))
const SportsPlayer = lazy(() => import('./SportsPlayer'))
const Contact = lazy(() => import('./Contact'))
const Privacy = lazy(() => import('./Privacy'))
const Terms = lazy(() => import('./Terms'))
const Dmca = lazy(() => import('./Dmca'))
const NotFound = lazy(() => import('./NotFound'))
const Support = lazy(() => import('./Support'))

export default function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/movies" element={<PageTransition><Movies /></PageTransition>} />
          <Route path="/tv" element={<PageTransition><TVSeries /></PageTransition>} />
          <Route path="/sports" element={<PageTransition><Sports /></PageTransition>} />
          <Route path="/live-tv" element={<PageTransition><LiveTV /></PageTransition>} />
          <Route path="/anime" element={<PageTransition><Anime /></PageTransition>} />
          <Route path="/kenyan-series" element={<PageTransition><KenyanSeries /></PageTransition>} />
          <Route path="/kenyan-series/:id" element={<PageTransition><KenyanSeriesDetails /></PageTransition>} />
          <Route path="/trending" element={<PageTransition><Trending /></PageTransition>} />
          <Route path="/my-list" element={<PageTransition><MyList /></PageTransition>} />
          <Route path="/queue" element={<PageTransition><Queue /></PageTransition>} />
          <Route path="/watch-history" element={<PageTransition><WatchHistory /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/movie/:id" element={<PageTransition><MovieDetails /></PageTransition>} />
          <Route path="/tv/:id" element={<PageTransition><TVDetails /></PageTransition>} />
          <Route path="/sports/:source/:id" element={<PageTransition><SportsPlayer /></PageTransition>} />
          <Route path="/sports/:matchId" element={<PageTransition><SportsPlayer /></PageTransition>} />
          <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/dmca" element={<PageTransition><Dmca /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
