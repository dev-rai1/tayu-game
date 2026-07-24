import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { GameStateProvider } from './hooks/useGameState.jsx'
import './styles/index.css'
import { logTayuError } from './components/Boundary.jsx'
import { armFirstGesture } from './services/audio.js'

// R10 v8 7.3: nothing fails silently - unhandled errors are logged locally
window.addEventListener('unhandledrejection', (e) => logTayuError('unhandledrejection', e.reason))
window.addEventListener('error', (e) => logTayuError('window.onerror', e.message))
armFirstGesture()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </BrowserRouter>
  </React.StrictMode>
)
