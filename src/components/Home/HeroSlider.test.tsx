import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HeroSlider from './HeroSlider'
import type { MovieSummary } from '../../api/tmdb'

const mockMovies: MovieSummary[] = [
  {
    id: 1,
    title: 'Test Movie 1',
    poster: 'https://example.com/poster1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w500/backdrop1.jpg',
    overview: 'Test overview 1',
    rating: '8.5',
    year: 2024,
    type: 'movie'
  },
  {
    id: 2,
    title: 'Test Movie 2',
    poster: 'https://example.com/poster2.jpg',
    backdrop: 'https://example.com/backdrop2.jpg',
    overview: 'Test overview 2',
    rating: '7.8',
    year: 2023,
    type: 'movie'
  }
]

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('HeroSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with movies', () => {
    renderWithRouter(<HeroSlider movies={mockMovies} />)
    
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Test overview 1')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })

  it('renders play and more info buttons', () => {
    renderWithRouter(<HeroSlider movies={mockMovies} />)
    
    expect(screen.getByText('Play')).toBeInTheDocument()
    expect(screen.getByText('More Info')).toBeInTheDocument()
  })

  it('navigates to next slide when next button is clicked', async () => {
    renderWithRouter(<HeroSlider movies={mockMovies} />)
    
    const nextButton = screen.getByLabelText('Next slide')
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument()
    })
  })

  it('navigates to previous slide when prev button is clicked', async () => {
    renderWithRouter(<HeroSlider movies={mockMovies} />)
    
    // First go to next slide
    const nextButton = screen.getByLabelText('Next slide')
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument()
    })
    
    // Then go back
    const prevButton = screen.getByLabelText('Previous slide')
    fireEvent.click(prevButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument()
    })
  })

  it('handles empty movies array gracefully', () => {
    const { container } = renderWithRouter(<HeroSlider movies={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays backdrop image with correct URL transformation', () => {
    renderWithRouter(<HeroSlider movies={mockMovies} />)
    
    const image = screen.getByAltText('Test Movie 1')
    expect(image).toHaveAttribute('src')
    expect(image?.getAttribute('src')).toContain('w1280')
  })

  it('does not append image sizes to custom backdrop URLs', () => {
    renderWithRouter(
      <HeroSlider
        movies={[
          {
            ...mockMovies[0],
            backdrop: 'https://example.com/custom-backdrop.jpg',
          },
        ]}
      />
    )

    expect(screen.getByAltText('Test Movie 1')).toHaveAttribute(
      'src',
      'https://example.com/custom-backdrop.jpg',
    )
  })

  it('has proper accessibility attributes', () => {
    renderWithRouter(<HeroSlider movies={mockMovies} />)
    
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Show slide 1: Test Movie 1')).toBeInTheDocument()
  })
})
