# Architecture & Chess Engine Integration — Marwadi Chess

This document outlines the architecture, chess engine integration, multiplayer synchronization, and administrative security powering [`mchess.eg1.in`](../).

---

## 🏗️ Architectural Topology

```mermaid
flowchart TD
    subgraph Client["Browser Runtime & UI Engine"]
        Main["main.tsx"] --> App["App.tsx (Routing & Global State)"]
        App --> Providers["ThemeProvider & FirebaseProvider"]
        Providers --> Shell["Header & Footer (preset='mchess')"]
        Shell --> Views["Page Switcher (15 Pages)"]
    end

    subgraph ChessCore["Chess Game Engines"]
        ChessJS["chess.js (Rules Engine & Board State)"]
        AI["AI Engine (Minimax with Alpha-Beta Pruning)"]
        PGNParser["PGN Master Games Parser"]
    end

    subgraph FirebaseLayer["Firebase Cloud Services"]
        Realtime["Firebase Realtime Database (Multiplayer Rooms)"]
        Firestore["Firestore (Telemetry & Lockout Defense)"]
        Auth["Firebase Auth (Google Sign-In)"]
    end

    Views --> ChessJS
    Views --> AI
    Views --> PGNParser
    Views --> Realtime
    App --> Firestore
    Views --> Auth
```

---

## 1. Move Evaluation Flow (`chess.js`)

All chess interactions are mediated through an instance of `Chess` from `chess.js`:

```mermaid
sequenceDiagram
    autonumber
    actor Player as "Player"
    participant Board as "ChessBoard UI"
    participant Engine as "chess.js Engine"
    participant Sync as "Firebase Realtime DB / Local State"

    Player->>Board: Drag piece or click square
    Board->>Engine: engine.moves({ square, verbose: true })
    Engine-->>Board: Return valid target squares (highlight dots)
    Player->>Board: Drop piece on destination square
    Board->>Engine: engine.move({ from, to, promotion: 'q' })
    alt Move is Illegal
        Engine-->>Board: Returns null (Snapback piece)
        Board-->>Player: Display invalid move feedback
    else Move is Legal
        Engine-->>Board: Valid move object
        Board->>Sync: Broadcast move / Update clock
        Board->>Engine: Check status (isCheck, isCheckmate, isDraw)
        Engine-->>Board: Game status update
        Board-->>Player: Render new board state & audio SFX
    end
```

---

## 2. Real-Time Multiplayer Architecture (`PlayOnlinePage`)

Online games leverage Firebase Realtime Database with light-weight room management:
- **Room Lifecycle**: Hosts create a game room (`/rooms/{roomId}`) with clock settings (e.g., 3+2, 5+0, 10+0).
- **Matchmaking & Pairing**: Guests join using room codes or public lobby listings.
- **Move Synchronization**: Moves are dispatched as compact algebraic notation strings (e.g., `e2e4`, `g1f3`) with millisecond timestamps to synchronize chess clocks accurately across network latencies.
- **Disconnection Handling**: Presence monitoring handles automatic resignations on prolonged disconnections.

---

## 3. Computer AI Opponent (`PlayCompPage`)

The single-player engine provides multiple difficulty levels:
- **Level 1 (Beginner)**: Semi-random legal move selection with immediate capture prioritization.
- **Level 2 (Club Player)**: Material evaluation with 2-ply lookahead.
- **Level 3 (Master)**: Minimax search with alpha-beta pruning, positional piece-square tables, and center control heuristics.

---

## 4. Routing & Admin Mode Isolation

The router in [`App.tsx`](../src/App.tsx) detects administrative routes (`/admin`, `admin.html`, `/AdminPanel`) and isolates the workstation:
- Public navigation, sidebars, and footers are replaced by the full-screen [`AdminLayout`](https://github.com/EG1DOTIN/eg-web-core/blob/main/docs/admin-suite.md).
- One-click navigation back to the chess portal is provided via `headerActions={<ExitToMChessButton />}`.

---

## 5. Admin Security Model

- **Google OAuth Whitelist**: Restricted to `marwadichess@gmail.com`.
- **16-Digit Salted PIN**: Salted with `MCHESS_ADMIN_SECURE_SALT_2026` and hashed via standard browser Web Crypto API.
- **Brute-Force Lockout**: 3 failed attempts activate a 24-hour IP lockout recorded in `admin_lockout`.
- **Audit Logging**: Successful and failed authentications appended to `admin_login_log`.
