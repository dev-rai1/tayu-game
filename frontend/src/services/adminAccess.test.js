import { beforeEach, describe, expect, it, vi } from 'vitest'

const PASSWORD_HASH = 'faef517dac0d52529db44ce91f07a860efebc208abcf4c8e8530e85fa300e512'
const hashBytes = Uint8Array.from(PASSWORD_HASH.match(/../g).map((value) => Number.parseInt(value, 16)))

const mocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  prepareFirebaseAuth: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_, collectionName, id) => `${collectionName}/${id}`),
  setDoc: mocks.setDoc,
}))

vi.mock('./firebase.js', () => ({
  prepareFirebaseAuth: mocks.prepareFirebaseAuth,
}))

import {
  DASHBOARD_VIEWER_EMAIL,
  ensureAdminAccess,
  isAdminEmail,
  isDashboardViewerEmail,
  openDashboardWithPassword,
} from './adminAccess.js'

describe('admin access bootstrap', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn(async () => hashBytes.buffer),
      },
    })
    mocks.prepareFirebaseAuth.mockResolvedValue({
      auth: { currentUser: { uid: 'admin-uid' } },
      firestore: { name: 'firestore' },
    })
    mocks.setDoc.mockResolvedValue(undefined)
  })

  it('recognizes approved admins and the dedicated dashboard viewer', () => {
    expect(isAdminEmail(' TAYU.FINANCE@GMAIL.COM ')).toBe(true)
    expect(isAdminEmail('devr53247@gmail.com')).toBe(true)
    expect(isAdminEmail('student@example.com')).toBe(false)
    expect(isDashboardViewerEmail(` ${DASHBOARD_VIEWER_EMAIL.toUpperCase()} `)).toBe(true)
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

  it('opens the dashboard with the hidden Firebase viewer account', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'viewer-uid', email: DASHBOARD_VIEWER_EMAIL },
    })

    const result = await openDashboardWithPassword('provided-secret')

    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      DASHBOARD_VIEWER_EMAIL,
      'provided-secret',
    )
    expect(result).toMatchObject({
      id: 'viewer-uid',
      email: DASHBOARD_VIEWER_EMAIL,
      role: 'admin',
      accountType: 'dashboard_viewer',
    })
    expect(mocks.setDoc).toHaveBeenCalledWith(
      'profiles/viewer-uid',
      expect.objectContaining({
        email: DASHBOARD_VIEWER_EMAIL,
        role: 'admin',
        accountType: 'dashboard_viewer',
      }),
      { merge: true },
    )
  })

  it('initializes the viewer account on its first correct use', async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' })
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'new-viewer-uid', email: DASHBOARD_VIEWER_EMAIL },
    })

    await openDashboardWithPassword('provided-secret')

    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      DASHBOARD_VIEWER_EMAIL,
      'provided-secret',
    )
  })

  it('rejects an incorrect password before contacting Firebase', async () => {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn(async () => new Uint8Array(32).buffer),
      },
    })

    await expect(openDashboardWithPassword('wrong-secret')).rejects.toThrow('Incorrect dashboard password')
    expect(mocks.prepareFirebaseAuth).not.toHaveBeenCalled()
    expect(mocks.signInWithEmailAndPassword).not.toHaveBeenCalled()
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
