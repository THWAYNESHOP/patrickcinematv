import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import StreamingPlayer from './StreamingPlayer'

vi.mock('../../hooks/useTVDetection', () => ({
  useTVDetection: vi.fn(() => false),
}))

vi.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
}))

vi.mock('../../lib/streamingProviders', () => ({
  STREAMING_PROVIDERS: {
    vidlink: {
      displayName: 'VidLink',
      origin: 'https://example.com',
    },
  },
}))

describe('StreamingPlayer', () => {
  it('renders the player iframe and loading state', () => {
    render(<StreamingPlayer src="https://example.com/embed" providerId="vidlink" />)

    expect(screen.getByText('Loading player...')).toBeInTheDocument()
    expect(screen.getByTitle('VidLink Player')).toHaveAttribute('src', 'https://example.com/embed')
  })

  it('toggles stretch mode when the stretch button is pressed', () => {
    render(<StreamingPlayer src="https://example.com/embed" providerId="vidlink" />)

    const button = screen.getByRole('button', { name: /stretch video/i })
    const iframe = screen.getByTitle('VidLink Player')

    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(iframe).toHaveStyle({ transform: 'scale(1.2)' })
  })

  it('disables stretch while the player is fullscreen', () => {
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.body,
    })

    render(<StreamingPlayer src="https://example.com/embed" providerId="vidlink" />)

    const button = screen.getByRole('button', { name: /stretch video/i })
    const iframe = screen.getByTitle('VidLink Player')

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(iframe).toHaveStyle({ transform: 'scale(1)' })
  })
})
