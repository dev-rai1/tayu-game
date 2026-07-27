# TAYU Firebase accounts

TAYU now uses the same Firebase project for Hosting, Authentication, and Cloud
Firestore. When the Firebase web environment variables are present, users get
real cross-device accounts, persisted login sessions, synced progress, and
password-reset emails. Without those variables, the app still boots in local
practice mode, but accounts stay on that browser and reset emails cannot send.

## One-time Firebase Console setup

1. Open the Firebase project `tayu-financial-literacy`.
2. Go to **Build -> Authentication -> Sign-in method** and enable
   **Email/Password**.
3. Go to **Build -> Firestore Database** and create the database.
4. Go to **Project settings -> General -> Your apps**. Create or select the web
   app and copy its Firebase configuration values.
5. In **Authentication -> Settings -> Authorized domains**, confirm that
   `tayufinance.app`, the Firebase Hosting domains, and any preview domain used
   for testing are listed.

## Environment variables

Copy `frontend/.env.example` to `frontend/.env` for local builds, or add the
same names as GitHub Actions repository secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL` (optional; used by the existing realtime solo mode)
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Vite embeds these public Firebase web configuration values during the build.
Access control is enforced by Authentication and `firestore.rules`; never put a
Firebase Admin SDK private key in a `VITE_` variable.

## Deploy

The repository is already connected to the Firebase project through
`.firebaserc`. Build and deploy Hosting plus Firestore rules with:

```bash
cd frontend
npm ci
npm run build
cd ..
firebase deploy --only hosting,firestore:rules
```

The GitHub Actions workflow performs the same deployment from `main` when the
Firebase environment secrets and `FIREBASE_TOKEN` are configured.

## Admin access

Normal sign-up can create only `student`, `teacher`, or `other` profiles. To
make an existing Firebase user an administrator, open **Firestore Database ->
profiles -> the user's UID** and change the `role` field to `admin`. Firestore
rules prevent a normal user from promoting their own account.

## Where to verify it

- **Authentication -> Users:** registered email/password accounts.
- **Firestore Database -> profiles:** role and sign-up questions by Firebase UID.
- **Firestore Database -> progress:** each user's synced game snapshot.
- **Hosting:** production releases and the Firebase site URLs.

## Password reset flow

The login page includes **Forgot password?**. Firebase sends the reset email and
returns the user to `/login?mode=signin` after the password is changed. Reset
links require the website domain to be listed under Authentication's authorized
domains.

## Main code locations

- `frontend/src/services/firebase.js` — shared Firebase initialization.
- `frontend/src/services/auth.js` — sign-up, sign-in, logout, reset email,
  Firestore profiles/progress, and local practice fallback.
- `frontend/src/pages/Auth.jsx` — account and forgot-password interface.
- `firestore.rules` — profile/progress access control.
- `.github/workflows/firebase-hosting-deploy.yml` — automatic deployment.
