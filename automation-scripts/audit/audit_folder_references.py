"""
Marwadi Chess - Folder References & Asset Usage Auditor
=======================================================
High-performance single-pass auditor scanning public codebase files to verify
consolidated img/ paths and detect any unmigrated legacy references.

Usage:
    python automation-scripts/audit/audit_folder_references.py
"""

import os
import glob
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

file_patterns = [
    os.path.join(PROJECT_ROOT, '*.html'),
    os.path.join(PROJECT_ROOT, 'js', '*.js'),
    os.path.join(PROJECT_ROOT, 'css', '*.css'),
    os.path.join(PROJECT_ROOT, 'data', '*.*'),
    os.path.join(PROJECT_ROOT, 'docs', '**', '*.md'),
    os.path.join(PROJECT_ROOT, 'README.md'),
    os.path.join(PROJECT_ROOT, 'blog', '*.htm'),
    os.path.join(PROJECT_ROOT, 'firebase.json'),
]

targets = []
for p in file_patterns:
    targets.extend(glob.glob(p, recursive=True))

EXCLUDED_FILES = {
    os.path.normpath(os.path.abspath(__file__)),
    os.path.normpath(os.path.join(PROJECT_ROOT, "firebase.json")), # redirects source intentionally targets legacy /mi2/*
}

print("==================================================", flush=True)
print(f"Auditing folder references across {len(targets)} files...", flush=True)
print("==================================================", flush=True)

legacy_pattern = re.compile(r'(?<!img/)(?<!img\\)\b(mi2|mi3|mi4|cpcq)/[a-zA-Z0-9_-]+\.webp', re.IGNORECASE)
chesspuzzles_pattern = re.compile(r'\bchesspuzzles/[^\s\'\",;>]+\.webp', re.IGNORECASE)

consolidated_counts = {'mi2': 0, 'mi3': 0, 'mi4': 0, 'cpcq': 0}
consolidated_files = {'mi2': 0, 'mi3': 0, 'mi4': 0, 'cpcq': 0}

legacy_hits = {}
chesspuzzles_hits = {}

for tf in targets:
    norm_tf = os.path.normpath(tf)
    if norm_tf in EXCLUDED_FILES:
        continue
    try:
        with open(tf, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        for folder in ['mi2', 'mi3', 'mi4', 'cpcq']:
            matches = len(re.findall(rf'img[/\\]{folder}/[a-zA-Z0-9_-]+\.webp', content, re.IGNORECASE))
            if matches > 0:
                consolidated_counts[folder] += matches
                consolidated_files[folder] += 1

        leg_m = legacy_pattern.findall(content)
        if leg_m:
            legacy_hits[norm_tf] = leg_m

        cp_m = chesspuzzles_pattern.findall(content)
        if cp_m:
            chesspuzzles_hits[norm_tf] = cp_m

    except Exception as e:
        print(f"Error reading {tf}: {e}", file=sys.stderr)

has_error = False

if legacy_hits:
    has_error = True
    print("\n🚨 WARNING: Found unmigrated legacy folder references without 'img/':")
    for file, hits in legacy_hits.items():
        rel = os.path.relpath(file, PROJECT_ROOT)
        print(f"  - {rel}: {len(hits)} legacy references (e.g., {hits[:3]})")
else:
    print("\n✅ PERFECT: 0 unmigrated legacy root paths found in active code!")

if chesspuzzles_hits:
    has_error = True
    print("\n🚨 WARNING: Found references to legacy 'chesspuzzles/' folder:")
    for file, hits in chesspuzzles_hits.items():
        rel = os.path.relpath(file, PROJECT_ROOT)
        print(f"  - {rel}: {len(hits)} references (e.g., {hits[:3]})")
else:
    print("✅ PERFECT: 0 references to chesspuzzles found in active code!")

print("\n📊 Consolidated 'img/' verification:")
for folder in ['mi2', 'mi3', 'mi4', 'cpcq']:
    print(f"   • img/{folder}/: {consolidated_counts[folder]} occurrences across {consolidated_files[folder]} file(s)")

print("\nAudit Complete.")

if has_error:
    sys.exit(1)
sys.exit(0)
