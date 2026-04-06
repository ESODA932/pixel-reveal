// Data-only module for Pixel Reveal (no DOM, no imports, no game runtime logic)

export const IMAGE_ENTRIES = [
  // ── TV ────────────────────────────────────────────────────
  {
    category: "TV",
    answer: "Breaking Bad",
    altAnswers: ["breaking bad"],
    wikiTitle: "Breaking_Bad",
  },
  {
    category: "TV",
    answer: "The Simpsons",
    altAnswers: ["simpsons", "the simpsons"],
    wikiTitle: "The_Simpsons",
  },
  {
    category: "TV",
    answer: "Game of Thrones",
    altAnswers: ["got", "game of thrones"],
    wikiTitle: "Game_of_Thrones",
  },
  {
    category: "TV",
    answer: "Stranger Things",
    altAnswers: ["stranger things"],
    wikiTitle: "Stranger_Things",
  },
  {
    category: "TV",
    answer: "The Office",
    altAnswers: ["office", "the office"],
    wikiTitle: "The_Office_(American_TV_series)",
  },
  {
    category: "TV",
    answer: "Friends",
    altAnswers: ["friends"],
    wikiTitle: "Friends",
  },
  {
    category: "TV",
    answer: "SpongeBob SquarePants",
    altAnswers: ["spongebob", "sponge bob", "spongebob squarepants"],
    wikiTitle: "SpongeBob_SquarePants_(character)",
  },
  {
    category: "TV",
    answer: "The Walking Dead",
    altAnswers: ["walking dead", "the walking dead"],
    wikiTitle: "The_Walking_Dead_(TV_series)",
  },
  {
    category: "TV",
    answer: "Seinfeld",
    altAnswers: ["seinfeld"],
    wikiTitle: "Seinfeld",
  },
  {
    category: "TV",
    answer: "South Park",
    altAnswers: ["south park"],
    wikiTitle: "South_Park",
  },

  // ── GAMES ─────────────────────────────────────────────────
  {
    category: "GAMES",
    answer: "Minecraft",
    altAnswers: ["minecraft"],
    wikiTitle: "Minecraft",
  },
  {
    category: "GAMES",
    answer: "Pac-Man",
    altAnswers: ["pacman", "pac man"],
    wikiTitle: "Pac-Man_(character)",
  },
  {
    category: "GAMES",
    answer: "Tetris",
    altAnswers: ["tetris"],
    wikiTitle: "Tetris",
  },
  {
    category: "GAMES",
    answer: "Super Mario Bros",
    altAnswers: ["mario", "super mario"],
    wikiTitle: "Mario",
  },
  {
    category: "GAMES",
    answer: "The Legend of Zelda",
    altAnswers: ["zelda", "legend of zelda"],
    wikiTitle: "Link_(The_Legend_of_Zelda)",
  },
  {
    category: "GAMES",
    answer: "Space Invaders",
    altAnswers: ["space invaders"],
    wikiTitle: "Space_Invaders",
  },
  {
    category: "GAMES",
    answer: "Donkey Kong",
    altAnswers: ["donkey kong", "dk"],
    wikiTitle: "Donkey_Kong",
  },
  {
    category: "GAMES",
    answer: "Among Us",
    altAnswers: ["among us"],
    wikiTitle: "Among_Us",
  },
  {
    category: "GAMES",
    answer: "Fortnite",
    altAnswers: ["fortnite"],
    wikiTitle: "Fortnite",
  },
  {
    category: "GAMES",
    answer: "Pong",
    altAnswers: ["pong"],
    wikiTitle: "Pong",
  },

  // ── SPORTS ────────────────────────────────────────────────
  {
    category: "SPORTS",
    answer: "Basketball",
    altAnswers: ["basketball"],
    wikiTitle: "Basketball",
  },
  {
    category: "SPORTS",
    answer: "Soccer",
    altAnswers: ["football", "soccer"],
    wikiTitle: "Association_football",
  },
  {
    category: "SPORTS",
    answer: "Tennis",
    altAnswers: ["tennis"],
    wikiTitle: "Tennis",
  },
  {
    category: "SPORTS",
    answer: "Baseball",
    altAnswers: ["baseball"],
    wikiTitle: "Baseball",
  },
  {
    category: "SPORTS",
    answer: "Swimming",
    altAnswers: ["swimming"],
    wikiTitle: "Swimming_(sport)",
  },
  {
    category: "SPORTS",
    answer: "Cycling",
    altAnswers: ["cycling", "bike"],
    wikiTitle: "Cycling",
  },
  {
    category: "SPORTS",
    answer: "Boxing",
    altAnswers: ["boxing"],
    wikiTitle: "Boxing",
  },
  {
    category: "SPORTS",
    answer: "Golf",
    altAnswers: ["golf"],
    wikiTitle: "Golf",
  },
  {
    category: "SPORTS",
    answer: "Skiing",
    altAnswers: ["skiing", "ski"],
    wikiTitle: "Alpine_skiing",
  },
  {
    category: "SPORTS",
    answer: "Rowing",
    altAnswers: ["rowing", "crew"],
    wikiTitle: "Rowing_(sport)",
  },
];

/**
 * Fetches a working image URL for a single Wikipedia article title.
 * Uses the Wikipedia pageimages API — free, no key, CORS-enabled.
 * Returns null if no image is found.
 */
export async function fetchWikiImage(wikiTitle, thumbSize = 800) {
  const url =
    `https://en.wikipedia.org/w/api.php` +
    `?action=query&prop=pageimages&format=json&origin=*` +
    `&piprop=thumbnail&pithumbsize=${thumbSize}` +
    `&titles=${encodeURIComponent(wikiTitle)}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.thumbnail?.source ?? null;
}

/**
 * Loads all entries, resolving each to a working image URL.
 * Call this once on game start and cache the result.
 *
 * Returns:
 *   { category, answer, altAnswers, wikiTitle, imageUrl }
 */
export async function loadGameImages() {
  const results = await Promise.all(
    IMAGE_ENTRIES.map(async (entry) => {
      const imageUrl = await fetchWikiImage(entry.wikiTitle);
      return { ...entry, imageUrl };
    })
  );
  return results;
}

/**
 * Checks if a player's guess matches an entry.
 * Case-insensitive, trims whitespace, strips punctuation.
 */
export function checkAnswer(entry, playerInput) {
  const normalize = (s) =>
    String(s ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "");
  const accepted = [entry.answer, ...(entry.altAnswers || [])].map(normalize);
  return accepted.includes(normalize(playerInput));
}

/**
 * Calculates score based on how quickly the player guessed.
 * 1000 pts at t=0, scales down to 50 pts at t=15s.
 */
export function calcScore(elapsedSeconds) {
  return Math.max(50, Math.round(1000 - (elapsedSeconds / 15) * 950));
}
