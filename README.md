# ♟️ Marwadi Chess ([mchess.eg1.in](https://mchess.eg1.in)) — Website Pages & User Guide

Welcome to the official user guide for **Marwadi Chess** ([mchess.eg1.in](https://mchess.eg1.in)). Marwadi Chess is a free, web-based chess portal and learning platform designed to help chess enthusiasts of all skill levels—from complete beginners to tournament players—learn rules, practice tactics, study opening traps, replay grandmaster games, play vs AI engines or online opponents, review personal game archives, and watch live international broadcasts.

---

## 🗺️ Website Overview & Page Directory

| Page Name | Page URL | Category | Core Purpose & Visitor Experience |
| :--- | :--- | :--- | :--- |
| **Home Portal** | [`index.html`](index.html) | Navigation Hub | Main gateway featuring 12 interactive feature cards, latest updates, and community links. |
| **Play Online Arena** | [`playonline.html`](playonline.html) | Play & Multiplayer | Real-time online lobby, 1-click challenges, digital clocks, local Pass & Play, and club rooms. |
| **Play vs Computer** | [`playcomp.html`](playcomp.html) | Play & AI | Browser chess against Stockfish engine across 20 difficulty levels with instant side selection. |
| **Daily Chess Puzzles** | [`dailypuzzles.html`](dailypuzzles.html) | Training | Daily tactical puzzles with dynamic hints, solution viewer, and streak counter. |
| **Train Yourself** | [`train.html`](train.html) | Tactics & Training | Checkmate drills across Mate in 2 to Mate in 5, speed sprint challenges, and zen practice. |
| **Basic Chess Rules** | [`chessrules.html`](chessrules.html) | Learn | Interactive Academy with playable Piece Explorer, Castling & En Passant demos, and rules quiz. |
| **Learn Chess Traps** | [`chesstraps.html`](chesstraps.html) | Learn & Tactics | Interactive traps viewer with dynamic lesson cards (Bait, Blunder, Refutation) and stepper pills. |
| **PGN Games Database** | [`pgngames.html`](pgngames.html) | Study & Masters | Grandmaster game database with move notation tree, autoplay, and game-by-game analysis. |
| **Watch Top Live Games** | [`watchlive.html`](watchlive.html) | Broadcasts | 6-channel broadcast center with Theater Mode, Grid Mode, channel pills, and fullscreen modal. |
| **Chess Blog** | [`blog.html`](blog.html) | Articles & Reading | Categorized articles, tactical studies, in-place puzzle solving, and Web Share API image sharing. |
| **Website Updates** | [`updates.html`](updates.html) | Platform & News | Release notes, engine updates, feature announcements, and platform changelog. |
| **My Played Games Archive** | [`mygames.html`](mygames.html) | Play & History | Personal match history dashboard with victory stats, win rate %, search, replay board, and PGN export. |
| **About Us** | [`about.html`](about.html) | Information | Mission statement, learning philosophy, and platform background. |
| **Privacy Policy** | [`privacypolicy.html`](privacypolicy.html) | Legal | User privacy terms, cookie information, and website usage policies. |

---

## 🧭 User Navigation Flow

The following diagram illustrates how visitors navigate across the Marwadi Chess web platform:

```mermaid
flowchart TD
    Start(["Visitor Enters mchess.eg1.in"]) --> Home["🏠 Homepage / Portal Hub"]

    Home --> HeaderBar["Global Header: [🔔 Updates] [♟️ Play] [🌙 Theme] [🔄 Refresh]"]
    Home --> NavMenu["Global Navigation Menu: [HOME] [LEARN] [PUZZLES] [PLAY] [EXPLORE] [ABOUT]"]
    Home --> FeatureCards["12 Feature Portal Cards"]

    subgraph Learn_And_Train ["📚 Learn & Train"]
        Rules["♟️ Basic Chess Rules (chessrules.html)"]
        Traps["🪤 Opening Traps Viewer (chesstraps.html)"]
        DailyPuzzles["🧩 Daily Chess Puzzles (dailypuzzles.html)"]
        TacticsTrain["🎯 Train Yourself: Mate in 2 to 5 (train.html)"]
    end

    subgraph Play_And_Watch ["⚔️ Play & Broadcasts"]
        PlayOnline["🌐 Play Online Arena (playonline.html)"]
        PlayComp["🤖 Play vs Stockfish Computer (playcomp.html)"]
        MyGames["📜 My Played Games Archive (mygames.html)"]
        WatchLive["📺 6-Channel Live Broadcasts (watchlive.html)"]
    end

    subgraph Explore_And_Read ["📰 Explore & Study"]
        Blog["📰 Chess Blog & Studies (blog.html)"]
        Quotes["💬 Inspiring Chess Quotes (blog.html?cat=Chess%20Quotes)"]
        History["📜 Chess History (blog.html?cat=Chess%20History)"]
        PGN["📊 Grandmaster PGN Replays (pgngames.html)"]
        News["🔔 Platform Updates & News (updates.html)"]
    end

    subgraph Info_And_Community ["ℹ️ Information & Legal"]
        About["ℹ️ About Marwadi Chess (about.html)"]
        Privacy["📄 Privacy Policy (privacypolicy.html)"]
    end

    FeatureCards --> Learn_And_Train
    FeatureCards --> Play_And_Watch
    FeatureCards --> Explore_And_Read
    FeatureCards --> Info_And_Community

    NavMenu --> Learn_And_Train
    NavMenu --> Play_And_Watch
    NavMenu --> Explore_And_Read
    NavMenu --> Info_And_Community
```

---

## 📐 Page Wireframes & Layout Structures

### 1. Global Standard Page Template
All pages share a consistent, responsive layout structure:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] Marwadi Chess       [🔔 News]  [♟️ Play Online]  [🌙 Theme]  [🔄 Refresh]│ Header
├───────────────────────────────────────────────────────────────────────────────┤
│ HOME  |  LEARN ▾  |  PUZZLES ▾  |  PLAY ▾  |  EXPLORE ▾  |  ABOUT             │ Sticky Nav
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Page Heading / Breadcrumb Title                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                               │
│  ┌──────────────────────────────────────────────┐ ┌────────────────────────┐  │
│  │                                              │ │ Side Column:           │  │ Main
│  │          Main Interactive Content            │ │ - Community Card       │  │ Content
│  │     (Chessboard / PGN Replay / Article)      │ │ - Social Links         │  │ Area
│  │                                              │ │ - Quick Categories     │  │
│  └──────────────────────────────────────────────┘ └────────────────────────┘  │
│                                                                               │
├───────────────────────────────────────────────────────────────────────────────┤
│ Brand Summary  |  Chess Puzzles  |  Explore Links  |  Social Channels         │ Footer
│ © 2026 Marwadi Chess  |  Privacy Policy  |  Back to Top Button [^]            │
└───────────────────────────────────────────────────────────────────────────────┘
```

> **Navigation Menu Dropdown Hierarchy**:
> - **HOME**: Gateway to all 12 feature portals and quick-start links.
> - **LEARN ▾**: Basic Chess Rules, Learn Chess Traps, Watch Top Live Games, PGN Games Database, Train Yourself.
> - **PUZZLES ▾**: Train Yourself, Daily Chess Puzzle, Mate in 2, Mate in 3, Mate in 4, Mate in N.
> - **PLAY ▾**: Play Online, Play vs Computer, My Played Games.
> - **EXPLORE ▾**: Website Updates, Latest Blog, Chess Quotes, Chess History.
> - **ABOUT**: Platform background and learning mission.

---

### 2. Homepage Wireframe (`index.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Marwadi Chess Welcome Hub                           │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┤
│ 🌐 Play Online    │ 🤖 Play Computer  │ 🧩 Daily Puzzles  │ 🎯 Train Yourself │
│ Live timed games  │ Stockfish engine  │ Daily tactics &   │ 1500+ curated mate │
│ & player lobby    │ 20 levels & hints │ solving trainer   │ puzzles in 2 to 5 │
├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
│ ♟️ Basic Rules    │ 🪤 Chess Traps    │ 📊 PGN Database   │ 📺 Watch Live     │
│ Visual beginner   │ Master tactical   │ Grandmaster game  │ 6 live tournament │
│ movement guide    │ opening traps     │ archive & replay  │ broadcast channels│
├───────────────────┼───────────────────┼───────────────────┼───────────────────┤
│ 📰 Chess Blog     │ 💬 Chess Quotes   │ 🔔 Updates & News │ ℹ️ About Platform │
│ Tactical studies  │ Inspiring quotes  │ Changelogs, new   │ Mission statement │
│ & opening guides  │ & tactical vision │ features & notes  │ & learning goals  │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┘
```

---

### 3. Play Online Arena Wireframe (`playonline.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Player Identity: [ Gautam ] [ ✏️ Edit ]            [ 📜 My Played Games Archive ]│
├───────────────────────────────────────────────────────────────────────────────┤
│ VIEW 1: LOBBY & MATCHMAKING                                                   │
│ ┌───────────────────────────────────────────────────────────────────────────┐ │
│ │ 🟢 Online Players in Lobby                                                │ │
│ │ Player Name          | Preferred Time | Status             | Action       │ │
│ │ - Gautam (You)       | 5m Blitz       | Available          | (You)        │ │
│ │ - Grandmaster_AJ     | 3m Blitz       | Available          | [⚔️Challenge]│ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ 🔗 Direct Match Link Generator        │ │ 👥 Local Pass & Play            │ │
│ └───────────────────────────────────────┘ └─────────────────────────────────┘ │
│ ┌───────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏆 Affiliated Club Hubs: Marwadi on Lichess | ChessBase Playchess Room    │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────┤
│ VIEW 2: LIVE MATCH ARENA (Active Match)                                       │
│ White: Player 1 [ 05:00 ]          [ Active Match ]         Black: Player 2 [ 05:00]│
│ ┌──────────────────────────────────────────┐ ┌──────────────────────────────┐ │
│ │                                          │ │ Live Move Notation History   │ │
│ │          INTERACTIVE CHESSBOARD          │ │ 1. e4 e5                     │ │
│ │                                          │ │ 2. Nf3 Nc6                   │ │
│ └──────────────────────────────────────────┘ └──────────────────────────────┘ │
│ [ 🚩 Resign ]     [ 🤝 Offer Draw ]     [ 🔄 Flip Board ]     [ 🚪 Leave Match ]│
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Play vs Stockfish Computer Wireframe (`playcomp.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Page Title: Play vs Stockfish Computer Engine                                 │
│ Status Banner: "Your turn (White). Stockfish Skill: Level 10 (Master)"         │
├────────────────────────────────────────────┬──────────────────────────────────┤
│                                            │ White Clock: 05:00               │
│                                            │ Black Clock: 05:00               │
│          INTERACTIVE CHESSBOARD            ├──────────────────────────────────┤
│                                            │ Side: [ Play as White / Black ♚ ]│
│                                            │ Difficulty: [ Level 1 to 20 ]    │
│                                            ├──────────────────────────────────┤
│                                            │ Move Notation History:           │
│                                            │ 1. e4 e5  2. Nf3 Nc6             │
├────────────────────────────────────────────┴──────────────────────────────────┤
│ Toolbar: [ New Game ]  [ Undo Move ]  [ Hint ]  [ Flip Board ]  [ Sound 🔊 ]  │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 5. My Played Games Archive Wireframe (`mygames.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Page Title: My Played Games Archive                                           │
│ [ 🤖 Play vs Computer ]                         [ 🌐 Play Online Arena ]      │
├────────────────────┬───────────────────┬───────────────────┬──────────────────┤
│ Total Matches: 14  │ Victories: 9      │ Defeats: 3        │ Win Rate: 64%    │
├────────────────────┴───────────────────┴───────────────────┴──────────────────┤
│ MOVE REPLAY BOARD CONTAINER (Expands on "Review")                             │
│ Match: Gautam vs Stockfish (2026.08.26)       [ 💾 Download PGN ] [ ✖ Close ] │
│ ┌──────────────────────────────────────────┐ ┌──────────────────────────────┐ │
│ │         INTERACTIVE REPLAY BOARD         │ │ 1. e4 e5  2. Nf3 Nc6         │ │
│ └──────────────────────────────────────────┘ └──────────────────────────────┘ │
│ [ |◀ First ]  [ ◀ Prev ]  [ ▶ Next ]  [ Last ▶| ]  [ 🔄 Flip ]  [ ⏯ Autoplay ]│
├───────────────────────────────────────────────────────────────────────────────┤
│ [ Filter: All | Wins | Losses | Draws ]   [ 🔍 Search ]   [ 📦 Export All PGN ]│
│ ┌───────────────────────────────────────────────────────────────────────────┐ │
│ │ Date       | Matchup           | Mode        | Result | Moves | Actions   │ │
│ │ 26/08/2026 | You vs Stockfish  | vs Computer | 1-0    | 34    | Review/PGN│ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 6. Watch Top Live Games Wireframe (`watchlive.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Page Title: Live Multi-Channel Chess Broadcasts (6 Channels)                  │
│ View Mode: [ 🎬 Theater Mode (Active) ]               [ ⊞ 6-Board Grid ]       │
├───────────────────────────────────────────────────────────────────────────────┤
│ [ 🏆 TOP GM ] [ ⚡ BLITZ ] [ ⏱ RAPID ] [ 🔥 BULLET ] [ 👑 CLASSICAL ] [ 🚀 ULTRA ]│
├───────────────────────────────────────────────────────────────────────────────┤
│ THEATER MODE STAGE (Default View)                                             │
│ ┌──────────────────────────────────────────────┬────────────────────────────┐ │
│ │ 🏆 Top GM Broadcast                          │ Broadcast Details:         │ │
│ │ ┌──────────────────────────────────────────┐ │ Channel: Top Grandmaster   │ │
│ │ │                                          │ │ Feed: Lichess Open TV      │ │
│ │ │          LIVE CHESSBOARD FRAME           │ │ Quality: Real-Time Stream  │ │
│ │ │                                          │ │                            │ │
│ │ │   (Click board mask opens isolated       │ │ [ ⛶ Isolated Fullscreen ]  │ │
│ │ │    fullscreen modal overlay)             │ │ [ ↗ Open on Lichess ]      │ │
│ │ └──────────────────────────────────────────┘ └────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────────┤
│ GRID MODE (Available via [ ⊞ 6-Board Grid ] toggle)                           │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌─────────────────────┐ │
│ │ 🏆 Top GM Broadcast    │ │ ⚡ Blitz Championship  │ │ ⏱ Rapid Stream      │ │
│ ├────────────────────────┤ ├────────────────────────┤ ├─────────────────────┤ │
│ │ 🔥 Bullet Speed Channel│ │ 👑 Classical Tournament│ │ 🚀 UltraBullet      │ │
│ └────────────────────────┘ └────────────────────────┘ └─────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 7. Basic Chess Rules Academy Wireframe (`chessrules.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Hero Banner: Learn Chess Rules - Complete Beginner to Master Guide           │
│ Badges: [ 6 Piece Types ]       [ Special Moves ]       [ Interactive Quiz ]  │
├──────────────────────────┬────────────────────────────────────────────────────┤
│ STICKY TABLE OF CONTENTS │ MAIN ACADEMY CONTENT                               │
│                          │                                                    │
│ 1. Chessboard & Setup    │ 1. CHESSBOARD GEOMETRY & INITIAL PIECE SETUP       │
│ 2. Piece Movements       │ - 8x8 Grid, 64 squares, Files a-h, Ranks 1-8       │
│ 3. Special Moves         │ - Initial setup interactive board                  │
│ 4. Check & Checkmate     │                                                    │
│ 5. Draw Regulations      │ 2. PIECE MOVEMENT EXPLORER                         │
│ 6. Interactive Quiz      │ [ Pawn ] [ Knight ] [ Bishop ] [ Rook ] [ Queen ]  │
│                          │ ┌──────────────────────┐ ┌───────────────────────┐ │
│                          │ │                      │ │ The Knight (3 Pts)    │ │
│                          │ │ INTERACTIVE BOARD    │ │ Moves in "L-shape"    │ │
│                          │ │ (Legal dots & capture│ │ Jumps over pieces!    │ │
│                          │ │  rings highlighted)  │ │ Tips & tactical advice│ │
│                          │ └──────────────────────┘ └───────────────────────┘ │
│                          │                                                    │
│                          │ 3. SPECIAL CHESS MOVES DEMONSTRATORS               │
│                          │ A. Castling: [ 0-0 Kingside ] [ 0-0-0 Queenside ]  │
│                          │ B. En Passant: [ Step 1 Advance ] [ Step 2 Capture]│
│                          │ C. Pawn Promotion Breakdown                        │
│                          │                                                    │
│                          │ 4. CHECK, CHECKMATE & STALEMATE                    │
│                          │                                                    │
│                          │ 5. INTERACTIVE RULES QUIZ                          │
│                          │ Q1: Can a King castle through check?               │
│                          │ ( ) Yes   (•) No                                   │
│                          │ [ ✅ Correct! The King cannot castle out of check ]│
└──────────────────────────┴────────────────────────────────────────────────────┘
```

---

### 8. Learn Chess Traps Wireframe (`chesstraps.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Page Title: Chess Opening Traps & Tricks (Interactive Traps Academy)          │
├───────────────────────────────────────────────────────────────────────────────┤
│ Active Trap: Fishing Pole Trap | ECO: C65 | ⚫ Played by Black                │
├────────────────────────────────────────────┬──────────────────────────────────┤
│                                            │ Filters: [All] [White] [Black]   │
│          INTERACTIVE CHESSBOARD            │ [ Dropdown: Select Opening Trap] │
│                                            ├──────────────────────────────────┤
│ - Dynamic Blunder & Refutation Highlighting│ DYNAMIC LESSON CARD              │
│ - Flip Board to Setter's Perspective       │ [#trapDynamicCard: state-bait]   │
│                                            │ [Tag: The Bait (The Hook)]       │
│                                            │ "Black plays 4...Ng4 & 5...h5,   │
│                                            │  dangling the knight as bait..." │
│                                            ├──────────────────────────────────┤
│                                            │ STEPPER PILLS                    │
│                                            │ [Intro] [Bait] [Blunder] [Refute]│
│                                            ├──────────────────────────────────┤
│                                            │ Move Notation History:           │
│                                            │ 1. e4 e5   2. Nf3 Nc6            │
│                                            │ 3. Bb5 Nf6 4. O-O Ng4            │
│                                            │ 5. h3 h5   6. hxg4?? [Blunder!]  │
│                                            │ 6... hxg4! [Refutation!]         │
├────────────────────────────────────────────┴──────────────────────────────────┤
│ Toolbar: [ |◀ First ]  [ ◀ Prev ]  [ Next ▶ ]  [ Last ▶| ]  [ ⏯ Auto ] [ 🔄 Flip ]│
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### 9. Train Yourself Tactics Arena Wireframe (`train.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Header: 🎯 Train Yourself Tactics Arena                                       │
│ Mode: [ ⚡ Mate in 2 ]  [ ♞ Mate in 3 ]  [ ♜ Mate in 4 ]  [ ♛ Mate in 5 ]  [ 🔥 Sprint ]│
├───────────────────────────────────────────────────────────────────────────────┤
│ Status Banner: "White to move — Mate in 2"             [ ❤️❤️❤️ ]  [ ⏱ 02:45 ]│
├────────────────────────────────────────────┬──────────────────────────────────┤
│                                            │ Target: Forced Checkmate in N    │
│          INTERACTIVE CHESSBOARD            │ Streak: 12 Solved (PB: 28)       │
│                                            ├──────────────────────────────────┤
│ - Glassmorphic Pawn Promotion Modal        │ Action Controls:                 │
│ - Board Shake on Mistake (1 Heart Lost)    │ [ ⏭ Skip ]      [ 💡 Hint ]      │
│ - Mobile Edge-to-Edge Responsive Resize    │ [ 🔄 Flip Board ][ 🔲 Zen Mode ] │
└────────────────────────────────────────────┴──────────────────────────────────┘
```

---

### 10. Chess Blog & Tactical Studies Wireframe (`blog.html`)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Page Heading: <category> | <title>                                            │
├────────────────────────────────────────────┬──────────────────────────────────┤
│ SINGLE PUZZLE & STUDY VIEW                 │ CATEGORY SIDEBAR                 │
│ (Thumbnails omitted for live boards)       │                                  │
│                                            │ Categories:                      │
│          INTERACTIVE ENGINE BOARD          │ - Learn Chess                    │
│          (MChessEngineBoard)               │ - Chess Quotes                   │
│                                            │ - Chess Puzzles                  │
│ Status Banner: Turn / Solved / Engine Move │ - Chess History                  │
│                                            │ - Mate in 2 / 3 / 4 / 5          │
│ Detail In-Category Pagination & Share Bar: │                                  │
│ [ « Prev ]  [ 1 ]  [ 2 ]  [ 3 ]  [ Next » ]│ Related Topics:                  │
│ [ 📤 Share Puzzle (Web Share API / Copy) ] │ - Article Link 1                 │
│                                            │ - Article Link 2                 │
└────────────────────────────────────────────┴──────────────────────────────────┘
```

---

## 📄 Detailed Page-by-Page Guide

### 1. 🏠 Homepage ([index.html](index.html))
- **Purpose**: The primary central lobby connecting users to all tools, games, puzzles, and articles.
- **Key Features**:
  - **Top Interactive Header**: Quick access buttons (`Notifications 🔔`, `Play Online ♟️`, `Theme Toggle 🌙/☀️`, and `Refresh 🔄`).
  - **12 Feature Cards**: Clean uniform feature cards with direct navigation to all portals.
  - **Social Links**: Quick access to Facebook Club, X (Twitter), YouTube, and Instagram.

---

### 2. 🌐 Play Online Arena ([playonline.html](playonline.html))
- **Purpose**: Real-time chess arena for playing with friends or online opponents.
- **Key Features**:
  - **Live Online Lobby**: View active online players and their preferred time controls (3m, 5m, 10m, 30m).
  - **1-Click Match Challenges**: Challenge any player instantly with real-time Accept/Decline notifications.
  - **Live Match Arena**: Play with digital clocks, move list notation, board flip, draw offers, and resign options.
  - **Seamless Reconnection**: Accidental browser refreshes or momentary disconnections seamlessly restore your active game and move progress within a 30-second grace window.
  - **Same-Screen Pass & Play**: Play over-the-board games with friends on a shared device.
  - **Club Hubs**: Direct links to official Marwadi Chess club rooms on Lichess and ChessBase Playchess.

---

### 3. 🤖 Play vs Computer ([playcomp.html](playcomp.html))
- **Purpose**: Single-player practice arena against the world-class Stockfish chess engine.
- **Key Features**:
  - **20 Difficulty Levels**: Practice from beginner level (Level 1) all the way to grandmaster level (Level 20).
  - **Instant Play as Black**: Switching to "Play as Black ♚" automatically starts the game and instructs Stockfish to make the opening White move immediately.
  - **Tactical Aids**: Request engine move hints, navigate move history forward/backward, and undo moves.
  - **Match Archiving**: Automatically saves finished games into your personal match history.

---

### 4. 🧩 Daily Chess Puzzles ([dailypuzzles.html](dailypuzzles.html))
- **Purpose**: Daily calculation and tactical pattern trainer.
- **Key Features**:
  - Solves daily tactics powered by official Lichess API and Stockfish engine move solver.
  - Interactive board with move hints, solution viewer, and consecutive daily streak counter.

---

### 5. 🎯 Train Yourself ([train.html](train.html))
- **Purpose**: Dedicated tactical training center for mastering forced checkmates.
- **Key Features**:
  - **1500+ Curated Puzzles**: Categorized by Mate in 2, Mate in 3, Mate in 4, Mate in 5, and Mixed Sprint.
  - **Dynamic Status Feedback**: Smooth animated banner displaying solving instructions and move accuracy feedback.
  - **3-Strikes Survival Rule**: Start with 3 hearts; mistakes shake the board and deduct 1 heart.
  - **Unified Action Controls**: Skip, Hint, Flip Board, and focused Zen Mode practice.

---

### 6. ♟️ Basic Chess Rules ([chessrules.html](chessrules.html))
- **Purpose**: Interactive academy guide for beginners and intermediate players mastering chess rules.
- **Key Features**:
  - **Sticky Table of Contents**: Smooth scroll-spy navigation tracking reading progress.
  - **Piece Movement Explorer**: Playable chessboard with legal destination dots and capture rings for Pawn, Knight, Bishop, Rook, Queen, and King.
  - **Special Moves Demonstrators**: Step-by-step playable boards illustrating Kingside Castling (`0-0`), Queenside Castling (`0-0-0`), and En Passant captures.
  - **Interactive Rules Quiz**: Instant feedback testing understanding of castling conditions, en passant timing, and stalemate.

---

### 7. 🪤 Learn Chess Traps ([chesstraps.html](chesstraps.html))
- **Purpose**: Tactical study tool focusing on famous opening pitfalls and counter-strategies.
- **Key Features**:
  - **Traps Mode Engine**: Move-by-move synchronization between PGN games and educational lessons.
  - **Dynamic Lesson Cards**: Cycles through Opening Setup, The Bait (The Hook), Fatal Blunder, Decisive Refutation, and Proper Defense.
  - **Move Highlighting**: Distinct visual markers for blunder moves and tactical refutations.
  - **Interactive Stepper Pills**: Jump directly to pivotal trap moments with 1 click.

---

### 8. 📊 PGN Games Database ([pgngames.html](pgngames.html))
- **Purpose**: Grandmaster game library and historical tournament collection.
- **Key Features**:
  - Complete PGN game record replay with move-by-move notation tree.
  - Autoplay mode, board flipping, and interactive move jumping.

---

### 9. 📺 Watch Top Live Games ([watchlive.html](watchlive.html))
- **Purpose**: Live spectator portal for following international grandmaster tournaments.
- **Key Features**:
  - **Dual View Modes**: Switch between focused single-board **Theater Mode** and multi-board **6-Board Grid Mode**.
  - **6 Dedicated Channels**: Top GM, Blitz Championship, Rapid Stream, Bullet Speed, Classical Tournament, and UltraBullet.
  - **Channel Selection Pills**: Switch active livestreams instantly with responsive pills.
  - **Click-to-Fullscreen Isolation**: Clicking any board opens an edge-to-edge modal overlay, preventing external redirects.

---

### 10. 📰 Chess Blog & Quotes ([blog.html](blog.html))
- **Purpose**: Multi-category publication hub with articles, game breakdowns, and motivational quotes.
- **Key Features**:
  - **Structured Breadcrumbs**: Clean `<category> | <title>` headers replacing outdated subtitle tags.
  - **Embedded Puzzle Boards**: Live `MChessEngineBoard` with auto-turn perspective flip and Stockfish defense.
  - **Web Share API Level 2**: Direct WebP image file sharing on mobile devices, with canonical link copying on desktop.
  - **In-Category Detail Pagination**: Browse consecutive puzzles and articles in-place without page reloads.

---

### 11. 🔔 Website Updates ([updates.html](updates.html))
- **Purpose**: Platform announcements, release notes, and feature changelogs.
- **Key Features**:
  - Chronological updates feed detailing engine improvements, new puzzles, UI updates, and bug fixes.
  - Linked directly to the header Notification Bell `[🔔]` for instant announcements.

---

### 12. 📜 My Played Games Archive ([mygames.html](mygames.html))
- **Purpose**: Personal match history dashboard and performance tracker.
- **Key Features**:
  - **Performance Stats**: Total matches, victories, defeats, draws, and win rate %.
  - **Interactive Replay Board**: Step through any played game with forward, backward, autoplay, and flip controls.
  - **Filter & Search**: Filter by outcome (Wins, Losses, Draws) or search by player name, date, or game mode.
  - **PGN Downloads**: Download individual game PGN files or export your entire archive in one file.

---

### 13. ℹ️ About Us ([about.html](about.html))
- **Purpose**: Learn about the mission of Marwadi Chess, our learning philosophy, and our dedication to providing accessible chess tools for everyone.

---

### 14. 📄 Privacy Policy ([privacypolicy.html](privacypolicy.html))
- **Purpose**: Clear, transparent explanation of website terms, user privacy, cookies, and community guidelines.

---

## 📱 Mobile Responsiveness & Top Bar Actions

Marwadi Chess is fully responsive and optimized across all screen sizes:
- **Desktop (920px+)**: Full multi-column view with sidebar widgets, sticky navigation, and wide tournament chessboards.
- **Tablet (768px – 919px)**: Adaptive layout with touch-friendly navigation and balanced board scaling.
- **Mobile (< 768px)**: Single-column responsive layout with toggle navigation menu, edge-to-edge board scaling, and tap-to-move piece controls.

### Header Quick Actions:
- **`[ 🔔 ]` What's New**: Opens a dropdown panel with the latest feature announcements.
- **`[ ♟️ Play Online ]`**: One-click shortcut to the live multiplayer lobby.
- **`[ 🌙 Dark Mode / ☀️ Light Mode ]`**: Instant theme switching saved to your device.
- **`[ 🔄 ]` 1-Click Refresh**: Clears stale browser caches and fetches the latest version of the website with active game protection.

---

## 📦 Open Datasets & Curated Chess Studies ([`data/`](./data/README.md))

Marwadi Chess publishes its curated tactical checkmate datasets, FEN problem collections, Marwadi Chess quotes, and chess study articles as an open-access JSON dataset under the [MIT License](./data/LICENSE):

- **[`mchess-data.json`](./data/mchess-data.json)**: Master dataset with 1,221 verified tactical puzzles (Mate-in-2/3/4), Grandmaster quotes, and instructional articles.

Read the [Dataset Documentation & Schema Guide](./data/README.md) for full schema details, JavaScript/Python usage examples, and citation info.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
