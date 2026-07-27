import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  prepareFirebaseAuth: vi.fn(),
  getFirebaseServices: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  increment: vi.fn((value) => ({ __increment: value })),
  loadWallet: vi.fn(),
  saveWallet: vi.fn(),
  loadProfile: vi.fn(),
  saveProfile: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  signOut: mocks.signOut,
  onAuthStateChanged: mocks.onAuthStateChanged,
}))

vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: vi.fn((_, name) => name),
  doc: vi.fn((_, collectionName, id) => `${collectionName}/${id}`),
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  increment: mocks.increment,
  setDoc: mocks.setDoc,
}))

vi.mock('./firebase.js', () => ({
  isFirebaseConfigured: vi.fn(() => false),
  prepareFirebaseAuth: mocks.prepareFirebaseAuth,
  getFirebaseServices: mocks.getFirebaseServices,
}))

vi.mock('./walletStore.js', () => ({
  loadWallet: mocks.loadWallet,
  saveWallet: mocks.saveWallet,
  loadProfile: mocks.loadProfile,
  saveProfile: mocks.saveProfile,
}))

import { resetPassword, signIn, signUp } from './auth.js'

const firebase = { auth: { name: 'auth' }, firestore: { name: 'firestore' } }

describe('Firebase cloud account migration, activity, and reset', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
    mocks.prepareFirebaseAuth.mockResolvedValue(firebase)
    mocks.getFirebaseServices.mockReturnValue(firebase)
    mocks.getDoc.mockResolvedValue({ exists: () => false, data: () => null })
    mocks.getDocs.mockResolvedValue({ docs: [] })
    mocks.addDoc.mockResolvedValue({ id: 'activity-1' })
    mocks.sendPasswordResetEmail.mockResolvedValue(undefined)
    mocks.setDoc.mockResolvedValue(undefined)
  })

  it('uses the Firebase hosted password-reset handler without a custom continue URL', async () => {
    const message = await resetPassword('Student@Example.com')

    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(firebase.auth, 'student@example.com')
    expect(message).toContain('password-reset link was sent')
  })

  it('explains how to activate an older device-only account in Firebase', async () => {
    localStorage.setItem('tayu-accounts-v1', JSON.stringify({
      'student@example.com': {
        email: 'student@example.com',
        role: 'student',
        needsPassword: false,
      },
    }))
    mocks.signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' })

    await expect(signIn('student@example.com', 'password123')).rejects.toThrow('has not been activated')
  })

  it('uploads saved local progress when the same email signs up for Firebase', async () => {
    const progress = {
      wallet: { spend: 12, save: 10, give: 8 },
      profile: { name: 'Legacy Player' },
      savedAt: '2026-07-27T12:00:00.000Z',
    }
    localStorage.setItem('tayu-accounts-v1', JSON.stringify({
      'student@example.com': {
        email: 'student@example.com',
        role: 'student',
        gradeLevels: '6-8',
        createdAt: '2026-07-01T12:00:00.000Z',
        progress,
      },
    }))
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'firebase-user-1', email: 'student@example.com' },
    })

    const result = await signUp({
      email: 'Student@Example.com',
      password: 'password123',
      role: 'student',
      gradeLevels: '',
      foundVia: '',
      organizationName: 'Oakton High School',
    })

    expect(result.migrated).toBe(true)
    expect(mocks.saveWallet).toHaveBeenCalledWith(progress.wallet)
    expect(mocks.saveProfile).toHaveBeenCalledWith(progress.profile)
    expect(mocks.setDoc).toHaveBeenCalledWith(
      'progress/firebase-user-1',
      expect.objectContaining({ data: progress, updatedAt: progress.savedAt }),
      { merge: true },
    )
    expect(mocks.addDoc).toHaveBeenCalledWith(
      'authActivity',
      expect.objectContaining({
        uid: 'firebase-user-1',
        email: 'student@example.com',
        type: 'sign_up',
      }),
    )
    expect(JSON.parse(localStorage.getItem('tayu-accounts-v1'))['student@example.com']).toMatchObject({
      migratedToFirebase: true,
      firebaseUid: 'firebase-user-1',
    })
  })

  it('records a successful login and increments the profile login count', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'firebase-user-2', email: 'student@example.com' },
    })
    mocks.getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'student' }) })
      .mockResolvedValueOnce({ exists: () => false, data: () => null })

    await signIn('student@example.com', 'password123')

    expect(mocks.increment).toHaveBeenCalledWith(1)
    expect(mocks.setDoc).toHaveBeenCalledWith(
      'profiles/firebase-user-2',
      expect.objectContaining({
        lastLoginAt: expect.any(String),
        lastActiveAt: expect.any(String),
        loginCount: { __increment: 1 },
      }),
      { merge: true },
    )
    expect(mocks.addDoc).toHaveBeenCalledWith(
      'authActivity',
      expect.objectContaining({
        uid: 'firebase-user-2',
        email: 'student@example.com',
        type: 'sign_in',
      }),
    )
  })
})
