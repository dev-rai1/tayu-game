import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const app = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8')

describe('Finale access guard', () => {
  it('requires every core module badge before the Finale can open', () => {
    expect(app).toContain('export const FINALE_REQUIRED_BADGES = MODULE_CATALOG.map((module) => module.badge)')
    expect(app).toContain('FINALE_REQUIRED_BADGES.every((badge) => earned.has(badge))')
  })

  it('guards the Finale route instead of trusting stale completion flags or a direct URL', () => {
    expect(app).toContain('function FinaleGate({ children })')
    expect(app).toContain('if (!isFinaleUnlocked(loadProfile() || {})) return <Navigate to="/modules" replace />')
    expect(app).toContain('<Route path="/guru" element={<FinaleGate><Guru /></FinaleGate>} />')
  })

  it('keeps legacy /party access behind the same guarded Finale route', () => {
    expect(app).toContain('<Route path="/party" element={<Navigate to="/guru" replace />} />')
  })
})
