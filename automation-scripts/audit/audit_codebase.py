"""
MCHESS Codebase Asset & Link Auditor
====================================
Scans all HTML, JavaScript, and CSS files for broken asset references, broken image sources,
missing stylesheets, and script dependencies.

Usage:
    python automation-scripts/audit/audit_codebase.py
"""

import os
import re
import glob
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

html_files = glob.glob(os.path.join(PROJECT_ROOT, '*.html'))
js_files = glob.glob(os.path.join(PROJECT_ROOT, 'js', '*.js'))
css_files = glob.glob(os.path.join(PROJECT_ROOT, 'css', '*.css'))

print("==================================================")
print(f"🔍 Auditing Marwadi Chess ({PROJECT_ROOT})")
print(f"   - HTML Files: {len(html_files)}")
print(f"   - JS Files:   {len(js_files)}")
print(f"   - CSS Files:  {len(css_files)}")
print("==================================================")

broken_assets = []

for h in html_files:
    fname = os.path.basename(h)
    with open(h, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. Check <script src="...">
    scripts = re.findall(r'<script[^>]+src=[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
    for s in scripts:
        if not s.startswith('http') and not s.startswith('//') and not s.startswith('data:'):
            target = os.path.normpath(os.path.join(PROJECT_ROOT, s))
            if not os.path.exists(target):
                broken_assets.append(f"[BROKEN SCRIPT] {fname} -> {s}")
                
    # 2. Check <link href="..."> (stylesheets and favicons)
    css_links = re.findall(r'<link[^>]+href=[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
    for c in css_links:
        if not c.startswith('http') and not c.startswith('//') and not c.startswith('data:') and not c.startswith('#'):
            target = os.path.normpath(os.path.join(PROJECT_ROOT, c))
            if not os.path.exists(target):
                broken_assets.append(f"[BROKEN LINK/CSS] {fname} -> {c}")

    # 3. Check <img src="...">
    imgs = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
    for img in imgs:
        if not img.startswith('http') and not img.startswith('//') and not img.startswith('data:'):
            clean_img = img.split('?')[0].replace('/', os.sep).replace('\\', os.sep)
            if clean_img.startswith('.' + os.sep):
                clean_img = clean_img[2:]
            target = os.path.normpath(os.path.join(PROJECT_ROOT, clean_img))
            if not os.path.exists(target):
                broken_assets.append(f"[BROKEN IMG] {fname} -> {img}")

if broken_assets:
    print(f"\n⚠️ Found {len(broken_assets)} broken reference(s):")
    for b in broken_assets:
        print(f"   {b}")
    sys.exit(1)
else:
    print("\n✅ All HTML script, stylesheet, favicon, and image paths exist on disk!")
    sys.exit(0)
