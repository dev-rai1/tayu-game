import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getDoc: vi.fn(),
  prepareFirebaseAuth: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_, collectionName, id) => `${collectionName}/${id}`),
  getDoc: mocks.getDoc,
}))

vi.mock('./firebase.js', () => ({
  prepareFirebaseAuth: mocks.prepareFirebaseAuth,
}))

import { verifyAdminAccess } from './adminAccess.js'

describe('protected admin access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.prepareFirebaseAuth.mockResolvedValue({
      auth: { currentUser: { uid: 'admin-uid', email: 'admin@example.com' } },
      firestore: { name: 'firestore' },
    })
  })

  it('grants access only when the signed-in Firebase user has an admin profile', async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' }),
    })

    const result = await verifyAdminAccess({
      id: 'admin-uid',
      email: 'stale@example.com',
      role: 'student',
    })

    expect(result).toEqual({
      id: 'admin-uid',
      email: 'admin@example.com',
      role: 'admin',
      cloud: true,
    })
    expect(mocks.getDoc).toHaveBeenCalledWith('profiles/admin-uid')
  })

  it('rejects a profile that is not marked admin', async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'student' }),
    })

    await expect(verifyAdminAccess({ id: 'admin-uid' })).resolves.toBeNull()
  })

  it('rejects missing protected profiles', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) })

    await expect(verifyAdminAccess({ id: 'admin-uid' })).resolves.toBeNull()
  })

  it('does not trust a local user whose id differs from the authenticated Firebase uid', async () => {
    const result = await verifyAdminAccess({
      id: 'different-uid',
      email: 'admin@example.com',
      role: 'admin',
    })

    expect(result).toBeNull()
    expect(mocks.getDoc).not.toHaveBeenCalled()
  })

  it('requires an authenticated Firebase user and Firestore', async () => {
    mocks.prepareFirebaseAuth.mockResolvedValue({ auth: { currentUser: null }, firestore: { name: 'firestore' } })
    await expect(verifyAdminAccess({ id: 'admin-uid' })).resolves.toBeNull()

    mocks.prepareFirebaseAuth.mockResolvedValue({ auth: { currentUser: { uid: 'admin-uid' } }, firestore: null })
    await expect(verifyAdminAccess({ id: 'admin-uid' })).resolves.toBeNull()
    expect(mocks.getDoc).not.toHaveBeenCalled()
  })

  it('fails closed when the protected profile lookup errors', async () => {
    mocks.getDoc.mockRejectedValue(new Error('permission denied'))

    await expect(verifyAdminAccess({ id: 'admin-uid' })).resolves.toBeNull()
  })
})
