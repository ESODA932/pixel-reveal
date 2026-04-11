# Static 🎮

A browser-based picture guessing game built for the **Decoding Chaos** hackathon at Lewis & Clark College.

Each round, an image starts hidden beneath TV static and pixelation — like a bad antenna signal. Over 15 seconds it gradually clears. Type what you see and guess as fast as you can. Faster correct guesses score more points.

**Play it live:** [esoda932.github.io/pixel-reveal](https://esoda932.github.io/pixel-reveal)

---

## How the Game Works

- Pick a category: **TV**, **Games**, or **Sports**
- 5 rounds per game — each round shows a new image
- The image starts heavily pixelated and covered in colored static noise
- Over 15 seconds the static fades and the image sharpens — like tuning an antenna
- Correct guess scores up to **1000 points** — faster = higher score
- Final score is saved to a **global leaderboard**

---

## Project Structure

```
├── index.html        # Game UI and layout
├── game.js           # All game logic — rounds, scoring, rendering, leaderboard
├── gameImages.js     # Image data module — fetches questions from Supabase
├── styles.css        # Retro CRT aesthetic — dark background, orange accents
├── config.js         # Supabase credentials (not committed — see setup below)
├── config.example.js # Template for config.js
└── static-intro.gif  # Animated logo used in splash screen and header
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Plain HTML, CSS, JavaScript — no frameworks |
| Rendering | Canvas API — real-time pixelation and RGB noise generation |
| Image source | TMDB (The Movie Database) |
| Database | Supabase — stores questions and leaderboard scores |
| Hosting | GitHub Pages |

---

## Running Locally

ES modules require an HTTP server — opening `index.html` directly via `file://` won't work.

The easiest way:

```bash
npx serve .
```

Then open `http://localhost:3000` in your browser.

---

## Supabase Setup

The game uses Supabase for two things: storing the image questions and the global leaderboard.

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a free project.

### 2. Create the tables

In the **SQL Editor**, run the following:

```sql
-- Questions table (stores all game images)
create table public.questions (
  id bigint generated always as identity primary key,
  category text not null,
  answer text not null,
  alt_answers jsonb not null default '[]',
  image_url text not null
);

alter table public.questions enable row level security;

create policy "Anyone can read questions"
  on public.questions for select
  using (true);

-- Leaderboard table
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

### 3. Add your credentials

Copy `config.example.js` to `config.js` and fill in your project details:

```js
export const SUPABASE_URL = "https://your-project.supabase.co";
export const SUPABASE_ANON_KEY = "your-anon-key";
```

Find these in your Supabase project under **Settings → API**.

### 4. Add questions

Insert image entries into the `questions` table. Each row needs:

| Column | Example |
|--------|---------|
| `category` | `TV`, `GAMES`, or `SPORTS` |
| `answer` | `Breaking Bad` |
| `alt_answers` | `["breaking bad"]` |
| `image_url` | A direct image URL |

Example SQL insert:

```sql
insert into public.questions (category, answer, alt_answers, image_url) values
('TV', 'Breaking Bad', '["breaking bad"]', 'https://image.tmdb.org/t/p/...'),
('GAMES', 'Minecraft', '["minecraft"]', 'https://...');
```

> **Image URL tip:** Use direct image links that allow hotlinking. TMDB (`image.tmdb.org`) and Wikimedia Commons work well. Avoid Pinterest, Getty, and wallpaper sites — they block external image requests.

---

## Scoring

| Time of guess | Score |
|---------------|-------|
| Instant (0s) | 1000 pts |
| 15 seconds | 50 pts |
| Pass / time out | 0 pts |

Formula: `Math.max(50, Math.round(1000 - (elapsedSeconds / 15) * 950))`

---

## Built With AI Assistance

This project was built with [Claude](https://claude.ai) as a coding assistant throughout development. All design decisions, feature ideas, and direction came from the developer — Claude was used to write, debug, and iterate on the code rapidly during the hackathon.
