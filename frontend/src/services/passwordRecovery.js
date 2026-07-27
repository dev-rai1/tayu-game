import { sendPasswordResetEmail } from 'firebase/auth'
import { prepareFirebaseAuth } from './firebase.js'

const LEGACY_ACCOUNTS_KEY = 'tayu-accounts-v1'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function legacyAccountFor(email) {
  try {
    const accounts = JSON.parse(localStorage.getItem(LEGACY_ACCOUNTS_KEY) || '{}')
    return accounts[normalizeEmail(email)] || null
  } catch {
    return null
  }
}

function resetReturnUrl() {
  if (typeof window === 'undefined' || !window.location?.origin) return undefined
  return `${window.location.origin}/login?mode=signin&reset=complete`
}

function recoveryError(error) {
  const messages = {
    'auth/invalid-email': 'Please enter the exact email address used for your TAYU account.',
    'auth/missing-email': 'Please enter your account email.',
    'auth/user-disabled': 'This account has been disabled. Please contact TAYU for help.',
    'auth/too-many-requests': 'Too many reset attempts were made. Wait a few minutes, then try again.',
    'auth/network-request-failed': 'TAYU could not reach Firebase. Check your internet connection and try again.',
    'auth/operation-not-allowed': 'Password reset is not enabled in Firebase yet. A TAYU administrator must enable Email/Password authentication.',
    'auth/configuration-not-found': 'Firebase Authentication is not fully configured for TAYU yet.',
    'auth/invalid-api-key': 'The TAYU Firebase configuration is invalid.',
  }
  return new Error(messages[error?.code] || error?.message || 'The reset email could not be sent. Please try again.')
}

function activationProfile(account) {
  if (!account) return null
  const role = ['teacher', 'student', 'other'].includes(account.role) ? account.role : 'other'
  return {
    role,
    gradeLevels: account.gradeLevels || '',
    foundVia: account.foundVia || '',
    organizationName: account.organizationName || '',
  }
}

export async function requestPasswordReset(rawEmail) {
  const email = normalizeEmail(rawEmail)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter the exact email address used for your TAYU account.')
  }

  const firebase = await prepareFirebaseAuth()
  if (!firebase?.auth) {
    throw new Error('Account services are temporarily unavailable. Refresh the page and try again.')
  }

  firebase.auth.languageCode = 'en'
  const returnUrl = resetReturnUrl()
  const settings = returnUrl ? { url: returnUrl, handleCodeInApp: false } : undefined
  const legacyAccount = legacyAccountFor(email)

  try {
    if (settings) await sendPasswordResetEmail(firebase.auth, email, settings)
    else await sendPasswordResetEmail(firebase.auth, email)
  } catch (error) {
    // If a Firebase project has not added the custom domain to Authorized domains,
    // retry with Firebase's hosted handler so email delivery still has a chance to work.
    if (settings && ['auth/invalid-continue-uri', 'auth/unauthorized-continue-uri', 'auth/unauthorized-domain'].includes(error?.code)) {
      try {
        await sendPasswordResetEmail(firebase.auth, email)
      } catch (fallbackError) {
        if (fallbackError?.code !== 'auth/user-not-found') throw recoveryError(fallbackError)
      }
    } else if (error?.code !== 'auth/user-not-found') {
      throw recoveryError(error)
    }
  }

  const legacyActivationAvailable = Boolean(legacyAccount && !legacyAccount.migratedToFirebase)
  return {
    email,
    legacyActivationAvailable,
    activationProfile: legacyActivationAvailable ? activationProfile(legacyAccount) : null,
    message: `A password-reset request was sent for ${email}. Check Inbox, Spam, and Promotions. Open the newest email and use its link.`,
  }
}
