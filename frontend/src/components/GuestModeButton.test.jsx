import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GuestModeButton from './GuestModeButton.jsx'
import { loadProfile, loadWallet } from '../services/walletStore.js'
import { startGuestSession } from '../services/auth.js'

vi.mock('../services/walletStore.js', () => ({
  loadProfile: vi.fn(),
  loadWallet: vi.fn(),
}))

vi.mock('../services/auth.js', () => ({
  startGuestSession: vi.fn(),
}))

function renderGuestButton() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<GuestModeButton />} />
        <Route path="/assessment/pre" element={<div>Money check-in</div>} />
        <Route path="/avatar" element={<div>Avatar creator</div>} />
        <Route path="/world" element={<div>Saved world</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('guest mode', () => {
  beforeEach(() => {
    localStorage.clear()
    loadProfile.mockReset()
    loadWallet.mockReset()
    startGuestSession.mockReset()
  })

  it('creates a guest session and starts new guests at the pre-game check-in', () => {
    loadProfile.mockReturnValue(null)
    renderGuestButton()

    fireEvent.click(screen.getByRole('button', { name: 'Play in guest mode' }))

    expect(startGuestSession).toHaveBeenCalledOnce()
    expect(screen.getByText('Money check-in')).toBeInTheDocument()
  })

  it('starts a guest who completed the check-in in the avatar creator', () => {
    loadProfile.mockReturnValue({ assessment: { pre: { score: 2 } } })
    loadWallet.mockReturnValue(null)
    renderGuestButton()

    fireEvent.click(screen.getByRole('button', { name: 'Play in guest mode' }))

    expect(startGuestSession).toHaveBeenCalledOnce()
    expect(screen.getByText('Avatar creator')).toBeInTheDocument()
  })

  it('returns a guest with saved progress to their world', () => {
    loadProfile.mockReturnValue({ assessment: { pre: { score: 2 } } })
    loadWallet.mockReturnValue({ week: 2 })
    renderGuestButton()

    fireEvent.click(screen.getByRole('button', { name: 'Play in guest mode' }))

    expect(startGuestSession).toHaveBeenCalledOnce()
    expect(screen.getByText('Saved world')).toBeInTheDocument()
  })
})
