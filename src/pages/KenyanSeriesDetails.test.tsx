import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import KenyanSeriesDetails from './KenyanSeriesDetails'
import { ToastProvider } from '../hooks/useToast'

describe('KenyanSeriesDetails', () => {
  it('shows the premium Ayana hero layout with latest episodes', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /^AYANA$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /play latest episode/i })).toBeInTheDocument()
    expect(screen.getByText(/Latest Episodes/i)).toBeInTheDocument()
    expect(screen.getAllByText(/AYANA \| Citizen TV \| Wednesday 8th July \| Part 1/i).length).toBeGreaterThan(0)
  })

  it('shows the Lulu page without Ayana branding', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lulu']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getByRole('heading', { level: 1, name: /^Lulu$/i })).toBeInTheDocument()
    expect(screen.queryByText(/AYANA/i)).not.toBeInTheDocument()
    expect(screen.getByText(/6TH MONDAY/i)).toBeInTheDocument()
  })

  it('shows a dedicated play prompt before opening the episode player', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lulu']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getByRole('button', { name: /play episode/i })).toBeInTheDocument()
  })

  it('launches the episode player unmuted and with fullscreen support', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lulu']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /play episode/i }))

    const iframe = screen.getByTitle(/episode player/i)
    expect(iframe).toHaveAttribute('src', expect.stringContaining('mute=0'))
    expect(iframe).toHaveAttribute('allow', expect.stringContaining('fullscreen'))
  })

  it('opens the episode player when an episode card is selected', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    fireEvent.click(screen.getAllByRole('button', { name: /watch/i })[0])

    expect(screen.getByTitle(/episode player/i)).toBeInTheDocument()
    expect(screen.getAllByText(/AYANA \| Citizen TV \| Wednesday 8th July \| Part 1/i).length).toBeGreaterThan(0)
  })
})
