-- Pixel Reveal leaderboard setup
-- Run this in Supabase SQL Editor for the project used by config.js

create extension if not exists pgcrypto;

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 16),
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'leaderboard'
      and policyname = 'Anyone can read leaderboard'
  ) then
    create policy "Anyone can read leaderboard"
      on public.leaderboard
      for select
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'leaderboard'
      and policyname = 'Anyone can insert scores'
  ) then
    create policy "Anyone can insert scores"
      on public.leaderboard
      for insert
      with check (true);
  end if;
end $$;
