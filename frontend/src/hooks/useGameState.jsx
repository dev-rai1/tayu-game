import { createContext, useContext, useReducer } from 'react'
import { DEFAULT_AVATAR } from '../constants/avatarOptions.js'

// Central game state. Module 1 build: player name, 3D avatar, and module1 progress.
// (Legacy multi-stage fields kept so older components still compile.)

const initialState = {
  player: { name: '' },
  avatar: { ...DEFAULT_AVATAR }, // legacy stylized customization (fallback robot ignores it)
  avatarUrl: null, // Ready Player Me rigged GLB url
  module1: { week: 1, allocation: null, badge: null, completed: false },

  // legacy (unused by Module 1 flow but referenced by older components)
  mode: null,
  sessionCode: null,
  stage: 1,
  netWorth: 0,
  points: 0,
  inventory: [],
  achievements: [],
  summaries: {},
  completed: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, player: { ...state.player, ...action.payload } }
    case 'SET_AVATAR':
      return { ...state, avatar: { ...state.avatar, ...action.payload } }
    case 'SET_AVATAR_URL':
      return { ...state, avatarUrl: action.url }
    case 'COMPLETE_MODULE1':
      return {
        ...state,
        module1: { ...state.module1, allocation: action.allocation, badge: action.badge, completed: true },
      }
    case 'SET_MODE':
      return { ...state, mode: action.mode, sessionCode: action.sessionCode ?? null }
    case 'COMPLETE_STAGE':
      return {
        ...state,
        [`stage${action.stage}Results`]: action.results,
        netWorth: action.netWorth ?? state.netWorth,
        summaries: { ...state.summaries, [action.stage]: action.summary ?? null },
        achievements: action.achievement
          ? [...state.achievements, { stage: action.stage, ...action.achievement }]
          : state.achievements,
        stage: action.stage >= 3 ? 3 : action.stage + 1,
        completed: action.stage >= 3 ? true : state.completed,
      }
    case 'ADD_POINTS':
      return { ...state, points: Math.max(0, state.points + action.amount) }
    case 'SET_INVENTORY':
      return { ...state, inventory: action.inventory }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

const GameStateContext = createContext(null)

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const ctx = useContext(GameStateContext)
  if (!ctx) throw new Error('useGameState must be used within <GameStateProvider>')
  return ctx
}
