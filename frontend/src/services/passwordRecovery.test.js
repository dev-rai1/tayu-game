import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
  prepareFirebaseAuth: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
}))

vi.mock('./firebase.js', () => ({
  prepareFirebaseAuth: mocks.prepareFirebaseAuth,
}))

import { requestPasswordReset } from './passwordRecovery.js'

const firebase = { auth: { languageCode: null } }

describe('password recovery', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mocks.prepareFirebaseAuth.mockResolvedValue(firebase)
    mocks.sendPasswordResetEmail.mockResolvedValue(undefined)
  })

  it('normalizes the email and sends a reset link back to the TAYU login page', async () => {
    const result = await requestPasswordReset(' Student@Example.com ')

    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(
      firebase.auth,
      'student@example.com',
      expect.objectContaining({
        url: expect.stringContaining('/login?mode=signin&reset=complete'),
        handleCodeInApp: false,
      }),
    )
    expect(firebase.auth.languageCode).toBe('en')
    expect(result).toMatchObject({
      email: 'student@example.com',
      legacyActivationAvailable: false,
    })
    expect(result.message).toContain('Inbox, Spam, and Promotions')
  })

  it('retries with the Firebase hosted handler when the custom return URL is rejected', async () => {
    mocks.sendPasswordResetEmail
      .mockRejectedValueOnce({ code: 'auth/invalid-continue-uri' })
      .mockResolvedValueOnce(undefined)

    await requestPasswordReset('student@example.com')

    expect(mocks.sendPasswordResetEmail).toHaveBeenNthCalledWith(
      1,
      firebase.auth,
      'student@example.com',
      expect.any(Object),
    )
    expect(mocks.sendPasswordResetEmail).toHaveBeenNthCalledWith(
      2,
      firebase.auth,
      'student@example.com',
    )
  })

  it('offers account activation when the email belongs to an older device-only account', async () => {
    localStorage.setItem('tayu-accounts-v1', JSON.stringify({
      'student@example.com': {
        email: 'student@example.com',
        role: 'student',
        gradeLevels: '6-8',
        foundVia: 'school',
        organizationName: 'Oakton High School',
        migratedToFirebase: false,
      },
    }))

    const result = await requestPasswordReset('student@example.com')

    expect(result).toMatchObject({
      legacyActivationAvailable: true,
      activationProfile: {
        role: 'student',
        gradeLevels: '6-8',
        foundVia: 'school',
        organizationName: 'Oakton High School',
      },
    })
  })

  it('shows a useful Firebase error instead of claiming success', async () => {
    mocks.sendPasswordResetEmail.mockRejectedValue({ code: 'auth/too-many-requests' })

    await expect(requestPasswordReset('student@example.com')).rejects.toThrow('Too many reset attempts')
  })
})
