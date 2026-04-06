# Pixel Reveal

A browser mini-game: each picture starts heavily pixelated and resolves over **15 seconds**. Type what you see in the box; **faster correct guesses score more points** (up to 1000 per round, minimum 50 if you barely make it before the timer ends). The run lasts **5 rounds**. Local high scores are stored in your browser; optional **Supabase** powers a global leaderboard.

## Run locally

Open `index.html` in a modern browser, or serve the folder:

```bash
npx serve .
```

ES modules require **http** (not `file://`) unless your browser allows local modules.

## Global leaderboard (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/setup.sql` from this repo (or paste the SQL below):

```sql
create table public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  score int not null check (score >= 0),
  created_at timestamptz default now()
);

alter table public.leaderboard enable row level security;

create policy "Anyone can read leaderboard"
  on public.leaderboard for select
  using (true);

create policy "Anyone can insert scores"
  on public.leaderboard for insert
  with check (true);
```

3. Copy **Project URL** and an API key from **Settings → API** (use the **anon** legacy JWT, or your dashboard’s **publishable** key if REST requests succeed with it).
4. Put them in `config.js` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

Without this file filled in, the game still works; only local scores update.

If the app shows "table not found", it means `public.leaderboard` does not exist yet in that project. Run `supabase/setup.sql` and refresh.

## Scoring note

The in-game hint uses **faster = higher points**. If you prefer the opposite (reward patience), change `pointsForElapsed` in `game.js`.
