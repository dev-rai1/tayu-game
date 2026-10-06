import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getDoc: vi.fn(),
  currentUser: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(), doc: vi.fn((_, name, id) => `${name}/${id}`),
  getDoc: mocks.getDoc, getDocs: vi.fn(), query: vi.fn(), setDoc: vi.fn(), where: vi.fn(),
}))
vi.mock('./firebase.js', () => ({ getFirebaseServices: () => ({ firestore: {} }) }))
vi.mock('./auth.js', () => ({ currentUser: mocks.currentUser }))

import { loadCurrentClassContext } from './classroom.js'

const snapshot = (id, data) => ({ id, exists: () => Boolean(data), data: () => data })
const student = { id: 'student-1', role: 'student' }
const classroom = { teacherEmail: 'teacher@example.com', settings: { enabledModules: [1, 2], allowSkip: false } }
const never = () => new Promise(() => {})

describe('module-menu classroom lookup', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.currentUser.mockReturnValue(student)
  })
  afterEach(() => vi.useRealTimers())

  it.each(['profiles', 'classes'])('bounds a stalled %s lookup', async (collectionName) => {
    mocks.getDoc.mockImplementation((path) => path.startsWith(collectionName)
      ? never()
      : Promise.resolve(snapshot(student.id, { classId: 'class-1' })))
    let settled = false
    const request = loadCurrentClassContext().catch(() => { settled = true })

    await vi.advanceTimersByTimeAsync(5000)

    expect(settled).toBe(true)
    await request
  })

  it('preserves the last teacher assignment when the network stalls', async () => {
    mocks.getDoc.mockResolvedValueOnce(snapshot(student.id, { classId: 'class-1' }))
      .mockResolvedValueOnce(snapshot('class-1', classroom))
    const assigned = await loadCurrentClassContext()
    mocks.getDoc.mockImplementation(never)
    let result
    const request = loadCurrentClassContext().then((value) => { result = value })

    await vi.advanceTimersByTimeAsync(5000)

    expect(result).toEqual(assigned)
    expect(result.settings).toEqual(classroom.settings)
    await request
  })

  it('does not reuse another student’s cached classroom', async () => {
    mocks.getDoc.mockResolvedValueOnce(snapshot(student.id, { classId: 'class-1' }))
      .mockResolvedValueOnce(snapshot('class-1', classroom))
    await loadCurrentClassContext()
    mocks.currentUser.mockReturnValue({ id: 'student-2', role: 'student' })
    mocks.getDoc.mockImplementation(never)
    let rejected = false
    const request = loadCurrentClassContext().catch(() => { rejected = true })

    await vi.advanceTimersByTimeAsync(5000)

    expect(rejected).toBe(true)
    await request
  })

  it('clears the loading deadline after a successful lookup', async () => {
    mocks.getDoc.mockResolvedValue(snapshot(student.id, {}))

    expect(await loadCurrentClassContext()).toMatchObject({ plain: true })
    await vi.advanceTimersByTimeAsync(0)
    expect(vi.getTimerCount()).toBe(0)
  })
})
