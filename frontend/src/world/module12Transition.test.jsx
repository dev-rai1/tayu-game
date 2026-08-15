// @vitest-environment jsdom

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameStateProvider } from '../hooks/useGameState.jsx'
import { Boundary } from '../components/Boundary.jsx'
import { useGame } from './store.js'
import World from '../pages/World.jsx'
import { repairRuntimeState } from './GameWorld.jsx'

vi.mock('./GameWorld.jsx', async (importOriginal) => ({
  ...(await importOriginal()),
  GameWorld: () => <div data-testid="game-world" />,
}))

describe('Module 1 to Module 2 transition', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useGame.setState({
      week: 1,
      objective: 'done',
      weekComplete: true,
      pendingWeekComplete: false,
      allocations: { spend: 0, save: 17, give: 7 },
      cards: [],
      lessons: [],
      dialog: null,
      near: null,
      toast: null,
      guide: null,
      actorCaption: null,
      banner: null,
      helpOpen: false,
      scenarioLocked: false,
    })
  })

  it('opens the Lemonade Stand recap without tripping the app boundary', async () => {
    render(
      <MemoryRouter initialEntries={['/world']}>
        <GameStateProvider>
          <Boundary name="transition">
            <World />
          </Boundary>
        </GameStateProvider>
      </MemoryRouter>,
    )

    act(() => {
      useGame.setState({
        week: 1,
        objective: 'done',
        weekComplete: true,
        pendingWeekComplete: false,
        allocations: { spend: 0, save: 17, give: 7 },
        cards: [],
        lessons: [],
        dialog: null,
        near: null,
        toast: null,
        guide: null,
        actorCaption: null,
        banner: null,
        helpOpen: false,
        scenarioLocked: false,
      })
    })

    fireEvent.click(await screen.findByRole('button', { name: 'Start Week 2' }))

    await waitFor(() => expect(screen.getByText('Module 2: Your Lemonade Stand')).toBeInTheDocument())
    expect(screen.queryByText('Oops! Something got tangled.')).not.toBeInTheDocument()
    expect(useGame.getState().week).toBe(2)
    expect(useGame.getState().lemPhase).toBe('recap')
  })

  it('keeps Penny character geometry stable while enabling her Module 2 uniform', () => {
    const source = readFileSync(join(process.cwd(), 'src/world/ConsequenceStage.jsx'), 'utf8')

    expect(source).toContain("lemonadeHost={n.id === 'penny' && week === 2}")
    expect(source).toContain('<group visible={lemonadeHost}>')
    expect(source).not.toContain("avatar={{ ...n.avatar, accessories:")
  })

  it('keeps the real Module 1 money allocation intact before starting Module 2', () => {
    const allocation = { spend: 0, save: 17, give: 7 }
    act(() => useGame.setState({ allocations: allocation }))

    repairRuntimeState()
    expect(useGame.getState().allocations).toEqual(allocation)

    act(() => useGame.getState().startWeek2())
    expect(useGame.getState().week).toBe(2)
    expect(useGame.getState().allocations).toEqual({ spend: 0, save: 17, give: 7 })
  })

  it('repairs malformed saved allocations to the required money object shape', () => {
    act(() => useGame.setState({ allocations: [] }))

    repairRuntimeState()

    expect(useGame.getState().allocations).toEqual({ spend: 0, save: 0, give: 0 })
  })

  it('starts every persistent-world module with valid transition state', () => {
    const expectedWeeks = [1, 2, 3, 4, 5]

    expectedWeeks.forEach((moduleNumber) => {
      act(() => useGame.getState().adminJumpModule(moduleNumber, false))
      const state = useGame.getState()

      expect(state.week).toBe(moduleNumber)
      expect(state.allocations).toMatchObject({ spend: expect.any(Number), save: expect.any(Number), give: expect.any(Number) })
      expect(Array.isArray(state.cards)).toBe(true)
      expect(Array.isArray(state.lessons)).toBe(true)
      if (moduleNumber === 2) expect(state.lemPhase).toBeTruthy()
      if (moduleNumber === 3) expect(state.bt).toBeTruthy()
      if (moduleNumber === 4) expect(state.bk).toBeTruthy()
      if (moduleNumber === 5) expect(state.mg).toBeTruthy()
    })
  })

  it('restarts the 3D canvas and its error boundary for every module', () => {
    const source = readFileSync(join(process.cwd(), 'src/world/GameWorld.jsx'), 'utf8')

    expect(source).toContain('const physicalModule = readPhysicalModuleLaunch()')
    expect(source).toContain('const paycheckWorld = physicalModule === 7 || isPaycheckWorldActive()')
    expect(source).toContain("const sceneKey = paycheckWorld ? `paycheck-${week}-${physicalModule || 'active'}` : `week-${week}`")
    expect(source).toContain('<Boundary key={sceneKey} name="canvas" hard>')
    expect(source).toContain('key={sceneKey}')
  })
})
