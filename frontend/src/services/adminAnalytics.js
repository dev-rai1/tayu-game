import { collection, getDocs } from 'firebase/firestore'
import { getFirebaseServices } from './firebase.js'

export async function adminAnalyticsData() {
  const firebase = getFirebaseServices()
  if (!firebase?.firestore) throw new Error('Cloud analytics are unavailable.')

  const [profilesSnapshot, progressSnapshot, activitySnapshot, usageSnapshot, pageViewsSnapshot] = await Promise.all([
    getDocs(collection(firebase.firestore, 'profiles')),
    getDocs(collection(firebase.firestore, 'progress')),
    getDocs(collection(firebase.firestore, 'authActivity')),
    getDocs(collection(firebase.firestore, 'usageSessions')),
    getDocs(collection(firebase.firestore, 'sitePageViews')),
  ])

  const progressById = Object.fromEntries(progressSnapshot.docs.map((item) => [item.id, item.data()?.data || null]))
  const sessions = usageSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || '')))
  const sessionsByUid = sessions.reduce((result, session) => {
    if (!result[session.uid]) result[session.uid] = []
    result[session.uid].push(session)
    return result
  }, {})

  const accounts = profilesSnapshot.docs.map((item) => {
    const profile = item.data()
    return {
      uid: item.id,
      email: profile.email || '', role: profile.role || 'student', gradeLevels: profile.gradeLevels || '',
      foundVia: profile.foundVia || '', social: profile.social || '', organizationName: profile.organizationName || '',
      organizationEmail: profile.organizationEmail || '', createdAt: profile.createdAt || '', lastLoginAt: profile.lastLoginAt || '',
      lastLogoutAt: profile.lastLogoutAt || '', lastActiveAt: profile.lastActiveAt || '', loginCount: Number(profile.loginCount || 0),
      progress: progressById[item.id] || null, sessions: sessionsByUid[item.id] || [],
    }
  })

  const activity = activitySnapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.occurredAt || '').localeCompare(String(a.occurredAt || '')))
  const pageViews = pageViewsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  const uniqueVisitors = new Set(pageViews.map((view) => view.visitorId).filter(Boolean)).size
  const uniqueSessions = new Set(pageViews.map((view) => view.sessionId).filter(Boolean)).size

  return { accounts, activity, sessions, siteTraffic: { totalPageViews: pageViews.length, uniqueVisitors, uniqueSessions } }
}
