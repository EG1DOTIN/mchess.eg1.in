# Pages & Features Guide — Marwadi Chess

Comprehensive guide to each application page and view implemented in [`mchess.eg1.in`](../src/pages/).

---

## 🗺️ Page Implementation Matrix

| File | Route | Focus | Key Features |
| :--- | :--- | :--- | :--- |
| [`HomePage.tsx`](../src/pages/HomePage.tsx) | `/`, `index.html` | Hero, Quotes & Teaser | Quotes carousel, tactical teaser, quick play CTAs |
| [`PlayOnlinePage.tsx`](../src/pages/PlayOnlinePage.tsx) | `playonline.html` | Realtime Multiplayer | Room matchmaking, live clock countdowns, chat |
| [`PlayCompPage.tsx`](../src/pages/PlayCompPage.tsx) | `playcomp.html` | AI Engine Play | Selectable difficulty, board flip, move takeback |
| [`TrainPage.tsx`](../src/pages/TrainPage.tsx) | `train.html` | Tactics & Analysis | FEN board setup, legal move calculation, coordinate trainer |
| [`DailyPuzzlesPage.tsx`](../src/pages/DailyPuzzlesPage.tsx) | `dailypuzzles.html` | Tactical Problems | Daily problem solver, move validation, step-by-step hints |
| [`ChessRulesPage.tsx`](../src/pages/ChessRulesPage.tsx) | `chessrules.html` | Rules & Movements | Interactive rules guide, special moves, checkmate logic |
| [`ChessTrapsPage.tsx`](../src/pages/ChessTrapsPage.tsx) | `chesstraps.html` | Opening Traps | Famous opening traps and tactical refutations |
| [`PgnGamesPage.tsx`](../src/pages/PgnGamesPage.tsx) | `pgngames.html` | Master PGN Database | Interactive PGN reader, Grandmaster move replay |
| [`MyGamesPage.tsx`](../src/pages/MyGamesPage.tsx) | `mygames.html` | Played Games History | Locally persisted games, move-by-move replay, PGN export |
| [`WatchLivePage.tsx`](../src/pages/WatchLivePage.tsx) | `watchlive.html` | Live GM Broadcasts | Live top Grandmaster tournament match viewers |
| [`BlogPage.tsx`](../src/pages/BlogPage.tsx) | `blog.html` | Articles & Puzzles | Mate-in-2, Mate-in-3, Quotes, Chess History articles |
| [`UpdatesPage.tsx`](../src/pages/UpdatesPage.tsx) | `updates.html` | Platform Changelog | Version history, engine upgrades, UI improvements |
| [`AboutPage.tsx`](../src/pages/AboutPage.tsx) | `about.html` | Marwadi Chess Mission | Community history, founder story, vision |
| [`PrivacyPolicyPage.tsx`](../src/pages/PrivacyPolicyPage.tsx) | `privacypolicy.html` | GDPR Disclosures | Telemetry disclosures and cookie consent management |
| [`AdminPage.tsx`](../src/pages/AdminPage.tsx) | `admin.html`, `/admin` | 2FA Admin Studio | Visitor Analytics, User Messages, Chess Articles Studio |

---

## 1. Home Page (`HomePage.tsx`)

The central landing page welcoming chess players:
- **Hero Callouts**: Direct CTAs for *Play Online*, *Play vs Computer*, and *Daily Puzzles*.
- **Interactive Quotes Carousel**: Curated chess quotes from legendary Grandmasters with smooth auto-cycling.
- **Daily Tactical Teaser**: Highlights the current tactical challenge of the day with instant solve links.

---

## 2. Play Online (`PlayOnlinePage.tsx`)

Real-time multiplayer chess rooms:
- **Room Creation**: Users select time controls (Blitz 3m, Rapid 10m, Classical 15m+10s).
- **Match Pairing**: Direct URL invitation sharing or public room listings.
- **Game Controls**: Resign, offer draw, flip board, sound SFX on moves.

---

## 3. Play vs Computer (`PlayCompPage.tsx`)

Interactive single-player engine:
- **Difficulty Selection**: Beginner, Intermediate, and Advanced difficulty presets.
- **Assistance Tools**: Move undo/takeback, legal move indicators, evaluation bar.

---

## 4. Train Yourself (`TrainPage.tsx`)

Tactics training and freeform board analysis:
- **FEN Import/Export**: Paste any FEN string to analyze arbitrary middlegame or endgame positions.
- **Coordinate Training**: Rapid-fire drill testing board coordinate recognition.

---

## 5. Daily Puzzles (`DailyPuzzlesPage.tsx`)

Tactical problem of the day:
- **Move Validation**: Instant feedback on correct vs blunder moves.
- **Hint Engine**: Reveals tactical clues without giving away the full solution.

---

## 6. Basic Chess Rules (`ChessRulesPage.tsx`)

Comprehensive interactive learning guide:
- **Piece Movement Rules**: Illustrated diagrams demonstrating King, Queen, Rook, Bishop, Knight, and Pawn movement.
- **Special Moves**: Step-by-step guides for Castling, En Passant, and Pawn Promotion.

---

## 7. Learn Chess Traps (`ChessTrapsPage.tsx`)

Opening traps library:
- Demonstrates tactical traps including the *Fried Liver Attack*, *Scholar's Mate*, *Blackburne Shilling Gambit*, and *Fishing Pole Trap*.

---

## 8. PGN Games Database (`PgnGamesPage.tsx`)

Master games library:
- Ingests standard PGN game strings.
- Interactive move navigation with forwards, backwards, jump-to-start, and jump-to-end controls.

---

## 9. My Played Games (`MyGamesPage.tsx`)

Personal match history:
- Persists games played locally via `localStorage`.
- Move replay with PGN export for external engine analysis.

---

## 10. Watch Top Live Games (`WatchLivePage.tsx`)

Broadcast center for elite chess:
- Embedded streams and live boards covering international FIDE tournaments and championship matches.

---

## 11. Chess Blog & Puzzle Articles (`BlogPage.tsx`)

Categorized technical and puzzle repository:
- Filter by *Mate in 2*, *Mate in 3*, *Mate in 4*, *Chess Quotes*, and *Chess History*.

---

## 12. Updates & Changelog (`UpdatesPage.tsx`)

Platform release timeline:
- Chronological release cards detailing platform updates, engine speed optimizations, and new puzzles.

---

## 13. About Page (`AboutPage.tsx`)

Marwadi Chess community origins:
- Exploration of the vision behind Marwadi Chess, open-source technology stack, and community credits.

---

## 14. Privacy Policy (`PrivacyPolicyPage.tsx`)

Data transparency and consent:
- Details anonymous session telemetry and provides user opt-out controls.

---

## 15. Admin Console (`AdminPage.tsx`)

Dedicated management console isolated from public layout:
- **2FA Protection**: Google OAuth whitelist (configured via `VITE_ADMIN_ALLOWED_EMAILS`) + 16-digit salted SHA-256 PIN.
- **Layout Shell**: Responsive [`AdminLayout`](https://github.com/EG1DOTIN/eg-web-core/blob/main/docs/admin-suite.md) with MChess branding.
- **Core Modules**:
  - **Visitor Analytics**: Multi-domain telemetry grid consuming 50-record bucket documents.
  - **User Inquiries**: Review and delete user contact inquiries.
  - **Chess Articles Studio**: Split Markdown authoring studio for publishing puzzles and articles.
- **Exit Action**: Header button allowing one-click return to `index.html`.
