import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { getFirebaseServices } from './firebase.js'
import { currentUser } from './auth.js'

export const DEFAULT_MODULES = [1, 2, 3, 4, 5]
export const DEFAULT_CLASS_SETTINGS = Object.freeze({ enabledModules: DEFAULT_MODULES, allowSkip: false })

const CACHE_PREFIX = 'tayu-teacher-class-v1:'
const normalizeCode = (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
const timeout = (promise, milliseconds) => Promise.race([
  promise,
  new Promise((_, reject) => window.setTimeout(() => reject(new Error('timeout')), milliseconds)),
])

export function generateClassCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

function cacheKey(user = currentUser()) {
  return user?.id ? `${CACHE_PREFIX}${user.id}` : ''
}

export function readCachedTeacherClass() {
  try {
    const key = cacheKey()
    return key ? JSON.parse(localStorage.getItem(key) || 'null') : null
  } catch { return null }
}

function cacheTeacherClass(value) {
  try {
    const key = cacheKey()
    if (key && value) localStorage.setItem(key, JSON.stringify(value))
  } catch { /* cache is optional */ }
  return value
}

export function createOptimisticTeacherClass() {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') return null
  const cached = readCachedTeacherClass()
  if (cached) return cached
  const now = new Date().toISOString()
  return cacheTeacherClass({
    id: user.id,
    teacherId: user.id,
    teacherEmail: user.email,
    classCode: generateClassCode(),
    settings: { ...DEFAULT_CLASS_SETTINGS },
    createdAt: now,
    updatedAt: now,
    localOnly: true,
  })
}

async function firestore() {
  const firebase = getFirebaseServices()
  if (!firebase?.firestore) throw new Error('Classroom services are unavailable. Refresh and try again.')
  return firebase.firestore
}

export async function createOrLoadTeacherClass() {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const local = createOptimisticTeacherClass()
  const db = await firestore()
  const ref = doc(db, 'classes', user.id)

  try {
    const existing = await timeout(getDoc(ref), 2500)
    if (existing.exists()) return cacheTeacherClass({ id: existing.id, ...existing.data(), localOnly: false })
  } catch {
    // Never block the dashboard on a slow Firestore read. The cached classroom
    // remains usable while the write below synchronizes in the background.
  }

  const value = {
    teacherId: user.id,
    teacherEmail: user.email,
    classCode: local.classCode,
    settings: local.settings || { ...DEFAULT_CLASS_SETTINGS },
    createdAt: local.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  setDoc(ref, value, { merge: true }).then(() => cacheTeacherClass({ id: user.id, ...value, localOnly: false })).catch(() => {})
  return local
}

export async function saveTeacherClassSettings(settings) {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const enabledModules = [...new Set((settings.enabledModules || []).map(Number).filter((n) => n >= 1 && n <= 5))].sort()
  if (!enabledModules.length) throw new Error('Keep at least one module accessible.')
  const current = createOptimisticTeacherClass()
  const next = cacheTeacherClass({ ...current, settings: { enabledModules, allowSkip: Boolean(settings.allowSkip) }, updatedAt: new Date().toISOString() })
  const db = await firestore()
  await timeout(setDoc(doc(db, 'classes', user.id), { settings: next.settings, updatedAt: next.updatedAt }, { merge: true }), 5000)
  return { ...next, localOnly: false }
}

export async function regenerateTeacherClassCode() {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const classCode = generateClassCode()
  const current = createOptimisticTeacherClass()
  cacheTeacherClass({ ...current, classCode, updatedAt: new Date().toISOString() })
  const db = await firestore()
  await timeout(setDoc(doc(db, 'classes', user.id), { classCode, updatedAt: new Date().toISOString() }, { merge: true }), 5000)
  return classCode
}

export async function joinStudentToClass(rawCode) {
  const user = currentUser()
  if (!user?.id || user.role !== 'student') throw new Error('Student account required.')
  const code = normalizeCode(rawCode)
  if (!code) throw new Error('Enter your teacher’s class code.')
  const db = await firestore()
  const matches = await getDocs(query(collection(db, 'classes'), where('classCode', '==', code)))
  if (matches.empty) throw new Error('That class code was not found. Check it and try again.')
  const classDoc = matches.docs[0]
  const classroom = classDoc.data()
  await setDoc(doc(db, 'profiles', user.id), {
    teacherId: classroom.teacherId,
    teacherEmail: classroom.teacherEmail,
    classId: classDoc.id,
    classCode: code,
    accountType: 'class_student',
    joinedClassAt: new Date().toISOString(),
  }, { merge: true })
  return { id: classDoc.id, ...classroom }
}

export async function loadCurrentClassContext() {
  const user = currentUser()
  if (!user?.id || user.guest) return null
  if (user.role === 'teacher') return createOrLoadTeacherClass()
  const db = await firestore()
  const profile = await getDoc(doc(db, 'profiles', user.id))
  const profileData = profile.exists() ? profile.data() : {}
  if (!profileData.classId) return { plain: true, settings: DEFAULT_CLASS_SETTINGS }
  const classDoc = await getDoc(doc(db, 'classes', profileData.classId))
  if (!classDoc.exists()) return { plain: true, settings: DEFAULT_CLASS_SETTINGS }
  return { id: classDoc.id, ...classDoc.data(), profile: profileData }
}

export async function loadTeacherStudents() {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const db = await firestore()
  const profiles = await getDocs(query(collection(db, 'profiles'), where('teacherId', '==', user.id)))
  const rows = await Promise.all(profiles.docs.map(async (profileDoc) => {
    const [progressDoc, sessions] = await Promise.all([
      getDoc(doc(db, 'progress', profileDoc.id)),
      getDocs(query(collection(db, 'usageSessions'), where('uid', '==', profileDoc.id))),
    ])
    const profile = profileDoc.data()
    const progress = progressDoc.exists() ? progressDoc.data()?.data : null
    const usage = sessions.docs.map((item) => item.data())
    const badges = progress?.profile?.badges || []
    return {
      uid: profileDoc.id,
      email: profile.email || '',
      gradeLevels: profile.gradeLevels || '',
      badges,
      completed: badges.length,
      completionState: progress?.profile?.guru ? 'Certificate earned' : badges.length ? 'In progress' : 'Not started',
      amountDone: `${badges.length}/5`,
      wrongAnswers: Number(progress?.profile?.wrongAnswers || 0),
      timeSpent: usage.reduce((sum, item) => sum + Number(item.durationSeconds || 0), 0),
      currentModule: progress?.wallet?.week || 1,
      progress,
    }
  }))
  return rows.sort((a, b) => a.email.localeCompare(b.email))
}
