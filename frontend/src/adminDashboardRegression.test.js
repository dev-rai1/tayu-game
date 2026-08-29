import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

describe('admin dashboard wiring', () => {
  it('keeps the dashboard route and launcher mounted', () => {
    const app = read('frontend/src/App.jsx')
    expect(app).toContain("import AdminRoute from './components/AdminRoute.jsx'")
    expect(app).toContain("import AdminDashboardButton from './components/AdminDashboardButton.jsx'")
    expect(app).toContain('path="/dashboard"')
    expect(app).toContain('<AdminDashboardButton />')
  })

  it('restores the historical password-only dashboard entry flow', () => {
    const route = read('frontend/src/components/AdminRoute.jsx')
    const access = read('frontend/src/services/adminAccess.js')
    expect(route).toContain("setStatus('password')")
    expect(route).toContain('Dashboard password')
    expect(route).toContain('openDashboardWithPassword(password)')
    expect(route).not.toContain('<Navigate to="/login"')
    expect(access).toContain('DASHBOARD_PASSWORD_HASH')
    expect(access).toContain('dashboard.viewer.v4@tayufinance.app')
    expect(access).toContain('signInWithEmailAndPassword')
  })

  it('keeps the analytics resources used by the admin dashboard', () => {
    const dashboard = read('frontend/src/pages/Dashboard.jsx')
    const analytics = read('frontend/src/services/adminAnalytics.js')
    expect(dashboard).toContain('TAYU Admin Analytics')
    expect(dashboard).toContain('Export detailed CSV')
    expect(dashboard).toContain('Users by country')
    expect(dashboard).toContain('Time spent by module')
    expect(dashboard).toContain('Login and logout timestamps')
    for (const collectionName of ['profiles', 'progress', 'authActivity', 'usageSessions', 'sitePageViews']) {
      expect(analytics).toContain(`'${collectionName}'`)
    }
  })

  it('keeps dashboard-viewer reads while preserving admin-only destructive writes', () => {
    const rules = read('firestore.rules')
    expect(rules).toContain('function isDashboardViewer()')
    expect(rules).toContain('function canReadDashboard() { return isAdmin() || isDashboardViewer(); }')
    expect(rules).toContain('allow list: if canReadDashboard()')
    expect(rules).toContain('allow read: if canReadDashboard();')
    expect(rules).toContain('allow delete: if isAdmin();')
  })
})
