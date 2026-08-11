import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import PageFallback from '../components/PageFallback'

// Lazy load all pages for code splitting with chunk names
const Home = lazy(() => import(/* webpackChunkName: "home" */ './Home'))
const Movies = lazy(() => import(/* webpackChunkName: "movies" */ './Movies'))
const TVSeries = lazy(() => import(/* webpackChunkName: "tv" */ './TVSeries'))
const Sports = lazy(() => import(/* webpackChunkName: "sports" */ './Sports'))
const LiveTV = lazy(() => import(/* webpackChunkName: "live-tv" */ './LiveTV'))
const Anime = lazy(() => import(/* webpackChunkName: "anime" */ './Anime'))
const KenyanSeries = lazy(() => import(/* webpackChunkName: "kenyan-series" */ './KenyanSeries'))
const KenyanSeriesDetails = lazy(() => import(/* webpackChunkName: "kenyan-series" */ './KenyanSeriesDetails'))
const Trending = lazy(() => import(/* webpackChunkName: "trending" */ './Trending'))
const MyList = lazy(() => import(/* webpackChunkName: "my-list" */ './MyList'))
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ './Profile'))
const Queue = lazy(() => import(/* webpackChunkName: "queue" */ './Queue'))
const WatchHistory = lazy(() => import(/* webpackChunkName: "watch-history" */ './WatchHistory'))
const Settings = lazy(() => import(/* webpackChunkName: "settings" */ './Settings'))
const MovieDetails = lazy(() => import(/* webpackChunkName: "details" */ './MovieDetails'))
const TVDetails = lazy(() => import(/* webpackChunkName: "details" */ './TVDetails'))
const SportsPlayer = lazy(() => import(/* webpackChunkName: "player" */ './SportsPlayer'))
const Contact = lazy(() => import(/* webpackChunkName: "legal" */ './Contact'))
const Privacy = lazy(() => import(/* webpackChunkName: "legal" */ './Privacy'))
const Terms = lazy(() => import(/* webpackChunkName: "legal" */ './Terms'))
const Dmca = lazy(() => import(/* webpackChunkName: "legal" */ './Dmca'))
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ './NotFound'))
const Support = lazy(() => import(/* webpackChunkName: "support" */ './Support'))
const WatchPage = lazy(() => import(/* webpackChunkName: "player" */ './WatchPage'))

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
          <Route path="/watch/:id" element={<PageTransition><WatchPage /></PageTransition>} />
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
