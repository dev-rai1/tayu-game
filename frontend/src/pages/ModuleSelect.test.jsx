import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getDoc: vi.fn() }))

vi.mock('firebase/firestore', async (importOriginal) => ({
  ...await importOriginal(),
  doc: vi.fn((_, name, id) => `${name}/${id}`),
  getDoc: mocks.getDoc,
  setDoc: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('../services/firebase.js', () => ({
  getFirebaseServices: () => ({ firestore: {} }),
  isFirebaseConfigured: () => false,
  prepareFirebaseAuth: vi.fn(),
}))
vi.mock('../world/GameWorld.jsx', () => ({ GameWorld: () => <div data-testid="world" /> }))
vi.mock('../components/TownBackground.jsx', () => ({ TownBackground: () => null }))

import ModuleSelect from './ModuleSelect.jsx'
import World from './World.jsx'
import WorldUtilityDock from '../components/WorldUtilityDock.jsx'
import { GameStateProvider } from '../hooks/useGameState.jsx'
import { Boundary } from '../components/Boundary.jsx'
import { loadProfile } from '../services/walletStore.js'
import { useGame } from '../world/store.js'

const snapshot = (id, data) => ({ id, exists: () => true, data: () => data })
const never = () => new Promise(() => {})

function renderModuleRoutes(initialPath = '/modules') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <GameStateProvider>
        <Boundary name="module-transition">
          <Routes>
            <Route path="/modules" element={<ModuleSelect />} />
            <Route path="/world" element={<World />} />
          </Routes>
          <WorldUtilityDock />
        </Boundary>
      </GameStateProvider>
    </MemoryRouter>,
  )
}

describe('returning to the module menu after completing a lesson', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    sessionStorage.setItem('tayu-session-v1', JSON.stringify({ id: 'student-1', role: 'student' }))
    localStorage.setItem('tayu-profile-v1', JSON.stringify({
      name: 'Test Student', badges: ['jars'],
      activeLearningPath: { id: 'middle-school', label: 'Grades 6–8', title: 'Middle School', modules: [1, 2, 3, 4, 5, 6, 7] },
    }))
    useGame.getState().initWorld()
  })
  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('recovers from a stalled lookup and starts Module 2 from the menu', async () => {
    mocks.getDoc.mockImplementation(never)
    renderModuleRoutes('/world')
    act(() => useGame.setState({ weekComplete: true, objective: 'done' }))
    fireEvent.click(screen.getByRole('link', { name: 'Back to module menu' }))
    expect(screen.getByText('Loading your TAYU adventure…')).toBeInTheDocument()

    await act(async () => { await vi.advanceTimersByTimeAsync(5000) })

    expect(screen.queryByText('Loading your TAYU adventure…')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Play Module 2 now: The Lemonade Stand' }))
    fireEvent.click(screen.getByRole('button', { name: /Start Module 2/ }))

    expect(useGame.getState().week).toBe(2)
    expect(useGame.getState().lemPhase).toBe('supplies')
    expect(screen.getByTestId('world')).toBeInTheDocument()
    expect(loadProfile().badges).toContain('jars')
    expect(screen.queryByText('Oops! Something got tangled.')).not.toBeInTheDocument()
  })

  it('reopens immediately with the saved classroom assignment while the next lookup stalls', async () => {
    mocks.getDoc.mockResolvedValueOnce(snapshot('student-1', { classId: 'class-1' }))
      .mockResolvedValueOnce(snapshot('class-1', {
        settings: { enabledModules: [1, 2], allowSkip: true }, teacherEmail: 'teacher@example.com',
      }))
    renderModuleRoutes()
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    fireEvent.click(screen.getByRole('button', { name: 'Play Module 2 now: The Lemonade Stand' }))
    mocks.getDoc.mockImplementation(never)
    fireEvent.click(screen.getByRole('button', { name: 'Back to module selection' }))

    expect(screen.getByRole('heading', { name: 'Choose your next module' })).toBeInTheDocument()
    expect(screen.queryByText('Loading your TAYU adventure…')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play Module 2 now: The Lemonade Stand' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Locked: Budget Town' })).toBeDisabled()
  })
})
