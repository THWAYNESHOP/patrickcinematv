import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/Home/HeroSlider'
import ContentCarousel from '../components/Home/ContentCarousel'
import LiveMatches from '../components/Sports/LiveMatches'
import { tmdbApi } from '../api/tmdb'
import { useMyList } from '../hooks/useMyList'
import { useContinueWatching } from '../hooks/useContinueWatching'

const fallbackMovies = [
  { id: 1078605, title: 'Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'A test movie embed used for local player testing.', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: 'https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg', overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', rating: '8.1', year: 2023 },
]

const fallbackTV = [
  { id: 119051, title: 'Test Series', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.3', year: 2021 },
  { id: 100088, title: 'The Last of Us', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2023 },
]

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([])
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [popularTV, setPopularTV] = useState<any[]>([])
  const [teenRomance, setTeenRomance] = useState<any[]>([])
  const [kDrama, setKDrama] = useState<any[]>([])
  const [actionAdventure, setActionAdventure] = useState<any[]>([])
  const [comedy, setComedy] = useState<any[]>([])
  const [anime, setAnime] = useState<any[]>([])
  const [newReleases, setNewReleases] = useState<any[]>([])
  const [netflixContent, setNetflixContent] = useState<any[]>([])
  const [primeContent, setPrimeContent] = useState<any[]>([])
  const [disneyContent, setDisneyContent] = useState<any[]>([])
  const [appleContent, setAppleContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { myList } = useMyList()
  const { continueWatching } = useContinueWatching()

  useEffect(() => {
    async function fetchHomeContent() {
      try {
        const [trendingToday, latestMovies, trendingTV, teenRomanceMovies, koreanDrama, actionAdventureMovies, comedyMovies, animeContent, newReleasesContent, netflixCatalog, primeCatalog, disneyCatalog, appleCatalog] = await Promise.all([
          tmdbApi.getTrendingMoviesToday(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getTrendingTVToday(),
          tmdbApi.getMoviesByGenre(10749).catch(() => []),
          tmdbApi.getTVByOriginCountry('KR').catch(() => []),
          tmdbApi.getMoviesByGenre(28).catch(() => []),
          tmdbApi.getMoviesByGenre(35).catch(() => []),
          tmdbApi.getTVByGenre(16).catch(() => []),
          tmdbApi.getNewReleases().catch(() => []),
          tmdbApi.getPlatformCatalog('Netflix').catch(() => ({ movies: [], tv: [] })),
          tmdbApi.getPlatformCatalog('Prime Video').catch(() => ({ movies: [], tv: [] })),
          tmdbApi.getPlatformCatalog('Disney+').catch(() => ({ movies: [], tv: [] })),
          tmdbApi.getPlatformCatalog('Apple TV+').catch(() => ({ movies: [], tv: [] })),
        ])

        const heroMovies = (latestMovies.length ? latestMovies : trendingToday).filter((movie) => movie.backdrop)
        setFeaturedMovies(heroMovies.length ? heroMovies.slice(0, 5) : fallbackMovies)
        setTrendingMovies(trendingToday.length ? trendingToday : fallbackMovies)
        setPopularTV(trendingTV.length ? trendingTV : fallbackTV)
        setTeenRomance(teenRomanceMovies.length ? teenRomanceMovies : trendingMovies.slice(0, 8))
        setKDrama(koreanDrama.length ? koreanDrama : trendingTV.slice(0, 8))
        setActionAdventure(actionAdventureMovies.length ? actionAdventureMovies : trendingMovies.slice(0, 8))
        setComedy(comedyMovies.length ? comedyMovies : trendingMovies.slice(0, 8))
        setAnime(animeContent.length ? animeContent : trendingTV.slice(0, 8))
        setNewReleases(newReleasesContent.length ? newReleasesContent : [...trendingMovies.slice(0, 10), ...trendingTV.slice(0, 10)])
        setNetflixContent([...netflixCatalog.movies.slice(0, 10), ...netflixCatalog.tv.slice(0, 10)])
        setPrimeContent([...primeCatalog.movies.slice(0, 10), ...primeCatalog.tv.slice(0, 10)])
        setDisneyContent([...disneyCatalog.movies.slice(0, 10), ...disneyCatalog.tv.slice(0, 10)])
        setAppleContent([...appleCatalog.movies.slice(0, 10), ...appleCatalog.tv.slice(0, 10)])
      } catch (error) {
        console.warn('Home TMDB content unavailable, using fallback data:', error)
        setFeaturedMovies(fallbackMovies)
        setTrendingMovies(fallbackMovies)
        setPopularTV(fallbackTV)
        setTeenRomance(fallbackMovies.slice(0, 8))
        setKDrama(fallbackTV.slice(0, 8))
        setActionAdventure(fallbackMovies.slice(0, 8))
        setComedy(fallbackMovies.slice(0, 8))
        setAnime(fallbackTV.slice(0, 8))
        setNewReleases([...fallbackMovies.slice(0, 5), ...fallbackTV.slice(0, 5)])
        setNetflixContent([])
        setPrimeContent([])
        setDisneyContent([])
        setAppleContent([])
      } finally {
        setLoading(false)
      }
    }

    fetchHomeContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neonPink border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroSlider movies={featuredMovies} />

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
          <div className="container mx-auto">
            <ContentCarousel
              title="Continue Watching"
              items={continueWatching.map(item => ({
                id: item.id,
                title: item.title,
                poster: item.poster,
                type: item.type,
                progress: item.progress
              }))}
              type="movie"
              showProgress
            />
          </div>
        </section>
      )}

      {/* Trending Today */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Trending Today"
            items={trendingMovies}
            type="movie"
          />
        </div>
      </section>

      {/* Recommended For You */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Recommended For You"
            items={[...trendingMovies.slice(0, 5), ...popularTV.slice(0, 5)]}
            type="movie"
          />
        </div>
      </section>

      {/* New Releases */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="New Releases"
            items={newReleases}
            type="movie"
          />
        </div>
      </section>

      {/* Live Sports */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold neon-text">Live Sports</h2>
            <Link to="/sports" className="text-neonPink hover:text-white transition-colors text-sm font-semibold">
              View All
            </Link>
          </div>
          <LiveMatches limit={4} />
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold neon-text">Upcoming Matches</h2>
            <Link to="/sports" className="text-neonPink hover:text-white transition-colors text-sm font-semibold">
              View All
            </Link>
          </div>
          <LiveMatches limit={4} variant="upcoming" />
        </div>
      </section>

      {/* Teen Romance */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Teen Romance"
            items={teenRomance}
            type="movie"
          />
        </div>
      </section>

      {/* Korean Dramas */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Korean Dramas"
            items={kDrama}
            type="tv"
          />
        </div>
      </section>

      {/* Action & Adventure */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Action & Adventure"
            items={actionAdventure}
            type="movie"
          />
        </div>
      </section>

      {/* Comedy */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Comedy"
            items={comedy}
            type="movie"
          />
        </div>
      </section>

      {/* Anime */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Anime"
            items={anime}
            type="tv"
          />
        </div>
      </section>

      {/* Featured This Week */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="Featured This Week"
            items={[...trendingMovies.slice(0, 4), ...popularTV.slice(0, 4)]}
            type="movie"
          />
        </div>
      </section>

      {/* My List */}
      <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
        <div className="container mx-auto">
          <ContentCarousel
            title="My List"
            items={myList.length > 0 ? myList : trendingMovies.slice(0, 5)}
            type="movie"
          />
        </div>
      </section>

      {/* Only on Netflix */}
      {netflixContent.length > 0 && (
        <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
          <div className="container mx-auto">
            <ContentCarousel
              title="Only on Netflix"
              items={netflixContent}
              type="movie"
            />
          </div>
        </section>
      )}

      {/* Only on Prime Video */}
      {primeContent.length > 0 && (
        <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
          <div className="container mx-auto">
            <ContentCarousel
              title="Only on Prime Video"
              items={primeContent}
              type="movie"
            />
          </div>
        </section>
      )}

      {/* Only on Disney+ */}
      {disneyContent.length > 0 && (
        <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
          <div className="container mx-auto">
            <ContentCarousel
              title="Only on Disney+"
              items={disneyContent}
              type="movie"
            />
          </div>
        </section>
      )}

      {/* Only on Apple TV+ */}
      {appleContent.length > 0 && (
        <section className="py-16 px-6 md:px-12 lg:px-16 animate-fade-in">
          <div className="container mx-auto">
            <ContentCarousel
              title="Only on Apple TV+"
              items={appleContent}
              type="movie"
            />
          </div>
        </section>
      )}
    </div>
  )
}
