import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  prepareFirebaseAuth: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_, collectionName, id) => `${collectionName}/${id}`),
  setDoc: mocks.setDoc,
}))

vi.mock('./firebase.js', () => ({
  prepareFirebaseAuth: mocks.prepareFirebaseAuth,
}))

import { ensureAdminAccess, isAdminEmail } from './adminAccess.js'

describe('admin access bootstrap', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    mocks.prepareFirebaseAuth.mockResolvedValue({
      auth: { currentUser: { uid: 'admin-uid' } },
      firestore: { name: 'firestore' },
    })
    mocks.setDoc.mockResolvedValue(undefined)
  })

  it('recognizes only the approved TAYU admin emails', () => {
    expect(isAdminEmail(' TAYU.FINANCE@GMAIL.COM ')).toBe(true)
    expect(isAdminEmail('devr53247@gmail.com')).toBe(true)
    expect(isAdminEmail('student@example.com')).toBe(false)
  })

  it('promotes an approved signed-in account and repairs its cloud profile', async () => {
    sessionStorage.setItem('tayu-session-v1', JSON.stringify({
      id: 'admin-uid',
      email: 'devr53247@gmail.com',
      role: 'student',
      cloud: true,
    }))

    const result = await ensureAdminAccess({
      email: 'DEVR53247@gmail.com',
      role: 'student',
    })

    expect(result).toMatchObject({
      id: 'admin-uid',
      email: 'devr53247@gmail.com',
      role: 'admin',
    })
    expect(JSON.parse(sessionStorage.getItem('tayu-session-v1'))).toMatchObject({
      email: 'devr53247@gmail.com',
      role: 'admin',
    })
    expect(mocks.setDoc).toHaveBeenCalledWith(
      'profiles/admin-uid',
      expect.objectContaining({
        email: 'devr53247@gmail.com',
        role: 'admin',
        lastActiveAt: expect.any(String),
      }),
      { merge: true },
    )
  })

  it('does not promote ordinary player accounts', async () => {
    const result = await ensureAdminAccess({
      id: 'student-uid',
      email: 'student@example.com',
      role: 'student',
    })

    expect(result).toBeNull()
    expect(mocks.prepareFirebaseAuth).not.toHaveBeenCalled()
    expect(mocks.setDoc).not.toHaveBeenCalled()
  })
})
