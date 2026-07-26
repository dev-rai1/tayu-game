import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GuestModeButton from './GuestModeButton.jsx'
import { loadWallet } from '../services/walletStore.js'

vi.mock('../services/walletStore.js', () => ({
  loadWallet: vi.fn(),
}))

function renderGuestButton() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<GuestModeButton />} />
        <Route path="/avatar" element={<div>Avatar creator</div>} />
        <Route path="/world" element={<div>Saved world</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('guest mode', () => {
  beforeEach(() => loadWallet.mockReset())

  it('starts a new guest in the avatar creator', () => {
    loadWallet.mockReturnValue(null)
    renderGuestButton()
    fireEvent.click(screen.getByRole('button', { name: 'Play in guest mode' }))
    expect(screen.getByText('Avatar creator')).toBeInTheDocument()
  })

  it('returns a guest with saved progress to their world', () => {
    loadWallet.mockReturnValue({ week: 2 })
    renderGuestButton()
    fireEvent.click(screen.getByRole('button', { name: 'Play in guest mode' }))
    expect(screen.getByText('Saved world')).toBeInTheDocument()
  })
})
