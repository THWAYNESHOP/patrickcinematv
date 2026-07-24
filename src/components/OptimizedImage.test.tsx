import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OptimizedImage } from './OptimizedImage'

describe('OptimizedImage', () => {
  it('renders image with correct src and alt', () => {
    render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />)
    const img = screen.getByAltText('Test image')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('applies custom className', () => {
    render(<OptimizedImage src="https://example.com/image.jpg" alt="Test" className="custom-class" />)
    const img = screen.getByAltText('Test')
    expect(img).toHaveClass('custom-class')
  })

  it('sets loading attribute correctly', () => {
    render(<OptimizedImage src="https://example.com/image.jpg" alt="Test" loading="eager" />)
    const img = screen.getByAltText('Test')
    expect(img).toHaveAttribute('loading', 'eager')
  })
})
