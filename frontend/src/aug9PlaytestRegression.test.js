import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

describe('Aug. 9 comprehensive playtest regressions', () => {
  it('keeps every badge reward lookup safe, including the tax look', () => {
    const source = read('frontend/src/components/AvatarRewards.jsx')
    expect(source).toContain("tax: {")
    expect(source).toContain("label: 'Tax Pro Look'")
    expect(source).toContain('if (!check || !look) return null')
  })

  it('keeps all protected routes present after the avatar crash fix', () => {
    const source = read('frontend/src/App.jsx')
    for (const route of ['/avatar', '/world', '/tax-paycheck', '/guru', '/party', '/path-complete']) {
      expect(source).toContain(`path="${route}"`)
    }
  })

  it('keeps Module 1 playable as the first required entry instead of self-locking', () => {
    const source = read('frontend/src/pages/ModuleSelect.jsx')
    expect(source).toContain('if (context?.plain) return true')
    expect(source).toContain('moduleNumber === firstIncompleteRequired || completedNumbers.includes(moduleNumber)')
    expect(source).toContain('const firstIncompleteRequired = required.find')
  })

  it('keeps Module 6 enabled in teacher defaults and persistence', () => {
    const source = read('frontend/src/services/classroom.js')
    expect(source).toContain('export const DEFAULT_MODULES = [1, 2, 3, 4, 5, 6]')
    expect(source).toMatch(/filter\(\(n\) => n >= 1 && n <= 6\)/)
    expect(source).toContain('amountDone: `${badges.length}/6`')
  })

  it('keeps teacher CSV analytics wired across all six modules', () => {
    const source = read('frontend/src/pages/TeacherDashboard.jsx')
    expect(source).toContain("const MODULES = ['jars', 'lemonade', 'budget', 'bank', 'tax', 'garden']")
    expect(source).toContain('Export detailed CSV')
    expect(source).toContain('...MODULES.map((moduleName) => `${moduleName}Seconds`)')
  })

  it('keeps the modal focus trap null-safe during transitions', () => {
    const source = read('frontend/src/components/DialogAccessibility.jsx')
    expect(source).toContain('const dialog = activeDialog')
    expect(source).toContain('dialog.querySelectorAll?.(FOCUSABLE)')
    expect(source).toContain('if (!dialog || !document.contains(dialog)) return')
  })

  it('physically removes the old button-based 2D world', () => {
    expect(existsSync(resolve(root, 'frontend/src/world/AccessibleWorld.jsx'))).toBe(false)
    const world = read('frontend/src/pages/World.jsx')
    expect(world).not.toContain('AccessibleWorld')
    expect(world).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
    expect(world).toContain('data-world-mode="3d"')
  })

  it('removes the 2D/Automatic world selector from Settings', () => {
    const settings = read('frontend/src/pages/Settings.jsx')
    expect(settings).not.toContain('Accessible 2D')
    expect(settings).not.toContain("title: 'Automatic'")
    expect(settings).not.toContain("title: '3D world'")
    expect(settings).toContain('TAYU always uses the full walkable 3D town.')
  })

  it('repairs stale 2D browser preferences back to 3D', () => {
    const prefs = read('frontend/src/services/worldModePreferences.js')
    expect(prefs).toContain("const STORAGE_KEY = 'tayu-world-mode'")
    expect(prefs).toContain('localStorage.setItem(STORAGE_KEY, WORLD_MODES.THREE_D)')
    expect(prefs).toContain('return WORLD_MODES.THREE_D')
  })

  it('attempts the actual 3D canvas even when capability probing fails', () => {
    const source = read('frontend/src/utils/webgl.js')
    expect(source).toContain('attempting the 3D renderer anyway')
    expect(source).toMatch(/return true\s*\n}/)
  })

  it('labels the 3D canvas for screen readers', () => {
    const source = read('frontend/src/world/GameWorld.jsx')
    expect(source).toContain('role="application"')
    expect(source).toContain('Interactive TAYU 3D learning world')
  })

  it('keeps the jar HUD, Skip Talk, and Admin controls in separate screen anchors', () => {
    const hud = read('frontend/src/world/Hud.jsx')
    const skip = read('frontend/src/world/OverlayEscapeControls.jsx')
    const admin = read('frontend/src/components/AdminPanel.jsx')
    expect(hud).toContain('absolute left-4 top-[4.5rem]')
    expect(skip).toContain('fixed right-4 top-[5.5rem]')
    expect(admin).toContain('fixed right-3 z-[1000]')
    expect(admin).toContain("bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))'")
  })

  it('keeps dead primary actions visibly disabled with a reason', () => {
    const lemonade = read('frontend/src/world/Hud.jsx')
    const budget = read('frontend/src/world/BudgetPanels.jsx')
    expect(lemonade).toContain('disabled={!canAfford || price === null}')
    expect(lemonade).toContain("price === null && <div className=\"mt-1 text-xs font-bold text-teal\"")
    expect(budget).toContain('aria-describedby="grocery-checkout-help"')
    expect(budget).toContain('more food')
    expect(budget).toContain('disabled:cursor-not-allowed')
  })

  it('keeps the desktop cookie prompt away from centered landing controls', () => {
    const source = read('frontend/src/components/PrivacyChoices.jsx')
    expect(source).toContain('sm:right-[calc(1rem+env(safe-area-inset-right,0px))]')
    expect(source).toContain('sm:w-[min(28rem,calc(100vw-2rem))]')
  })

  it('waits for cloud auth rehydration before protected-route redirects', () => {
    const source = read('frontend/src/App.jsx')
    expect(source).toContain('function useAuthGateReady()')
    expect(source).toContain("window.addEventListener('tayu-auth-changed', finish, { once: true })")
    expect(source).toContain('window.setTimeout(finish, 1500)')
    expect(source).toContain('if (!authReady) return <LoadingScreen label="Restoring your account..." />')
  })

  it('clamps jar allocation to the remaining balance so it cannot wrap or over-allocate', () => {
    const source = read('frontend/src/world/store.js')
    expect(source).toContain('const give = Math.max(0, Math.min(amt, remaining))')
    expect(source).toContain('wallet: remaining - give')
  })

  it('does not restore stale Module 1 jar state on a fresh world initialization or replay', () => {
    const source = read('frontend/src/world/store.js')
    expect(source).toContain('if (saved && saved.week === 2)')
    expect(source).toContain('set(get()._baseState())')
    expect(source).toContain('allocations: { spend: 0, save: 0, give: 0 }, wallet: ALLOWANCE')
    expect(source).toContain('clearWallet()')
  })

  it('keeps concrete affordability feedback for the Module 1 birthday scenario', () => {
    const source = read('frontend/src/scenarios/jarScenario.js')
    expect(source).toContain("spendGoal: { label: 'toy', amount: 8 }")
    expect(source).toContain("you're $${short} short")
    expect(source).toContain('re-allocate and cover the ${goal.label}')
  })

  it('shows the Module 1 trade-off live with icons, audio, and plan-quality reinforcement', () => {
    const source = read('frontend/src/world/JarPlanCoach.jsx')
    expect(source).toContain('Live plan check')
    expect(source).toContain('Covered ✓')
    expect(source).toContain('$${fmt(status.short)} short')
    expect(source).toContain('🔊 Read aloud')
    expect(source).toContain('🧸')
    expect(source).toContain('⭐')
    expect(source).toContain('💜')
    expect(source).toContain('Strong three-jar plan: reward-ready!')
    expect(source).toContain("['spend', 'save', 'give'].every")
  })

  it('remounts the 3D scene after every module launch so reset actors cannot crash a live canvas', () => {
    const source = read('frontend/src/pages/World.jsx')
    expect(source).toContain('const [worldSession, setWorldSession] = useState(0)')
    expect(source).toContain('setWorldSession((session) => session + 1)')
    expect(source).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
  })

  it('mounts the live plan coach in the 3D world shell after the arrival gate is dismissed', () => {
    const source = read('frontend/src/pages/World.jsx')
    expect(source).toContain("import { JarPlanCoach } from '../world/JarPlanCoach.jsx'")
    expect(source).toContain('{!moduleEntry && !taxMode && <JarPlanCoach />}')
    expect(source).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
    expect(source).not.toContain('AccessibleWorld')
  })

  it('keeps jar reward progression behind a successful three-jar financial plan', () => {
    const scenario = read('frontend/src/scenarios/jarScenario.js')
    const store = read('frontend/src/world/store.js')
    expect(scenario).toContain("rules: { min: { spend: 8, save: 1, give: 1 } }")
    expect(scenario).toContain('const ok = total === 30 && followsRules(a, sc.rules)')
    expect(store).toContain("get().awardBadge('jars', 'JAR MASTER')")
  })

  it('keeps the PDF closure audit explicit about code-closed versus live-validation items', () => {
    const source = read('docs/playtests/AUG9_PDF_CLOSURE_AUDIT.md')
    expect(source).toContain('CODE-CLOSED')
    expect(source).toContain('LIVE-VALIDATION')
    expect(source).toContain('Modules 2, 3, 4, 5, 6A, and 6B full gameplay paths.')
    expect(source).toContain('CI/build/unit/regression success is required before this PR can merge')
  })
})
