#!/usr/bin/env python3
"""
audit_seo_puzzles.py
--------------------
Audits search engine optimization (SEO) and social media sharing assets for
all 1,220+ chess puzzles in mchess.eg1.in.

Validates:
  1. Existence of public/blog/ static landing wrappers and fbresp.css.
  2. Completeness of HTML <head> metadata (canonical, title, description,
     Open Graph, Twitter card, Schema.org JSON-LD).
  3. Physical existence of referenced Open Graph WebP cards in public/img/og/.
  4. Sitemap completeness (public/sitemap.xml contains all puzzle URLs).
  5. Firebase Hosting redirects for legacy puzzle image routes.
"""

import sys
import re
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
PUBLIC_DIR = ROOT_DIR / "public"
BLOG_DIR = PUBLIC_DIR / "blog"
OG_DIR = PUBLIC_DIR / "img" / "og"
SITEMAP_FILE = PUBLIC_DIR / "sitemap.xml"
FIREBASE_FILE = ROOT_DIR / "firebase.json"


def audit_seo_puzzles() -> int:
    errors = []

    # 1. Directory Checks
    if not BLOG_DIR.exists() or not BLOG_DIR.is_dir():
        print(f"❌ Critical: public/blog directory is missing at {BLOG_DIR}")
        return 1

    fbresp_css = BLOG_DIR / "fbresp.css"
    if not fbresp_css.exists():
        errors.append("public/blog/fbresp.css is missing")

    htm_files = sorted(list(BLOG_DIR.glob("*.htm")))
    if len(htm_files) < 1200:
        errors.append(f"Expected at least 1,220 static puzzle pages in public/blog, found {len(htm_files)}")

    print(f"♟️  Auditing {len(htm_files)} static puzzle SEO landing wrappers...")

    # 2. Inspect Head Tags & OG image bindings
    og_cache = {p.name for p in OG_DIR.glob("*.webp")} | {p.name for p in OG_DIR.glob("*.jpg")}
    sample_files = htm_files  # Audit all files for complete certainty

    canonical_urls = set()

    for f in sample_files:
        try:
            content = f.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            errors.append(f"{f.name}: Could not read file: {e}")
            continue

        # Canonical
        m_canon = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', content, re.I)
        if not m_canon:
            m_canon = re.search(r'<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']', content, re.I)
        if not m_canon:
            errors.append(f"{f.name}: Missing <link rel=\"canonical\"> tag")
        else:
            canonical_urls.add(m_canon.group(1).strip())

        # Title
        m_title = re.search(r'<title>([^<]+)</title>', content, re.I)
        if not m_title or not m_title.group(1).strip():
            errors.append(f"{f.name}: Missing or empty <title>")

        # Description
        m_desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', content, re.I)
        if not m_desc or not m_desc.group(1).strip():
            errors.append(f"{f.name}: Missing or empty <meta name=\"description\">")

        # Open Graph Image
        m_og_img = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', content, re.I)
        if not m_og_img:
            errors.append(f"{f.name}: Missing <meta property=\"og:image\">")
        else:
            og_url = m_og_img.group(1)
            # Verify file exists in public/img/og
            og_filename = og_url.split("/")[-1]
            if og_filename not in og_cache:
                errors.append(f"{f.name}: Referenced OG image '{og_filename}' not found in public/img/og/")

        # Twitter Card
        if 'name="twitter:card" content="summary_large_image"' not in content:
            errors.append(f"{f.name}: Missing or invalid twitter:card summary_large_image")

        # Schema.org JSON-LD
        m_schema = re.search(r'<script\s+type=["\']application/ld\+json["\']>\s*(\{.*?\})\s*</script>', content, re.DOTALL | re.I)
        if not m_schema:
            errors.append(f"{f.name}: Missing Schema.org JSON-LD script block")
        else:
            try:
                schema_obj = json.loads(m_schema.group(1))
                if schema_obj.get("@type") != "Article":
                    errors.append(f"{f.name}: Schema.org @type is not Article")
            except Exception as json_err:
                errors.append(f"{f.name}: Corrupt Schema.org JSON: {json_err}")

        # Clean iframe URL check
        if "../blog.html?title=" in content:
            errors.append(f"{f.name}: Contains legacy redirecting iframe src '../blog.html?title=' instead of clean URL")

    # 3. Sitemap Verification
    if not SITEMAP_FILE.exists():
        errors.append("public/sitemap.xml is missing")
    else:
        try:
            tree = ET.parse(SITEMAP_FILE)
            root = tree.getroot()
            # Handle XML namespace
            ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            sitemap_locs = {loc.text.strip() for loc in root.findall("ns:url/ns:loc", ns) if loc.text}

            missing_in_sitemap = canonical_urls - sitemap_locs
            if missing_in_sitemap:
                sample_missing = list(missing_in_sitemap)[:5]
                errors.append(f"sitemap.xml is missing {len(missing_in_sitemap)} puzzle URLs (e.g. {sample_missing})")
            else:
                print(f"🗺️  Verified all {len(canonical_urls)} puzzle URLs present in sitemap.xml.")
        except Exception as sm_err:
            errors.append(f"public/sitemap.xml is corrupt: {sm_err}")

    # 4. Firebase Redirects Verification
    if not FIREBASE_FILE.exists():
        errors.append("firebase.json is missing")
    else:
        try:
            with open(FIREBASE_FILE, "r", encoding="utf-8") as fp:
                fb_data = json.load(fp)
            redirects = fb_data.get("hosting", {}).get("redirects", [])
            redirect_sources = {r.get("source") for r in redirects}
            required_redirects = ["/mi2/:path*", "/mi3/:path*", "/mi4/:path*", "/cpcq/:path*"]
            for rr in required_redirects:
                if rr not in redirect_sources:
                    errors.append(f"firebase.json is missing redirect rule for '{rr}'")
        except Exception as fb_err:
            errors.append(f"firebase.json read error: {fb_err}")

    if errors:
        print(f"\n❌ SEO & Puzzle metadata audit failed with {len(errors)} error(s):")
        for err in errors[:25]:
            print(f"   • {err}")
        if len(errors) > 25:
            print(f"   ... and {len(errors) - 25} more errors.")
        return 1

    print(f"✅ SEO & Chess Puzzle audit PASSED cleanly ({len(htm_files)} pages, all OG cards verified, sitemap synced).")
    return 0


if __name__ == "__main__":
    sys.exit(audit_seo_puzzles())

