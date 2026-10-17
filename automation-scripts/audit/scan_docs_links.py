"""
MCHESS Documentation Markdown Link Auditor
==========================================
Scans Markdown (.md) documents and verifies:
1. 100% of internal relative file links resolve to existing files on disk.
2. In public mode: zero references or links point to gitignored directories.
3. In custom path mode (--path <dir>): audits any target directory (including internal docs)
   and verifies relative internal and outward links without leaking private configurations.

Usage:
    # Public audit (default for CI & local quality checks)
    python automation-scripts/audit/scan_docs_links.py

    # Targeted audit for specific directory
    python automation-scripts/audit/scan_docs_links.py --path <directory>
    python automation-scripts/audit/scan_docs_links.py --path <directory> --allow-outward
"""

import os
import re
import sys
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

def parse_args():
    parser = argparse.ArgumentParser(description="MCHESS Markdown Link Auditor")
    parser.add_argument(
        "--path",
        type=str,
        default=None,
        help="Target directory to scan (defaults to public workspace documents).",
    )
    parser.add_argument(
        "--allow-outward",
        action="store_true",
        help="Permit outward relative links pointing to root public documents.",
    )
    return parser.parse_args()

def collect_md_files(target_dir, is_custom):
    md_files = []
    # Directories skipped in public mode
    skip_dirs = {'.git', '.venv', 'node_modules', '.pytest_cache', 'gitignore', '.vscode', '.agents'}
    
    if is_custom:
        abs_target = os.path.abspath(os.path.join(PROJECT_ROOT, target_dir))
        if os.path.isfile(abs_target) and abs_target.endswith('.md'):
            return [abs_target]
        for root, dirs, files in os.walk(abs_target):
            dirs[:] = [d for d in dirs if d not in {'.git', '.venv', 'node_modules', '.pytest_cache'}]
            for f in files:
                if f.endswith('.md'):
                    md_files.append(os.path.join(root, f))
    else:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for f in files:
                if f.endswith('.md'):
                    md_files.append(os.path.join(root, f))

    md_files.sort()
    return md_files

def main():
    args = parse_args()
    is_custom = args.path is not None
    target_display = args.path if is_custom else "Public Workspace"
    all_md_files = collect_md_files(args.path, is_custom)

    print("=" * 60)
    print(f"🔍 Auditing Markdown Links: {target_display}")
    print(f"   - Target Base Directory: {PROJECT_ROOT}")
    print(f"   - Markdown Documents Found: {len(all_md_files)}")
    if args.allow_outward:
        print("   - Mode: Outward Links Permitted (Internal Documentation Mode)")
    print("=" * 60)

    broken = []
    privacy_violations = []
    total_links = 0

    for md in all_md_files:
        rel_md = os.path.relpath(md, PROJECT_ROOT).replace('\\', '/')
        
        with open(md, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Strip multiline code blocks and inline code spans to avoid evaluating illustrative syntax examples
        clean_content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
        clean_content = re.sub(r'`[^`\n]+`', '', clean_content)

        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', clean_content)
        for text, target in links:
            target = target.strip()
            if target.startswith('http://') or target.startswith('https://') or target.startswith('#') or target.startswith('mailto:'):
                continue
            
            total_links += 1
            clean_target = target.split('#')[0].split('?')[0].replace('/', os.sep).replace('\\', os.sep)
            if not clean_target:
                continue

            base_dir = os.path.dirname(md)
            resolved = os.path.normpath(os.path.join(base_dir, clean_target))
            rel_target = os.path.relpath(resolved, PROJECT_ROOT).replace('\\', '/')
            
            # Privacy check for public files: public files must never link to gitignored paths
            if not is_custom and not args.allow_outward:
                if 'gitignore' in target.lower() or rel_target.startswith('gitignore/'):
                    privacy_violations.append((rel_md, text, target))

            if not os.path.exists(resolved):
                broken.append((rel_md, text, target, resolved))

    print(f"\nAudit complete: Checked {total_links} links across {len(all_md_files)} documents.")

    if privacy_violations:
        print(f"\n🚨 FOUND {len(privacy_violations)} PRIVACY VIOLATION(S) (Link pointing to gitignored directory):")
        for r, t, tg in privacy_violations:
            print(f"   In {r} -> [{t}]({tg})")

    if broken:
        print(f"\n⚠️ FOUND {len(broken)} BROKEN LINK(S):")
        for r, t, tg, res in broken:
            print(f"   In {r} -> [{t}]({tg})")
            print(f"      Attempted path: {res}")

    if not broken and not privacy_violations:
        print(f"\n✅ All markdown links in {target_display} are valid and verified!")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
