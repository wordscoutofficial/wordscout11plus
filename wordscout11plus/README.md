# WordScout11Plus

A Blooket/Kahoot-style learning game platform for 11+ vocabulary prep.
Eight game modes, weekly word sets, dark/light mode, and an admin panel —
built with React + Vite.

Brand colours: cyan `#01B5C9`, yellow `#FFEB5B`, cream `#FEF8DD`.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 18 or newer) installed.

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the local site
```

Then open the link it prints (usually http://localhost:5173).

To create a production build:

```bash
npm run build    # output goes into the dist/ folder
npm run preview  # preview that build locally
```

---

## What works right now

- Eight game modes: Flashcards, Fill the Blank, Spelling Test, Match-Up Pairs,
  Quiz Rush (Kahoot-style), Gold Hunt (Blooket-style), Hangman, and Word Guess
  (Wordle-style, no hints).
- Student dashboard with a weekly set library, "this week's set", and a streak.
- Stars, badges, and a leaderboard.
- Dark / light mode (gear icon, top right).
- Join-by-code guest play (no account).
- Admin panel: create / edit / lock / publish sets, view users, generate codes.
  Sign in with the email `admin@wordscout11plus.com` (any password) to see it.

> Note: this version stores everything in memory, so data resets when you
> refresh. The next section explains how to make it permanent.

---

## Put it on GitHub

1. Create a new, empty repository on github.com (e.g. `wordscout11plus`).
2. In this project folder, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wordscout11plus.git
git push -u origin main
```

(If you prefer no command line: on the GitHub repo page choose
"uploading an existing file" and drag this whole folder in — but skip the
`node_modules` folder, it is large and rebuilt automatically.)

---

## Put it online (free) and connect your domain

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. "Add New Project" -> pick your `wordscout11plus` repo -> Deploy.
   Vercel detects Vite automatically; no settings needed.
3. In the project's Settings -> Domains, add `wordscout11plus.com` and follow
   the DNS instructions (usually two records to change at your domain provider).

Netlify works the same way if you prefer it.

---

## Making accounts and sets permanent (next step)

The app currently uses sample data held in memory. To save real users, progress,
and weekly sets, connect a free database. [Supabase](https://supabase.com) is the
easiest fit and also provides Email/Password and Google sign-in out of the box.

High-level plan:

1. Create a Supabase project.
2. Add tables: `sets`, `set_items`, `profiles`, `progress`, `game_codes`.
3. Replace the mocked `Auth` component with Supabase Auth.
4. Replace the `SAMPLE_SETS` constant and the in-memory `progress` state with
   reads/writes to Supabase.
5. Store your Supabase URL and key in a `.env` file (already git-ignored):

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Everything is organised so these swaps are contained: auth lives in the `Auth`
component, and all data flows through the `sets` and `progress` state at the top
of `src/App.jsx`.

---

## Project structure

```
wordscout11plus/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx      # app entry point
   ├─ index.css     # fonts + reset
   └─ App.jsx       # the whole app (UI, games, admin)
```
