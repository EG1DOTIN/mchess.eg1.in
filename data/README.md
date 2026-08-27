# ♟️ Marwadi Chess Open Datasets

Welcome to the **Marwadi Chess Open Datasets** repository. This directory contains the curated, lightweight, and production-ready chess master dataset (`mchess-data.json`) covering 1,221 verified tactical checkmate puzzles, study positions, Grandmaster quotes, and instructional chess articles published by [Marwadi Chess](https://mchess.eg1.in) under the **MIT License**.

---

## 📦 Dataset Inventory

| Dataset File / Directory | Records / Games | Categories Included | Description |
| :--- | :---: | :--- | :--- |
| **[`mchess-data.json`](./mchess-data.json)** | **1,221** | All 6 Categories | Master dataset containing all tactical checkmate puzzles (Mate-in-2, Mate-in-3, Mate-in-4, Chess Puzzles), Grandmaster quotes, and instructional chess articles (~664 KB). |
| **[`news.json`](./news.json)** | **Feed Items** | News & Updates | Structured feed containing platform updates, chess tournament announcements, and new feature logs. |
| **[`pgn/opening_traps.pgn`](./pgn/opening_traps.pgn)** | **15 Traps** | Opening Repertoire | Interactive master opening traps and common blunder refutations in standard PGN format. |
| **[`pgn/pgn_games.pgn`](./pgn/pgn_games.pgn)** | **Historical Games** | Grandmaster Games | Historic classical games played by World Champions and Grandmasters with move annotations. |
| **[`pgn/train.pgn`](./pgn/train.pgn)** | **500+ Puzzles** | Tactics Arena | Multi-game tactical checkmate puzzles library (Mate in 2/3/4/5 and Sprint) powering `train.html`. |

---

## 📋 JSON Schema & Data Structure

The dataset begins with a standardized `_metadata` header embedding licensing, copyright, centralized category keywords, and attribution info:

```json
{
  "_metadata": {
    "title": "Marwadi Chess Puzzles, Quotes & Studies Open Dataset",
    "version": "1.0.0",
    "author": "Marwadi Chess (EG1)",
    "website": "https://mchess.eg1.in",
    "license": "MIT License",
    "copyright": "Copyright (c) 2026 Marwadi Chess (EG1)",
    "description": "Curated Mate-in-N chess puzzles, tactical studies, grandmaster quotes, and instructional chess articles.",
    "category_keywords": {
      "Mate in 2": "chess, chess puzzle, mate in 2, checkmate in 2, chess tactics, forced checkmate, chess problems",
      "Mate in 3": "chess, chess puzzle, mate in 3, checkmate in 3, chess tactics, forced checkmate, chess problems",
      "Mate in 4": "chess, chess puzzle, mate in 4, checkmate in 4, chess tactics, forced checkmate, chess problems",
      "Chess Puzzles": "chess, chess puzzle, tactical breakthrough, forced mate, chess tactics",
      "Chess Quotes": "chess, chess quotes, grandmaster quotes, chess wisdom, tactical inspiration",
      "Learn Chess": "chess, play chess, how to play chess, basic chess rules, chess fundamentals"
    },
    "exported_at": "2026-08-27T05:12:20.123456+00:00"
  },
  "categories": [
    "Chess Puzzles",
    "Chess Quotes",
    "Learn Chess",
    "Mate in 2",
    "Mate in 3",
    "Mate in 4"
  ],
  "total": 1221,
  "blogs": [
    {
      "id": "1",
      "category": "Mate in 2",
      "title": "MI2-1",
      "full_description": "<h2>White to move</h2><h3>Game Details: Henry Buckle vs NN, London, 1840</h3>",
      "output_image": "mi2/MI2_1.webp",
      "release_date": "2026-01-01T00:00:00Z",
      "release_date_ms": 1767225600000,
      "metaDescription": "Henry Buckle vs NN, London, 1840",
      "active": 1,
      "fen": "r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5"
    }
  ]
}
```

### Key Field Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier of the entry. |
| `category` | `string` | The thematic category (`Mate in 2`, `Mate in 3`, `Mate in 4`, `Chess Puzzles`, `Chess Quotes`, `Learn Chess`). |
| `title` | `string` | Display heading or puzzle title. |
| `fen` | `string` *(optional)* | Clean, validated standard 6-part Forsyth–Edwards Notation (FEN) for the starting position. |
| `output_image` | `string` | Relative path to high-fidelity WebP chessboard or quote card asset. |
| `full_description` | `string` | Clean semantic HTML content containing move metadata, annotations, or article text. |
| `release_date_ms` | `number` | Unix timestamp in milliseconds for chronological sorting. |
| `metaDescription` | `string` | Short abstract / summary of the puzzle, game background, or quote text. |
| `active` | `number` | Publication status (`1` for published, `0` for draft). |

---

## 💻 Quick Usage Examples

### 1. In JavaScript (Browser / Node.js)
```javascript
// Fetch and filter all Mate-in-2 puzzles
async function loadMateIn2Puzzles() {
    const response = await fetch('data/mchess-data.json');
    const data = await response.json();
    
    const mateIn2 = data.blogs.filter(p => p.category === 'Mate in 2');
    console.log(`Loaded ${mateIn2.length} Mate-in-2 puzzles.`);
    console.log('Sample FEN:', mateIn2[0].fen);
}
```

### 2. In Python (with `python-chess`)
```python
import json
import chess

with open('data/mchess-data.json', 'r', encoding='utf-8') as f:
    dataset = json.load(f)

puzzles = [b for b in dataset['blogs'] if 'Mate' in b.get('category', '')]
for puzzle in puzzles[:5]:
    fen = puzzle.get('fen')
    if fen:
        board = chess.Board(fen)
        print(f"[{puzzle['title']}] - Side to Move: {'White' if board.turn == chess.WHITE else 'Black'}")
        print(board, "\n")
```

## ⚖️ License & Attribution

This dataset is licensed under the [MIT License](./LICENSE).

**Attribution:**
When referencing or utilizing this dataset in projects, research papers, or derivative applications, please cite:
> **Marwadi Chess Open Datasets (2026)**  
> Curated tactical checkmate puzzles, FEN positions, and Grandmaster quotes.  
> Available at: [https://mchess.eg1.in](https://mchess.eg1.in)
