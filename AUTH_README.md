# TAYU Accounts — how to turn on CLOUD mode

The login/account system ships in two modes:

- **Demo mode (right now, no setup):** the full flow works — sign-up with all
  the profile questions, log in, saved progress per account, the admin
  analytics dashboard — but accounts live only in that device's browser
  storage, and password-reset emails cannot send. The admin account
  (`tayu.finance@gmail.com` / `tayuadmin9587`) and Dev's account
  (`devr53247@gmail.com`, password set on first sign-up) are pre-seeded.
- **Cloud mode (10 minutes of setup):** real accounts for everyone, on every
  device, with secure hashed passwords and working reset emails, via
  Supabase's free tier.

## Turning on cloud mode

1. Create a free project at https://supabase.com (any name, any region).
2. In the project: **SQL Editor → New query**, paste the contents of
   `supabase-setup.sql` (in this folder), Run. Follow the comment in step 4
   of that file to create the admin user first (Authentication → Users →
   Add user → `tayu.finance@gmail.com` / `tayuadmin9587`, auto-confirm ON),
   then re-run the final insert so it gets the admin role.
3. Project **Settings → API**: copy the *Project URL* and the *anon public*
   key.
4. In Vercel (project `finquest1/tayu`): **Settings → Environment
   Variables**, add both for Production (and Preview):
   - `VITE_SUPABASE_URL` = the project URL
   - `VITE_SUPABASE_ANON_KEY` = the anon key
5. Redeploy. The login page badge switches from "demo" to cloud
   automatically; reset emails now send (Supabase → Authentication → Email
   Templates to customize the wording).

Passwords are hashed by Supabase Auth — never stored by TAYU. The anon key
is safe to expose in the client; the row-level-security policies in the SQL
file are what protect the data (users only see their own rows, admins see
everything).

## Where things live in the code

- `frontend/src/services/auth.js` — the whole account layer (cloud + demo).
- `frontend/src/pages/Auth.jsx` — Log In / Sign Up / Forgot password.
- `frontend/src/pages/Dashboard.jsx` — the admin analytics (role=admin only).
- Progress syncs automatically ~2.5s after every game save.
