import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import JumpstartRecognition, { JUMPSTART_URL } from './JumpstartRecognition.jsx'

describe('JumpstartRecognition', () => {
  it('links the official Jump$tart listing throughout player routes', () => {
    render(
      <MemoryRouter initialEntries={['/world']}>
        <JumpstartRecognition />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link')).toHaveAttribute('href', JUMPSTART_URL)
    expect(screen.getByText(/Featured in Jump\$tart Clearinghouse/i)).toBeInTheDocument()
  })

  it('does not cover public informational pages', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <JumpstartRecognition />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
