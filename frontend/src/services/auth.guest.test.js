import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./walletStore.js', () => ({
  loadWallet: vi.fn(),
  saveWallet: vi.fn(),
  loadProfile: vi.fn(),
  saveProfile: vi.fn(),
}))

import { loadProfile, loadWallet, saveProfile, saveWallet } from './walletStore.js'
import { startGuestSession, syncUp } from './auth.js'

describe('guest progress persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('saves guest progress separately and restores it on the next demo visit', async () => {
    const wallet = { spend: 12, save: 10, give: 8, week: 2 }
    const profile = { name: 'Demo Player', assessment: { pre: { score: 3 } } }
    loadWallet.mockReturnValue(wallet)
    loadProfile.mockReturnValue(profile)

    startGuestSession()
    await syncUp()

    loadWallet.mockReturnValue({ spend: 99, save: 0, give: 0, week: 1 })
    loadProfile.mockReturnValue({ name: 'Different Account' })
    localStorage.setItem('tayu-session-v1', JSON.stringify({ email: 'account@example.com', role: 'student' }))

    startGuestSession()

    expect(saveWallet).toHaveBeenCalledWith(wallet)
    expect(saveProfile).toHaveBeenCalledWith(profile)
    expect(JSON.parse(localStorage.getItem('tayu-session-v1'))).toMatchObject({ guest: true })
  })

  it('does not fail when demo mode has no saved progress yet', () => {
    expect(() => startGuestSession()).not.toThrow()
    expect(saveWallet).not.toHaveBeenCalled()
    expect(saveProfile).not.toHaveBeenCalled()
  })
})
