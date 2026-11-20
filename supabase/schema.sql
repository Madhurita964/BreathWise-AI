-- Run in your Supabase SQL editor. Authentication uses Supabase email magic links.
create table if not exists public.user_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 profiles jsonb not null default '[]'::jsonb check (jsonb_typeof(profiles) = 'array'),
 activities jsonb not null default '[]'::jsonb check (jsonb_typeof(activities) = 'array'),
 updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
drop policy if exists "Read own preferences" on public.user_preferences;
create policy "Read own preferences" on public.user_preferences for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own preferences" on public.user_preferences;
create policy "Insert own preferences" on public.user_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own preferences" on public.user_preferences;
create policy "Update own preferences" on public.user_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.user_preferences to authenticated;
revoke all on public.user_preferences from anon;
