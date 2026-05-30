import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import Movies from './Movies'
import TVSeries from './TVSeries'
import Sports from './Sports'
import LiveTV from './LiveTV'
import Anime from './Anime'
import Trending from './Trending'
import MyList from './MyList'
import MovieDetails from './MovieDetails'
import TVDetails from './TVDetails'
import SportsPlayer from './SportsPlayer'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/tv" element={<TVSeries />} />
      <Route path="/sports" element={<Sports />} />
      <Route path="/live-tv" element={<LiveTV />} />
      <Route path="/anime" element={<Anime />} />
      <Route path="/trending" element={<Trending />} />
      <Route path="/my-list" element={<MyList />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route path="/tv/:id" element={<TVDetails />} />
      <Route path="/sports/:source/:id" element={<SportsPlayer />} />
      <Route path="/sports/:matchId" element={<SportsPlayer />} />
    </Routes>
  )
}
