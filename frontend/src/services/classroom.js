import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { getFirebaseServices } from './firebase.js'
import { currentUser } from './auth.js'

export const DEFAULT_MODULES = [1, 2, 3, 4, 5]
export const DEFAULT_CLASS_SETTINGS = Object.freeze({ enabledModules: DEFAULT_MODULES, allowSkip: false })

const normalizeCode = (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')

export function generateClassCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

async function firestore() {
  const firebase = getFirebaseServices()
  if (!firebase?.firestore) throw new Error('Classroom services are unavailable. Refresh and try again.')
  return firebase.firestore
}

export async function createOrLoadTeacherClass() {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const db = await firestore()
  const ref = doc(db, 'classes', user.id)
  const existing = await getDoc(ref)
  if (existing.exists()) return { id: existing.id, ...existing.data() }

  let classCode = generateClassCode()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const matches = await getDocs(query(collection(db, 'classes'), where('classCode', '==', classCode)))
    if (matches.empty) break
    classCode = generateClassCode()
  }

  const value = {
    teacherId: user.id,
    teacherEmail: user.email,
    classCode,
    settings: DEFAULT_CLASS_SETTINGS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await setDoc(ref, value)
  return { id: user.id, ...value }
}

export async function saveTeacherClassSettings(settings) {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const db = await firestore()
  const enabledModules = [...new Set((settings.enabledModules || []).map(Number).filter((n) => n >= 1 && n <= 5))].sort()
  if (!enabledModules.length) throw new Error('Keep at least one module accessible.')
  await setDoc(doc(db, 'classes', user.id), {
    settings: { enabledModules, allowSkip: Boolean(settings.allowSkip) },
    updatedAt: new Date().toISOString(),
  }, { merge: true })
  return createOrLoadTeacherClass()
}

export async function regenerateTeacherClassCode() {
  const user = currentUser()
  if (!user?.id || user.role !== 'teacher') throw new Error('Teacher account required.')
  const db = await firestore()
  const classCode = generateClassCode()
  await setDoc(doc(db, 'classes', user.id), { classCode, updatedAt: new Date().toISOString() }, { merge: true })
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
  const db = await firestore()
  if (user.role === 'teacher') return createOrLoadTeacherClass()
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
    const wrongAnswers = Number(progress?.profile?.wrongAnswers || 0)
    const timeSpent = usage.reduce((sum, item) => sum + Number(item.durationSeconds || 0), 0)
    return {
      uid: profileDoc.id,
      email: profile.email || '',
      gradeLevels: profile.gradeLevels || '',
      badges,
      completed: badges.length,
      completionState: progress?.profile?.guru ? 'Certificate earned' : badges.length ? 'In progress' : 'Not started',
      amountDone: `${badges.length}/5`,
      wrongAnswers,
      timeSpent,
      currentModule: progress?.wallet?.week || 1,
      progress,
    }
  }))
  return rows.sort((a, b) => a.email.localeCompare(b.email))
}
