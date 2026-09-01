import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import * as authHooks from '../../hooks/useAuth'
import AuthModal from './AuthModal'
import { useStore } from '../../store/useStore'

function RouteObserver() {
  const location = useLocation()
  return <div data-testid="current-path">{location.pathname}</div>
}

describe('AuthModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    mockOnClose.mockReset()
    vi.spyOn(authHooks, 'useAuth').mockReturnValue({
      signIn: vi.fn().mockResolvedValue(undefined),
      signUp: vi.fn().mockResolvedValue(undefined),
      resetPassword: vi.fn().mockResolvedValue(undefined),
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signInWithGithub: vi.fn().mockResolvedValue(undefined),
    } as any)
    useStore.setState({
      user: null,
      pendingCardNavigation: null,
      isAuthModalOpen: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render login form by default', () => {
    render(
      <MemoryRouter>
        <AuthModal onClose={mockOnClose} />
      </MemoryRouter>
    )

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('should toggle between login and register modes', () => {
    render(
      <MemoryRouter>
        <AuthModal onClose={mockOnClose} />
      </MemoryRouter>
    )

    const toggleButton = screen.getByText(/sign up/i)
    act(() => fireEvent.click(toggleButton))

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
  })

  it('should close modal when close button is clicked', () => {
    render(
      <MemoryRouter>
        <AuthModal onClose={mockOnClose} />
      </MemoryRouter>
    )

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should show password strength indicator when typing password in register mode', () => {
    render(
      <MemoryRouter>
        <AuthModal onClose={mockOnClose} />
      </MemoryRouter>
    )

    act(() => fireEvent.click(screen.getByText(/sign up/i)))

    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } })

    expect(screen.getByText(/password strength/i)).toBeInTheDocument()
  })

  it('should wait to navigate until the auth state is set after a protected card login', async () => {
    const signIn = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(authHooks, 'useAuth').mockReturnValue({
      signIn,
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGithub: vi.fn(),
    } as any)

    useStore.setState({
      user: null,
      pendingCardNavigation: { type: 'movie', id: '123' },
      isAuthModalOpen: true,
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<><RouteObserver /><AuthModal onClose={mockOnClose} /></>} />
        </Routes>
      </MemoryRouter>
    )

    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')
    expect(form).not.toBeNull()

    await act(async () => {
      fireEvent.submit(form!)
    })

    expect(signIn).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('current-path')).toHaveTextContent('/')

    useStore.setState({
      user: { id: 'user-1', email: 'test@example.com', name: 'Tester' },
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-path')).toHaveTextContent('/movie/123')
    })
  })
})
