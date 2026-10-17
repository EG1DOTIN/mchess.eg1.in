#!/usr/bin/env python3
"""
Marwadi Chess - Unified Master Health & Verification Suite
==========================================================
Executes all auditing and integrity checks across the public codebase in a single command:
1. HTML Script, Stylesheet & Image Assets (audit/audit_codebase.py)
2. Documentation Internal Markdown Links (audit/scan_docs_links.py)
3. Asset Folder References & Legacy Paths (audit/audit_folder_references.py)
4. Public Code Gitignored Mentions (audit/audit_gitignored_mentions.py)
5. Master Open Dataset & FEN Validity (audit/validate_and_audit_datasets.py)

Usage:
    python automation-scripts/verify_all.py
    python automation-scripts/verify_all.py --verbose
"""

import os
import sys
import time
import argparse
import subprocess
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = Path(__file__).resolve().parent

# Registry of all public health checks
AUDIT_SUITES = [
    {
        "id": "html_assets",
        "name": "HTML Asset & Dependency Integrity",
        "script": SCRIPTS_DIR / "audit" / "audit_codebase.py",
        "desc": "Validates 100% of <script>, <link>, and <img> sources on disk",
    },
    {
        "id": "doc_links",
        "name": "Documentation Markdown Links",
        "script": SCRIPTS_DIR / "audit" / "scan_docs_links.py",
        "desc": "Audits internal file links across public docs/ files",
    },
    {
        "id": "folder_refs",
        "name": "Asset Folder References & Paths",
        "script": SCRIPTS_DIR / "audit" / "audit_folder_references.py",
        "desc": "Validates consolidated img/ paths and rejects unmigrated references",
    },
    {
        "id": "public_gitignored",
        "name": "Public Code Gitignore References",
        "script": SCRIPTS_DIR / "audit" / "audit_gitignored_mentions.py",
        "desc": "Ensures zero accidental leaks of gitignored folders",
    },
    {
        "id": "dataset_fen",
        "name": "Master Dataset & FEN Integrity",
        "script": SCRIPTS_DIR / "audit" / "validate_and_audit_datasets.py",
        "desc": "Verifies 1,221 records and validates all chess FEN positions",
    },
]


def run_suite(suite_info: dict, verbose: bool = False) -> tuple[bool, float, str]:
    script_path = suite_info["script"]
    if not script_path.exists():
        return False, 0.0, f"Error: Script not found: {script_path}"

    start_time = time.perf_counter()
    result = subprocess.run(
        [sys.executable, str(script_path)],
        cwd=str(PROJECT_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    elapsed = time.perf_counter() - start_time

    output = result.stdout + result.stderr
    is_success = result.returncode == 0
    return is_success, elapsed, output


def main():
    parser = argparse.ArgumentParser(
        description="Marwadi Chess Unified Verification Suite for CI/CD and Local Quality Gates."
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Print full output from all audit scripts."
    )
    args = parser.parse_args()

    print("=" * 72)
    print("♟️  MARWADI CHESS — UNIFIED MASTER VERIFICATION SUITE")
    print(f"📁 Workspace Root: {PROJECT_ROOT}")
    print(f"🐍 Python Runtime: {sys.executable}")
    print(f"🧪 Total Checks:   {len(AUDIT_SUITES)}")
    print("=" * 72)

    results = []
    has_failure = False

    for idx, suite in enumerate(AUDIT_SUITES, 1):
        name = suite["name"]
        print(f"[{idx}/{len(AUDIT_SUITES)}] Running {name}...", end="", flush=True)

        success, elapsed, output = run_suite(suite, verbose=args.verbose)
        results.append((suite, success, elapsed, output))

        if success:
            print(f"\r[{idx}/{len(AUDIT_SUITES)}] PASS {name} ({elapsed:.2f}s)")
        else:
            has_failure = True
            print(f"\r[{idx}/{len(AUDIT_SUITES)}] FAIL {name} ({elapsed:.2f}s) ❌")

        if args.verbose or not success:
            print("-" * 72)
            print(output.strip())
            print("-" * 72)

    # Summary Report Table
    print("\n" + "=" * 72)
    print("📊 VERIFICATION RESULTS SUMMARY")
    print("=" * 72)
    for suite, success, elapsed, _ in results:
        status_icon = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status_icon:<8} {suite['name']:<42} ({elapsed:.2f}s)")

    print("-" * 72)
    total_time = sum(r[2] for r in results)
    passed_count = sum(1 for r in results if r[1])
    failed_count = len(results) - passed_count
    print(f"Total Suites: {len(results)} | Passed: {passed_count} | Failed: {failed_count} | Time: {total_time:.2f}s")
    print("=" * 72)

    if has_failure:
        print("\n⚠️ VERIFICATION FAILED: One or more audit suites reported errors.")
        sys.exit(1)
    else:
        print("\n🎉 ALL SYSTEMS OPERATIONAL: Every asset, link, dataset, and page passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
