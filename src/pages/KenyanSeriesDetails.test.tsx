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

  it('shows the new Ayana Friday Part 2 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/10TH FRIDAY PART 2/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 13th Monday Part 1 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/13TH MONDAY PART 1/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 13th Monday Part 2 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/13TH MONDAY PART 2/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 14th Tuesday Part 1 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/14TH TUESDAY PART 1/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 14th Tuesday Part 2 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/14TH TUESDAY PART 2/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 15th Wednesday Part 1 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/15TH WEDNESDAY PART 1/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 15th Wednesday Part 2 episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/15TH WEDNESDAY PART 2/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 16th Thursday full episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/16TH THURSDAY FULL EPISODE/i).length).toBeGreaterThan(0)
  })

  it('shows the new Ayana 17th Friday full episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/ayana']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/17TH FRIDAY FULL EPISODE/i).length).toBeGreaterThan(0)
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

  it('shows the new Lulu 10th Friday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lulu']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/10TH FRIDAY/i).length).toBeGreaterThan(0)
  })

  it('shows the new Lulu 13th Monday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lulu']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/13TH MONDAY/i).length).toBeGreaterThan(0)
  })

  it('shows the new Lulu 14th Tuesday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lulu']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/14TH TUESDAY/i).length).toBeGreaterThan(0)
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

  it('shows the latest Lazizi Thursday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lazizi']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/9TH THURSDAY/i).length).toBeGreaterThan(0)
  })

  it('shows the new Lazizi 10th Friday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lazizi']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/10TH FRIDAY/i).length).toBeGreaterThan(0)
  })

  it('shows the new Lazizi 13th Monday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lazizi']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/13TH MONDAY/i).length).toBeGreaterThan(0)
  })

  it('shows the new Lazizi 14th Tuesday episode', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/lazizi']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/14TH TUESDAY/i).length).toBeGreaterThan(0)
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

  it('shows the new Second Family Episode 1 entry', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/second-family']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.getAllByText(/Episode 1/i).length).toBeGreaterThan(0)
  })

  it('loads the provided embed URL for Second Family Episode 1', () => {
    render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/kenyan-series/second-family']}>
          <Routes>
            <Route path="/kenyan-series/:id" element={<KenyanSeriesDetails />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /play episode/i }))

    const iframe = screen.getByTitle(/episode player/i)
    expect(iframe).toHaveAttribute('src', expect.stringContaining('fembed.co/embed/tO4M-lw_fav8l'))
  })
})
