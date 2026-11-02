#!/usr/bin/env python3
"""
validate_chess_datasets.py
--------------------------
Validates dynamic chess datasets in mchess.eg1.in:
1. public/data/updates.json
2. public/data/mchess-data.json (tactics, quotes, traps, rules)
3. public/data/pgn/ master games
"""

import sys
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "public" / "data"


def validate_chess_datasets() -> int:
    errors = []

    # 1. Validate updates.json
    updates_file = DATA_DIR / "updates.json"
    if not updates_file.exists():
        errors.append(f"Missing {updates_file}")
    else:
        try:
            updates = json.loads(updates_file.read_text(encoding="utf-8"))
            if not isinstance(updates, list) or len(updates) == 0:
                errors.append("updates.json must be a non-empty list of update items")
        except Exception as e:
            errors.append(f"updates.json parsing error: {e}")

    # 2. Validate mchess-data.json
    mchess_data_file = DATA_DIR / "mchess-data.json"
    if not mchess_data_file.exists():
        errors.append(f"Missing {mchess_data_file}")
    else:
        try:
            data = json.loads(mchess_data_file.read_text(encoding="utf-8"))
            if not isinstance(data, (dict, list)):
                errors.append("mchess-data.json must be a valid JSON dictionary or array")
        except Exception as e:
            errors.append(f"mchess-data.json parsing error: {e}")

    # 3. Check pgn/ directory if present
    pgn_dir = DATA_DIR / "pgn"
    if pgn_dir.exists():
        pgn_files = list(pgn_dir.glob("*.pgn"))
        for pgn in pgn_files:
            if pgn.stat().st_size == 0:
                errors.append(f"PGN file is empty: {pgn.name}")

    if errors:
        print(f"❌ Chess dataset validation failed with {len(errors)} error(s):")
        for err in errors:
            print(f"   • {err}")
        return 1

    print("✅ All Marwadi Chess datasets and PGN archives validated successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(validate_chess_datasets())
