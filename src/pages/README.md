# Marwadi Chess Pages Directory (`src/pages/`)

This directory houses all page controllers and gaming arenas for the `mchess.eg1.in` platform.

---

## 📑 Pages Inventory & Route Mapping

| Page File | Clean URL Route | Subsystem / Capabilities |
|---|---|---|
| [`HomePage.tsx`](./HomePage.tsx) | `/` or `/index` | Interactive Hero, Daily Tactical Puzzle spotlight, Grandmaster Quote carousel |
| [`PlayOnlinePage.tsx`](./PlayOnlinePage.tsx) | `/playonline` | Real-time peer-to-peer multiplayer rooms, game clock timers, resign/draw controls |
| [`PlayCompPage.tsx`](./PlayCompPage.tsx) | `/playcomp` | Local AI engine play with selectable difficulty (Easy, Medium, Master), move history |
| [`TrainPage.tsx`](./TrainPage.tsx) | `/train` | Tactics Arena: 1,500+ puzzles from `train.pgn`, interactive move validation, hints |
| [`DailyPuzzlesPage.tsx`](./DailyPuzzlesPage.tsx) | `/dailypuzzles` | Date-indexed daily tactical problems with solution reveals and analysis |
| [`ChessRulesPage.tsx`](./ChessRulesPage.tsx) | `/chessrules` | Interactive FIDE rules guide with live animated piece movement demonstrators |
| [`ChessTrapsPage.tsx`](./ChessTrapsPage.tsx) | `/chesstraps` | Repertoire of 15 master opening traps (Stafford, Blackburne, Legal, Fishing Pole) |
| [`PgnGamesPage.tsx`](./PgnGamesPage.tsx) | `/pgngames` | Historical Master Games database viewer with forward/back move stepping |
| [`MyGamesPage.tsx`](./MyGamesPage.tsx) | `/mygames` | Player match logs saved in `localStorage`, PGN export, game review launcher |
| [`WatchLivePage.tsx`](./WatchLivePage.tsx) | `/watchlive` | Live broadcast feed of top Grandmaster games |
| [`BlogPage.tsx`](./BlogPage.tsx) | `/blog` | Mate-in-N tactical studies and Grandmaster wisdom quotes |
| [`UpdatesPage.tsx`](./UpdatesPage.tsx) | `/updates` | Platform version history, feature announcements, bug resolution logs |
| [`AboutPage.tsx`](./AboutPage.tsx) | `/about` | Marwadi Chess mission, technology overview, FAQ, and contributor guidelines |
| [`AdminPage.tsx`](./AdminPage.tsx) | `/admin` | 2FA protected admin panel for telemetry and maintenance |

---

## 🔄 Client-Side Routing Architecture
1. In `src/App.tsx`, `navigateTo()` normalizes any incoming link (stripping `.html`, queries, and hashes) before pushing to `window.history`.
2. Both clean URLs (`/train`) and legacy file URLs (`/train.html`) resolve to the exact same page controller.

