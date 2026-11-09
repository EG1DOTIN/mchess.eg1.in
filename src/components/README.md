# Marwadi Chess Brand Components (`src/components/`)

This directory houses the site-specific brand identity, logo, and chessboard wrappers for `mchess.eg1.in`.

---

## ♟️ Components Overview

| Component File | Role & Customization |
|---|---|
| [`MarwadiChessLogo.tsx`](./MarwadiChessLogo.tsx) | Procedural vector logo featuring the signature Knight/Horse silhouette, emerald gradients, responsive scaling (`size={52}`), and theme adaptability (light, dark, auto). |

---

## 🎨 Board Styles & Design Tokens

Marwadi Chess uses procedural tokens for board coordinates, square coloring, and highlight squares:
- **Light Squares**: `var(--chess-board-light, #f0d9b5)`
- **Dark Squares**: `var(--chess-board-dark, #b58863)`
- **Selected Move Highlight**: `var(--chess-highlight-selected, rgba(20, 85, 30, 0.5))`
- **Possible Move Dot**: `var(--chess-highlight-dest, rgba(20, 85, 30, 0.3))`

