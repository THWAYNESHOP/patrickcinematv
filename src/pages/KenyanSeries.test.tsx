import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import KenyanSeries from './KenyanSeries'

describe('KenyanSeries', () => {
  it('renders the section heading and content cards', () => {
    render(
      <MemoryRouter>
        <KenyanSeries />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Kenyan Series', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Browse the latest Kenyan series cards directly from this section/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/kenyan-series/')).length).toBeGreaterThan(0)
  })
})
