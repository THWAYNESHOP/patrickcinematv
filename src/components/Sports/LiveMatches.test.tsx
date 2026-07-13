import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LiveMatches from './LiveMatches'
import * as sportsApi from '../../api/sports'

const mockMatches = [
  {
    id: '1',
    title: 'Match 1',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    score: '2 - 1',
    time: '75\'',
    league: 'Premier League',
    sport: 'football',
    poster: 'https://example.com/poster1.jpg',
    sources: [{ source: 'streamed', id: 'match1' }]
  },
  {
    id: '2',
    title: 'Match 2',
    homeTeam: 'Team C',
    awayTeam: 'Team D',
    score: '0 - 0',
    time: '30\'',
    league: 'La Liga',
    sport: 'football',
    poster: 'https://example.com/poster2.jpg',
    sources: [{ source: 'streamed', id: 'match2' }]
  }
]

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LiveMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeleton initially', () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockImplementation(() => new Promise(() => {}))
    const { container } = renderWithRouter(<LiveMatches />)

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(5)
  })

  it('renders matches after loading', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue(mockMatches)
    
    renderWithRouter(<LiveMatches />)
    
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument()
      expect(screen.getByText('Team B')).toBeInTheDocument()
      expect(screen.getByText('2 - 1')).toBeInTheDocument()
    })
  })

  it('renders error state on fetch failure', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockRejectedValue(new Error('Network error'))
    
    renderWithRouter(<LiveMatches />)
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to load matches/i)).toBeInTheDocument()
    })
  })

  it('renders empty state when no matches found', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue([])
    
    renderWithRouter(<LiveMatches />)
    
    await waitFor(() => {
      expect(screen.getByText(/No live matches found/i)).toBeInTheDocument()
    })
  })

  it('respects limit prop', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue(mockMatches)
    
    renderWithRouter(<LiveMatches limit={1} />)
    
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument()
      expect(screen.queryByText('Team C')).not.toBeInTheDocument()
    })
  })

  it('filters by sport when sport prop is provided', async () => {
    const mixedMatches = [
      ...mockMatches,
      {
        id: '3',
        title: 'Match 3',
        homeTeam: 'Team E',
        awayTeam: 'Team F',
        score: '1 - 0',
        time: '45\'',
        league: 'NBA',
        sport: 'basketball',
        poster: 'https://example.com/poster3.jpg',
        sources: [{ source: 'streamed', id: 'match3' }]
      }
    ]
    
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue(mixedMatches)
    
    renderWithRouter(<LiveMatches sport="football" />)
    
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument()
      expect(screen.queryByText('Team E')).not.toBeInTheDocument()
    })
  })

  it('renders upcoming matches when variant is upcoming', async () => {
    vi.spyOn(sportsApi, 'getUpcomingMatches').mockResolvedValue(mockMatches)
    
    renderWithRouter(<LiveMatches variant="upcoming" />)

    expect(await screen.findByText('Team A')).toBeInTheDocument()
    const upcomingBadges = await screen.findAllByText('UPCOMING')
    expect(upcomingBadges.length).toBeGreaterThan(0)
  })

  it('displays LIVE badge for live matches', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue(mockMatches)
    
    renderWithRouter(<LiveMatches />)

    const liveBadges = await screen.findAllByText('LIVE')
    expect(liveBadges.length).toBeGreaterThan(0)
  })

  it('renders match posters when available', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue(mockMatches)
    
    renderWithRouter(<LiveMatches />)
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })
  })

  it('has proper link to match details', async () => {
    vi.spyOn(sportsApi, 'getLiveMatches').mockResolvedValue(mockMatches)
    
    renderWithRouter(<LiveMatches />)
    
    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })
  })
})
