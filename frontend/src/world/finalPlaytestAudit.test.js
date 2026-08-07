import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const frontendSource = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')
const repositorySource = (path) => readFileSync(resolve(process.cwd(), '..', path), 'utf8')

const tracker = frontendSource('world/PersistentImprovementCoach.jsx')
const coach = frontendSource('world/PersistentCoach.jsx')
const teacherGuide = frontendSource('pages/TeacherGuide.jsx')
const usage = frontendSource('services/usageAnalytics.js')
const deployWorkflow = repositorySource('.github/workflows/firebase-hosting-deploy.yml')

describe('final middle-school playtest audit', () => {
  it('uses one message system with an explicit importance hierarchy', () => {
    expect(tracker).toContain('return null')
    expect(tracker).not.toContain('<aside')
    expect(coach).toContain("Benny's feedback")
    expect(coach).toContain('coachMessageFromTransient')
    expect(coach).toContain("data-guidance-lane={important ? 'important-popup' : 'side-hint'}")
    expect(coach).toContain('data-important-message-scrim="true"')
    expect(coach).toContain('activeFeedbackKey')
    expect(coach).toContain('advanceDialog')
  })

  it('keeps retry clues directional instead of revealing exact answers', () => {
    expect(tracker).not.toMatch(/Try about \$|Put at least \$|Choose [“"]Pay in full|Choose [“"]Refuse/i)
    expect(tracker).toContain('Use the red and green basket checks as clues')
    expect(tracker).toContain('change one part of the plan')
  })

  it('includes explicit optional high-school extensions', () => {
    expect(teacherGuide).toContain('Optional high school extension')
    expect(teacherGuide).toContain('break-even sales')
    expect(teacherGuide).toContain('investment-policy rule')
  })

  it('records choices, retries, completions, and stop points', () => {
    expect(usage).toContain('eventCounts')
    expect(usage).toContain('learningEvents')
    expect(usage).toContain('lastModule')
    expect(usage).toContain('recordLearningEvent')
  })

  it('requires a complete Firebase deploy and verifies the exact live commit', () => {
    expect(deployWorkflow).toContain('deployment.json')
    expect(deployWorkflow).toContain('Deploy Firestore rules')
    expect(deployWorkflow).not.toContain('continue-on-error')
    expect(deployWorkflow).toContain('Verify exact production commit and SPA routes')
    expect(deployWorkflow).toContain('tayufinance.app')
    expect(deployWorkflow).toContain('tayu-financial-literacy.web.app')
    expect(deployWorkflow).toContain('statuses: write')
    expect(deployWorkflow).toContain("context: 'firebase/production'")
    expect(deployWorkflow).toContain("state: 'success'")
    expect(deployWorkflow).toContain("state: 'failure'")
  })
})
