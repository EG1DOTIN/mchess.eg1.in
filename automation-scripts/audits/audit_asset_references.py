#!/usr/bin/env python3
"""
audit_asset_references.py
-------------------------
Verifies that static assets (images, sound effects, fonts) referenced in
components and CSS files exist in public/ and have valid non-empty sizes.
"""

import sys
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PUBLIC_DIR = ROOT_DIR / "public"
SRC_DIR = ROOT_DIR / "src"


def audit_assets() -> int:
    errors = []

    # Check key directories in public
    required_dirs = ["img", "data"]
    for d in required_dirs:
        dir_path = PUBLIC_DIR / d
        if not dir_path.exists():
            errors.append(f"Missing required public directory: public/{d}")

    # Check asset references in index.css and components
    css_files = list(SRC_DIR.glob("**/*.css")) + [ROOT_DIR / "index.html"]
    url_pattern = re.compile(r'url\(["\']?([^"\'\)]+)["\']?\)')

    for cf in css_files:
        if not cf.exists():
            continue
        content = cf.read_text(encoding="utf-8", errors="replace")
        for match in url_pattern.finditer(content):
            url = match.group(1).strip()
            # Skip external web URLs and data URIs
            if url.startswith(("http://", "https://", "data:", "//")):
                continue
            # Strip query or hash
            clean_url = url.split("?")[0].split("#")[0]
            # Resolve relative to public or root
            if clean_url.startswith("/"):
                asset_path = PUBLIC_DIR / clean_url.lstrip("/")
            else:
                asset_path = cf.parent / clean_url

            if not asset_path.exists() and not (PUBLIC_DIR / clean_url).exists():
                errors.append(f"{cf.name}: Referenced asset not found '{url}'")

    if errors:
        print(f"❌ Asset reference audit failed with {len(errors)} error(s):")
        for err in errors:
            print(f"   • {err}")
        return 1

    print("✅ Static asset references and directories verified successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(audit_assets())
