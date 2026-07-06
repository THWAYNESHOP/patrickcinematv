import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SportsPlayer from './SportsPlayer'
import { sportsApi } from '../api/sports'

vi.mock('../api/sports', async () => {
  const actual = await vi.importActual<typeof import('../api/sports')>('../api/sports')
  return {
    ...actual,
    sportsApi: {
      ...actual.sportsApi,
      getStreams: vi.fn(),
    },
  }
})

const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

vi.mock('../hooks/useToast', () => ({
  useToast: () => mockToast,
}))

const mockedGetStreams = vi.mocked(sportsApi.getStreams)

describe('SportsPlayer', () => {
  beforeEach(() => {
    mockedGetStreams.mockReset()
    Object.values(mockToast).forEach((fn) => fn.mockReset())
  })

  it('renders a safe fallback when navigation leaves no streams selected', async () => {
    mockedGetStreams
      .mockResolvedValueOnce([
        {
          id: 'stream-1',
          streamNo: 1,
          language: 'English',
          hd: true,
          embedUrl: 'https://example.com/1',
          source: 'alpha',
        },
        {
          id: 'stream-2',
          streamNo: 2,
          language: 'Spanish',
          hd: true,
          embedUrl: 'https://example.com/2',
          source: 'alpha',
        },
      ])
      .mockResolvedValueOnce([])

    const router = createMemoryRouter(
      [{ path: '/sports/:source/:id', element: <SportsPlayer /> }],
      { initialEntries: ['/sports/alpha/123'] }
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText(/Stream 1 of 2/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Spanish HD/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Spanish HD/i })).toHaveClass('bg-primary')
    })

    await router.navigate('/sports/beta/456')

    await waitFor(() => {
      expect(screen.getByText(/No streams available/i)).toBeInTheDocument()
    })
  })
})
