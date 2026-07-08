import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
