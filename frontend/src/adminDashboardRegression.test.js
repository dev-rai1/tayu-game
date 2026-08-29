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
    expect(analytics).toContain('totalPageViews')
    expect(analytics).toContain('uniqueVisitors')
    expect(analytics).toContain('uniqueSessions')
  })

  it('keeps admin-only Firestore read access for dashboard data', () => {
    const rules = read('firestore.rules')
    expect(rules).toContain("function isAdmin()")
    expect(rules).toContain("profileRole(request.auth.uid) == 'admin'")
    expect(rules).toContain('allow list: if isAdmin()')
    expect(rules).toContain('allow read: if owns(userId) || isAdmin()')
    expect(rules).toContain('allow read: if isAdmin()')
  })
})
