import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import AuthModal from './AuthModal'

describe('AuthModal', () => {
  const mockOnClose = vi.fn()

  it('should render login form by default', () => {
    render(<AuthModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('should toggle between login and register modes', () => {
    render(<AuthModal onClose={mockOnClose} />)
    
    const toggleButton = screen.getByText(/sign up/i)
    act(() => fireEvent.click(toggleButton))
    
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
  })

  it('should close modal when close button is clicked', () => {
    render(<AuthModal onClose={mockOnClose} />)
    
    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should show password strength indicator when typing password in register mode', () => {
    render(<AuthModal onClose={mockOnClose} />)
    
    // Switch to register mode
    act(() => fireEvent.click(screen.getByText(/sign up/i)))
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } })
    
    expect(screen.getByText(/password strength/i)).toBeInTheDocument()
  })
})
