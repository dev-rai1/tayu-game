-- TAYU account system: run this once in the Supabase SQL editor.
-- (Dashboard -> SQL Editor -> New query -> paste -> Run)

-- 1) The sign-up answers, one row per user.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'student', -- student | teacher | parent | admin
  grade_levels text default '',
  found_via text default '',
  social text default '',
  created_at timestamptz default now()
);

-- 2) Saved game progress, one row per user (the whole wallet+profile snapshot).
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb,
  updated_at timestamptz default now()
);

-- 3) Row-level security: users see/write their own rows; admins see everything.
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- 4) THE ADMIN ACCOUNT. First create the user in Authentication -> Users ->
--    "Add user" with email tayu.finance@gmail.com and password tayuadmin9876
--    (check "auto confirm"). Then run this to flag it as admin:
insert into public.profiles (id, email, role)
select id, email, 'admin' from auth.users where email = 'tayu.finance@gmail.com'
on conflict (id) do update set role = 'admin';

-- 5) Dev's account: have Dev sign up in the app with devr53247@gmail.com
--    (or add the user the same way), then grant admin with:
-- update public.profiles set role = 'admin' where email = 'devr53247@gmail.com';
