import { doc, getDoc } from 'firebase/firestore'
import { prepareFirebaseAuth } from './firebase.js'

// Administrative authorization is data-driven. No shared password, password
// hash, privileged email allowlist, or role-promotion logic belongs in the
// downloadable browser bundle.
export async function verifyAdminAccess(user = null) {
  const firebase = await prepareFirebaseAuth()
  const firebaseUser = firebase?.auth?.currentUser
  const uid = firebaseUser?.uid || user?.id
  if (!firebase?.firestore || !firebaseUser || !uid || firebaseUser.uid !== uid) return null

  try {
    const snapshot = await getDoc(doc(firebase.firestore, 'profiles', uid))
    if (!snapshot.exists() || snapshot.data()?.role !== 'admin') return null
    return { ...user, id: uid, email: firebaseUser.email || user?.email || '', role: 'admin', cloud: true }
  } catch {
    return null
  }
}
