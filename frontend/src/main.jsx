import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { GameStateProvider } from './hooks/useGameState.jsx'
import './styles/index.css'
import './styles/actionButtons.css'
import './styles/contrast.css'
import './styles/buttonReliability.css'
import { logTayuError } from './components/Boundary.jsx'
import { ButtonFeedbackEnhancer } from './components/ButtonFeedbackEnhancer.jsx'
import { PaycheckCompletionCheck } from './components/PaycheckCompletionCheck.jsx'
import { PublicCopyConsistency } from './components/PublicCopyConsistency.jsx'
import { PublicModuleProgress } from './components/PublicModuleProgress.jsx'
import { PlaytestUxParity } from './components/PlaytestUxParity.jsx'
import { ModalQueueSanitizer } from './components/ModalQueueSanitizer.jsx'
import { CurriculumCarryoverBridge } from './components/CurriculumCarryoverBridge.jsx'
import { armFirstGesture } from './services/audio.js'
import { installTouchDragBridge } from './services/touchDragBridge.js'
import './world/replayGuidanceListener.js'
import { MoneyGardenFlowGuide } from './world/MoneyGardenFlowGuide.jsx'

// R10 v8 7.3: nothing fails silently - unhandled errors are logged locally
window.addEventListener('unhandledrejection', (e) => logTayuError('unhandledrejection', e.reason))
window.addEventListener('error', (e) => logTayuError('window.onerror', e.message))
armFirstGesture()
installTouchDragBridge()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GameStateProvider>
        <App />
        <PublicCopyConsistency />
        <PublicModuleProgress />
        <PaycheckCompletionCheck />
        <MoneyGardenFlowGuide />
        <CurriculumCarryoverBridge />
        <ButtonFeedbackEnhancer />
        <PlaytestUxParity />
        <ModalQueueSanitizer />
      </GameStateProvider>
    </BrowserRouter>
  </React.StrictMode>
)
