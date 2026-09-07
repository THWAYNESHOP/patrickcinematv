import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import KenyanSeriesAdmin from './KenyanSeriesAdmin'

const mockSignIn = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
  }),
}))

describe('KenyanSeriesAdmin', () => {
  beforeEach(() => {
    mockSignIn.mockReset()
  })

  it('shows an admin sign-in form when no user is authenticated', async () => {
    render(<KenyanSeriesAdmin />)

    expect(screen.getByRole('heading', { name: /Kenyan Series Admin/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'secret123')
  })
})
