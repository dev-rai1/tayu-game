import { readFileSync } from 'node:fs'
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

  it('keeps the accessible 2D intro dismissible instead of permanently covering play', () => {
    const source = read('frontend/src/world/AccessibleWorld.jsx')
    expect(source).toContain('const [introExpanded, setIntroExpanded] = useState(true)')
    expect(source).toContain('Got it — show my next step')
    expect(source).toContain('2D mode info')
    expect(source).toContain('bg-navy/95')
  })

  it('replaces shared 3D How-to-Play instructions with a dedicated 2D help dialog', () => {
    const source = read('frontend/src/world/AccessibleWorld.jsx')
    expect(source).toContain('const [helpDialogOpen, setHelpDialogOpen] = useState(false)')
    expect(source).toContain('if (!game.helpOpen) return')
    expect(source).toContain('game.setHelpOpen(false)')
    expect(source).toContain('No WASD, right-click camera movement, or 3D arrows are used in this mode.')
    expect(source).toContain('Use the large buttons under “Your next step.”')
  })

  it('keeps Module 5 reachable and playable from Accessible 2D', () => {
    const accessible = read('frontend/src/world/AccessibleWorld.jsx')
    const world = read('frontend/src/pages/World.jsx')
    expect(accessible).toContain('export function AccessibleWorld({ taxMode = false })')
    expect(accessible).toContain('Go to Paycheck Planet — meet Maya at the Tax Help desk')
    expect(accessible).toContain('tax.previewClient(taxCase)')
    expect(accessible).toContain('tax.openStation(tax.stepNumber)')
    expect(accessible).toContain("title = taxMode ? 'Paycheck Planet · Tax Lab'")
    expect(world).toContain('<AccessibleWorld taxMode={taxMode} />')
    expect(world).toContain('{taxMode && use3D && <TaxWorldInteractionBridge />}')
    expect(world).toContain('{taxMode && use3D && <TaxActionPrompt />}')
  })

  it('keeps an explicit player-selectable 2D/3D mode and explains fallback', () => {
    const settings = read('frontend/src/pages/Settings.jsx')
    const prefs = read('frontend/src/services/worldModePreferences.js')
    const world = read('frontend/src/pages/World.jsx')
    expect(settings).toContain('Accessible 2D')
    expect(settings).toContain('3D world')
    expect(settings).toContain('3D is not available on this device right now')
    expect(prefs).toContain("const STORAGE_KEY = 'tayu-world-mode'")
    expect(world).toContain('const use3D = webglAvailable && worldMode !== WORLD_MODES.TWO_D')
    expect(world).toContain('Accessible 2D is active')
  })

  it('labels the 3D canvas for screen readers and points to the 2D alternative', () => {
    const source = read('frontend/src/world/GameWorld.jsx')
    expect(source).toContain('role="application"')
    expect(source).toContain('Interactive TAYU 3D learning world')
    expect(source).toContain('Accessible 2D mode is available in Settings.')
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

  it('mounts the live plan coach for both 3D and Accessible 2D worlds', () => {
    const source = read('frontend/src/pages/World.jsx')
    expect(source).toContain("import { JarPlanCoach } from '../world/JarPlanCoach.jsx'")
    expect(source).toContain('{!taxMode && <JarPlanCoach />}')
    expect(source).toContain('{use3D ? <GameWorld avatar={state.avatar} /> : <AccessibleWorld taxMode={taxMode} />}')
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
