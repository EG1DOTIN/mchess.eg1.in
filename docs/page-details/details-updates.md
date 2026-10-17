# Page Details: What's New & Release Notes (`updates.html`)

**Page File:** [updates.html](../../updates.html)  
**Styles:** [css/news.css](../../css/news.css)  
**Scripts:** [js/updates.js](../../js/updates.js), [data/updates.json](../../data/updates.json)  
**Category:** Portal Feed & Changelog  

---

## 📌 Overview

The **What's New & Release Notes** page (`updates.html`) provides a centralized, interactive changelog of all feature additions, Stockfish AI engine upgrades, bug fixes, UI/UX optimizations, and performance improvements across Marwadi Chess.

---

## ⚙️ Architecture & Data Flow

```mermaid
flowchart TD
    NewsJson["data/updates.json (Single Source of Truth)"] --> NewsJS["js/updates.js Client Controller"]
    NewsJson --> VersionSync["js/include-components.js: syncAppVersion()"]
    NewsJS --> FilterQuery{"Active Category Filter and Search Query"}
    FilterQuery --> RenderCards["Render Responsive Feed Cards"]
    RenderCards --> FeedDOM["#newsFeedContainer DOM"]
    NewsJS --> UpdateStats["updateStats() -> window.applyVersionToDOM()"]
    VersionSync --> UpdateStats
    UpdateStats --> StatLatest["#statLatestVersion (Latest Release Stat)"]
    UpdateStats --> BrandTargets["All [data-mchess-version] Brand Superscripts"]
```

---

## 🎯 Key Features

1. **Platform Version Single Source of Truth (SSOT)**: The top entry in [`data/updates.json`](../../data/updates.json) defines the active platform version (e.g. `v3.9.3`). The dynamic version engine hydrates `#statLatestVersion` and all platform brand titles automatically without hardcoding.
2. **Latest Updates First**: Loads announcements in reverse chronological order with pinned release tags (Latest: **v3.9.3** Enhancement).
3. **Category Filtering**: 1-click filter chips for `All`, `Features`, `Bug Fixes`, `Optimizations`, and `AI & Tactics`.
4. **Real-Time Search**: Instant client-side text filtering across release titles, messages, versions, and tags.
5. **Direct Context Navigation**: Every release card includes a customized action link (e.g. `Explore Feature on Play Online →`) pointing directly to the relevant feature page.
6. **Theme Compatibility**: Supports seamless dark mode and light mode switching via CSS custom properties.
7. **SEO & Structured Data**: Complete Schema.org WebPage JSON-LD and Open Graph / X (Twitter) social sharing tags.
