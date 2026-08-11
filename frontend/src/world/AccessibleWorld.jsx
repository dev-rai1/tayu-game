// Legacy compatibility export only. TAYU gameplay is now 3D-only.
// Any stale import that previously requested the old button-based 2D world
// resolves to the real 3D renderer instead, so the 2D experience can never appear.
export { GameWorld as AccessibleWorld } from './GameWorld.jsx'
