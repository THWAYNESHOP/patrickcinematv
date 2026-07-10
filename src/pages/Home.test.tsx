import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import Home from './Home'
import { useContinueWatching } from '../hooks/useContinueWatching'

vi.mock('../components/Home/HeroSlider', () => ({ default: () => <div data-testid="hero-slider" /> }))
vi.mock('../components/Home/ContentCarousel', () => ({ default: ({ title }: { title: string }) => <div>{title}</div> }))
vi.mock('../components/Sports/LiveMatches', () => ({ default: () => <div>Live Matches</div> }))
vi.mock('../hooks/useMyList', () => ({ useMyList: () => ({ myList: [] }) }))
vi.mock('../hooks/useContinueWatching', () => ({ useContinueWatching: vi.fn() }))
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
    vi.mocked(useContinueWatching).mockReturnValue({
      continueWatching: [],
      updateProgress: vi.fn(),
      removeFromContinueWatching: vi.fn(),
      clearContinueWatching: vi.fn(),
    } as ReturnType<typeof useContinueWatching>)
  })

  it('shows the Kenyan series poster strip without the old featured-series copy', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(screen.queryByText(/Featured series/i)).not.toBeInTheDocument()
    expect(await screen.findAllByRole('img', { name: /AYANA|Lulu|Lazizi/i })).toHaveLength(3)
    expect(screen.getByRole('link', { name: /AYANA/i })).toHaveAttribute('href', '/kenyan-series/ayana')
    expect(screen.getByRole('link', { name: /Lulu/i })).toHaveAttribute('href', '/kenyan-series/lulu')
    expect(screen.getByRole('link', { name: /Lazizi/i })).toHaveAttribute('href', '/kenyan-series/lazizi')
  })

  it('shows a recommendation rail when the user has continue watching items', async () => {
    vi.mocked(useContinueWatching).mockReturnValue({
      continueWatching: [{ id: 'sample', title: 'Sample Series', poster: '/sample.jpg', type: 'tv', progress: 40, timestamp: Date.now() }],
      updateProgress: vi.fn(),
      removeFromContinueWatching: vi.fn(),
      clearContinueWatching: vi.fn(),
    } as ReturnType<typeof useContinueWatching>)

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /Recommended for you/i })).toBeInTheDocument()
  })
})
