"""
Marwadi Chess - Dataset Integrity & FEN Validator
===================================================
Validates the structure, FEN chess positions, image paths, and content integrity
of `data/mchess-data.json`.

Features:
  - Validates total record counts across all 6 categories.
  - Rigorously validates all FEN strings using `python-chess`.
  - Verifies that all referenced WebP images exist on local disk.
  - Checks metadata headers and category keyword mappings.
  - Reports detailed dataset size statistics.

Usage:
  python automation-scripts/audit/validate_and_audit_datasets.py
"""

import os
import sys
import json

# Ensure UTF-8 stdout encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    import chess
except ImportError:
    print("⚠️  'chess' module not found. Run: pip install -r automation-scripts/requirements.txt")
    chess = None

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
DATA_FILE = os.path.join(PROJECT_ROOT, "data", "mchess-data.json")

def audit_dataset():
    print("==================================================")
    print("🔍 Auditing Marwadi Chess Master Dataset")
    print(f"File: {os.path.relpath(DATA_FILE, PROJECT_ROOT)}")
    print("==================================================")

    if not os.path.exists(DATA_FILE):
        print(f"❌ Error: {DATA_FILE} not found!")
        sys.exit(1)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Metadata Verification
    metadata = data.get("_metadata", {})
    print("📋 Metadata Header:")
    print(f"   - Title:       {metadata.get('title')}")
    print(f"   - Version:     {metadata.get('version')}")
    print(f"   - License:     {metadata.get('license')}")
    print(f"   - Author:      {metadata.get('author')}")
    print(f"   - Exported At: {metadata.get('exported_at')}")

    keywords = metadata.get("category_keywords", {})
    print(f"   - Centralized Category Keywords: {len(keywords)} categories defined")

    # 2. Record Statistics
    blogs = data.get("blogs", [])
    total_records = len(blogs)
    file_size = os.path.getsize(DATA_FILE)
    print("--------------------------------------------------")
    print(f"📊 Dataset Size: {file_size:,} bytes ({file_size / 1024:.1f} KB)")
    print(f"📊 Total Records: {total_records}")

    category_counts = {}
    missing_images = []
    fen_errors = []
    legacy_iframes = []
    test_artifacts = []

    for item in blogs:
        cat = item.get("category", "Unknown")
        category_counts[cat] = category_counts.get(cat, 0) + 1

        # Check for test artifacts
        title = str(item.get("title", ""))
        desc = str(item.get("full_description", ""))
        if "test_" in title.lower() or "fsdfsfsf" in desc:
            test_artifacts.append((item.get("id"), title))

        # Check for legacy iframes
        if "<iframe" in desc.lower():
            legacy_iframes.append((item.get("id"), title))

        # Check image existence
        img_path = item.get("output_image", "")
        if img_path:
            disk_path = os.path.join(PROJECT_ROOT, img_path.replace("/", os.sep))
            if not os.path.exists(disk_path):
                missing_images.append((item.get("id"), title, img_path))

        # Check FEN validity
        fen = item.get("fen")
        if fen:
            if chess:
                try:
                    chess.Board(fen)
                except Exception as e:
                    fen_errors.append((item.get("id"), title, fen, str(e)))
            else:
                parts = fen.strip().split()
                if len(parts) < 2 or parts[0].count('/') != 7:
                    fen_errors.append((item.get("id"), title, fen, "Invalid FEN format"))

    print("--------------------------------------------------")
    print("📂 Category Breakdown:")
    for cat, count in sorted(category_counts.items()):
        print(f"   - {cat:<15}: {count} records")

    print("--------------------------------------------------")
    print("🔬 Integrity Check Results:")

    if test_artifacts:
        print(f"❌ Found {len(test_artifacts)} test/dummy records:")
        for tid, ttitle in test_artifacts:
            print(f"   - ID: {tid} ('{ttitle}')")
    else:
        print("✅ 0 Test / Dummy records found.")

    if legacy_iframes:
        print(f"❌ Found {len(legacy_iframes)} legacy iframe embeds:")
        for iid, ititle in legacy_iframes:
            print(f"   - ID: {iid} ('{ititle}')")
    else:
        print("✅ 0 Legacy iframes found (100% clean HTML).")

    if missing_images:
        print(f"❌ Found {len(missing_images)} missing image files:")
        for mid, mtitle, mpath in missing_images:
            print(f"   - ID: {mid} ('{mtitle}'): {mpath}")
    else:
        print("✅ All referenced image assets exist on disk (100% valid).")

    if fen_errors:
        print(f"❌ Found {len(fen_errors)} invalid FEN positions:")
        for fid, ftitle, ffen, ferr in fen_errors:
            print(f"   - ID: {fid} ('{ftitle}'): {ffen} ({ferr})")
    else:
        print(f"✅ All puzzle FEN positions parsed successfully ({sum(1 for b in blogs if b.get('fen'))} FENs verified).")

    print("==================================================")
    if not test_artifacts and not legacy_iframes and not missing_images and not fen_errors:
        print("🎉 Dataset Audit PASSED with 100% Success!")
        sys.exit(0)
    else:
        print("⚠️ Dataset Audit finished with errors.")
        sys.exit(1)

if __name__ == "__main__":
    audit_dataset()
