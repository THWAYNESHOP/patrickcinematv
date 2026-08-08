import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Home from './Home'

vi.mock('../components/Home/HeroSlider', () => ({ default: () => <div data-testid="hero-slider" /> }))
vi.mock('../components/Home/ContentCarousel', () => ({ default: ({ title }: { title: string }) => <div>{title}</div> }))
vi.mock('../components/Sports/LiveMatches', () => ({ default: () => <div>Live Matches</div> }))
vi.mock('../hooks/useMyList', () => ({ useMyList: () => ({ myList: [] }) }))
vi.mock('../hooks/useContinueWatching', () => ({ useContinueWatching: () => ({ continueWatching: [] }) }))
vi.mock('../hooks/usePullToRefresh', () => ({ usePullToRefresh: () => ({ containerRef: { current: null }, isPulling: false, pullDistance: 0, isRefreshing: false }) }))
vi.mock('../hooks/useToast', () => ({ useToast: () => ({ error: vi.fn(), warning: vi.fn(), success: vi.fn() }) }))
vi.mock('../hooks/usePageState', () => ({ usePageState: () => ({ getCarouselPosition: vi.fn(), setCarouselPosition: vi.fn(), getFocusedCardId: vi.fn(), setFocusedCardId: vi.fn() }) }))

vi.mock('../api/tmdb', () => ({
  tmdbApi: {
    getNowPlayingMovies: vi.fn().mockResolvedValue([]),
    getTrendingMoviesToday: vi.fn().mockResolvedValue([]),
    getTrendingTVToday: vi.fn().mockResolvedValue([]),
    getMoviesByGenre: vi.fn().mockResolvedValue([]),
    getTVByGenre: vi.fn().mockResolvedValue([]),
    getTVByOriginCountry: vi.fn().mockResolvedValue([]),
    getPlatformCatalog: vi.fn().mockResolvedValue({ movies: [], tv: [] }),
    prefetchMediaDetails: vi.fn(),
    getMovieDetails: vi.fn(),
    getMovieRecommendations: vi.fn(),
    getMovieVideos: vi.fn(),
    getTVDetails: vi.fn(),
    getTVRecommendations: vi.fn(),
    getTVVideos: vi.fn(),
  },
}))

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the Kenyan series poster strip without the old featured-series copy', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.queryByText(/Featured series/i)).not.toBeInTheDocument()
    expect(await screen.findAllByRole('img', { name: /AYANA|Lulu|Lazizi|SECOND FAMILY/i })).toHaveLength(4)
    expect(screen.getByRole('link', { name: /AYANA/i })).toHaveAttribute('href', '/kenyan-series/ayana')
    expect(screen.getByRole('link', { name: /Lulu/i })).toHaveAttribute('href', '/kenyan-series/lulu')
    expect(screen.getByRole('link', { name: /Lazizi/i })).toHaveAttribute('href', '/kenyan-series/lazizi')
    expect(screen.getByRole('link', { name: /SECOND FAMILY/i })).toHaveAttribute('href', '/kenyan-series/second-family')
  })
})
