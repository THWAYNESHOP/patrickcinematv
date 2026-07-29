import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchBar from './SearchBar'
import { tmdbApi } from '../../api/tmdb'

vi.mock('../../api/tmdb', () => ({
  tmdbApi: {
    searchMulti: vi.fn(),
  },
}))

function renderSearch(onClose = vi.fn()) {
  render(
    <MemoryRouter>
      <SearchBar onClose={onClose} />
    </MemoryRouter>,
  )

  return { onClose }
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('shows stored recent searches and can clear them', async () => {
    window.localStorage.setItem('nexastream-recent-searches', JSON.stringify(['Dune', 'NBA']))

    const user = userEvent.setup()
    renderSearch()

    const recentHeading = await screen.findByRole('heading', { name: /Recent Searches/i })
    const recentSection = recentHeading.closest('section')
    expect(recentSection).toBeInTheDocument()

    expect(within(recentSection!).getByRole('button', { name: /^Dune$/i })).toBeInTheDocument()
    expect(within(recentSection!).getByRole('button', { name: /^NBA$/i })).toBeInTheDocument()

    await user.click(within(recentSection!).getByRole('button', { name: /Clear/i }))

    expect(window.localStorage.getItem('nexastream-recent-searches')).toBe('[]')
    expect(within(recentSection!).queryByRole('button', { name: /^Dune$/i })).not.toBeInTheDocument()
  })

  it('groups search results and stores a successful search', async () => {
    vi.mocked(tmdbApi.searchMulti).mockResolvedValue([
      {
        id: 693134,
        title: 'Dune: Part Two',
        poster: 'https://example.com/dune.jpg',
        rating: '7.8',
        year: 2024,
        type: 'movie',
      },
      {
        id: 90228,
        title: 'Dune: Prophecy',
        poster: 'https://example.com/prophecy.jpg',
        rating: '7.2',
        year: 2024,
        type: 'tv',
      },
    ])

    const user = userEvent.setup()
    const { onClose } = renderSearch()

    await user.type(screen.getByRole('textbox', { name: /search content/i }), 'Dune')

    const movieHeading = await screen.findByRole('heading', { name: /Movies/i })
    const tvHeading = await screen.findByRole('heading', { name: /TV Shows/i })

    const movieSection = movieHeading.closest('section')
    expect(movieSection).toBeInTheDocument()
    expect(within(movieSection!).getByRole('button', { name: /Dune: Part Two/i })).toBeInTheDocument()

    const tvSection = tvHeading.closest('section')
    expect(tvSection).toBeInTheDocument()
    expect(within(tvSection!).getByRole('button', { name: /Dune: Prophecy/i })).toBeInTheDocument()

    await user.click(within(movieSection!).getByRole('button', { name: /Dune: Part Two/i }))

    expect(window.localStorage.getItem('nexastream-recent-searches')).toContain('Dune')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
