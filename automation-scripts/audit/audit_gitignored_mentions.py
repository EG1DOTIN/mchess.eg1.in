"""
Marwadi Chess - Gitignore Leaks & Public References Auditor
============================================================
Scans all public, tracked codebase files (HTML, JS, CSS, JSON, Markdown) to ensure
there are ZERO references, hyperlinks, or file paths pointing to gitignored directories or files
before committing or deploying.

Usage:
  python automation-scripts/audit/audit_gitignored_mentions.py
"""

import os
import re
import sys

# Ensure UTF-8 stdout encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

# Path regex patterns that indicate references to internal/gitignored directories or files
LEAK_PATTERNS = [
    (re.compile(r'(?:href|src|url)\s*=\s*["\'](?:\.\/|\.\.\/)?gitignore[^"\']*["\']', re.IGNORECASE), "HTML Attribute Gitignore Reference"),
    (re.compile(r'\[[^\]]*\]\((?:\.\/|\.\.\/)?gitignore[^)]*\)', re.IGNORECASE), "Markdown Link Gitignore Reference"),
    (re.compile(r'(?<![a-zA-Z0-9_\-\.])gitignore\/[a-zA-Z0-9_\-\.\/]+', re.IGNORECASE), "Gitignore Path Reference"),
]

def audit_public_files():
    print("==================================================")
    print("🔍 Auditing Public Files for Gitignored References")
    print(f"Project Root: {PROJECT_ROOT}")
    print("==================================================")

    # Directories that are gitignored or internal
    skip_dirs = {
        '.git', '.vscode', '.agents', '.idea', 'node_modules',
        '.pytest_cache', '.venv', 'gitignore', '__pycache__',
    }

    # Configuration files where mentioning gitignore is legitimate
    skip_files = {
        '.gitignore', 'firebase.json',
    }

    findings = []
    scanned_count = 0

    for dirpath, dirnames, filenames in os.walk(PROJECT_ROOT):
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]

        for fname in filenames:
            if fname in skip_files:
                continue
            
            ext = os.path.splitext(fname)[1].lower()
            if ext not in ['.html', '.htm', '.js', '.css', '.md', '.json']:
                continue

            fpath = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(fpath, PROJECT_ROOT).replace('\\', '/')
            scanned_count += 1

            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    for line_no, line in enumerate(f, 1):
                        for pattern, ptype in LEAK_PATTERNS:
                            match = pattern.search(line)
                            if match:
                                findings.append((rel_path, line_no, ptype, line.strip()))
            except Exception as e:
                print(f"⚠️ Error reading {rel_path}: {e}")

    print(f"📁 Scanned {scanned_count} public files across the repository.")
    print("--------------------------------------------------")

    if findings:
        print(f"❌ Found {len(findings)} references to gitignored paths:")
        for rel_path, line_no, ptype, line in findings:
            print(f"   - [{rel_path}:{line_no}] ({ptype}) -> {line[:120]}")
        print("==================================================")
        print("⚠️ Audit FAILED: Please remove references before pushing to GitHub.")
        print("==================================================")
        sys.exit(1)
    else:
        print("✅ 0 References to gitignored paths or files found!")
        print("==================================================")
        print("🎉 Gitignore Public Reference Audit PASSED with 100% Success!")
        print("==================================================")

if __name__ == "__main__":
    audit_public_files()
