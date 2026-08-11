import React from 'react'
import ReactDOM from 'react-dom/client'
import { GameWorld } from './world/GameWorld.jsx'
import './styles/index.css'
import './styles/actionButtons.css'
import './styles/contrast.css'
import './styles/buttonReliability.css'

const avatar = {
  gender: 'female',
  bodyType: 'average',
  skinTone: 'warm_beige',
  hairStyle: 'medium',
  hairColor: 'brown',
  eyeColor: 'brown',
  shirtColor: 'teal',
  pantsColor: 'blue',
  shoeColor: 'white',
  topStyle: 'tee',
  bottomStyle: 'pants',
  accessories: [],
}

window.addEventListener('error', (event) => {
  document.documentElement.dataset.threeSmokeError = event.message || 'window-error'
})
window.addEventListener('unhandledrejection', (event) => {
  document.documentElement.dataset.threeSmokeError = String(event.reason || 'unhandled-rejection')
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
    <GameWorld avatar={avatar} />
  </div>
)
