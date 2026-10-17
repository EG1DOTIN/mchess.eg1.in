# 🛠️ Marwadi Chess — Automation & Quality Verification Suite

This directory contains automated health checks, codebase link validators, asset reference scanners, and dataset FEN verifiers used both locally and within GitHub Actions CI/CD pipelines.

---

## 📋 Audit Suites Inventory (`audit/`)

| Script | Purpose & Scope | Execution Command |
| :--- | :--- | :--- |
| **[`audit_codebase.py`](audit/audit_codebase.py)** | Verifies that 100% of HTML `<script src="...">`, `<link href="...">`, and `<img src="...">` tags point to existing files on disk. | `python automation-scripts/audit/audit_codebase.py` |
| **[`scan_docs_links.py`](audit/scan_docs_links.py)** | Scans all Markdown documents across the repository to verify that internal hyperlinks and cross-references resolve. | `python automation-scripts/audit/scan_docs_links.py` |
| **[`audit_folder_references.py`](audit/audit_folder_references.py)** | Scans for legacy root paths and ensures all tactical puzzle images use consolidated `img/` paths. | `python automation-scripts/audit/audit_folder_references.py` |
| **[`audit_gitignored_mentions.py`](audit/audit_gitignored_mentions.py)** | Pre-commit security gate ensuring zero references or paths to gitignored directories exist in public files. | `python automation-scripts/audit/audit_gitignored_mentions.py` |
| **[`validate_and_audit_datasets.py`](audit/validate_and_audit_datasets.py)** | Validates master JSON dataset structure, record integrity, and verifies all tactical FEN positions using `python-chess`. | `python automation-scripts/audit/validate_and_audit_datasets.py` |

---

## ♟️ 1-Click Unified Verification Suite

Run all quality checks in a single command:

```bash
# Execute full verification suite
python automation-scripts/verify_all.py

# Verbose output mode (displays line-by-line tool output)
python automation-scripts/verify_all.py --verbose
```

---

## 🚀 CI/CD & Pipeline Integration

This suite is integrated directly into GitHub Actions (`.github/workflows/ci.yml`) to enforce quality gates on every push and pull request before changes are merged or deployed to Firebase Hosting.

### Requirements:
- Python 3.10+
- `chess>=1.10.0` (see [`requirements.txt`](./requirements.txt))
