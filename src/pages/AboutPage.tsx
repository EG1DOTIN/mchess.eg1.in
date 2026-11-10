import React, { useEffect } from 'react';
import './AboutPage.css';

/**
 * About Marwadi Chess platform heritage, engine capabilities, and roadmap.
 *
 * @returns AboutPage view component
 *
 * @example
 * ```tsx
 * <Route path="/about" element={<AboutPage />} />
 * ```
 */
export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Marwadi Chess | Open-Source Heritage, AI Engine & Tactics';

    const timer = setTimeout(() => {
      if ((window as any).initAboutPage) {
        (window as any).initAboutPage();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-about-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-about-content">
          <div className="row">
            <div className="col-md-12">
              <main className="demo-about-container">
                {/* 1. HERO SECTION */}
                <section className="demo-about-hero">
                  <div className="demo-about-badge">
                    <i className="fas fa-chess-queen"></i> Open-Source Chess Platform
                  </div>
                  <h1 className="demo-about-title">
                    Master the Art of Strategy with <br />
                    <span className="demo-about-title-highlight">Marwadi Chess</span>
                  </h1>
                  <p className="demo-about-subtitle">
                    <strong>Marwadi Chess</strong> (मारवाड़ी शतरंज) is a modern, community-driven chess portal dedicated to chess learning and strategic play. From grandmaster opening traps and tactical checkmate drills to peer-to-peer matchmaking and timeless chess philosophy, we make royal strategy accessible to players everywhere.
                  </p>
                  <div className="demo-about-hero-actions">
                    <a href="playonline.html" className="demo-btn demo-btn-primary">
                      <i className="fas fa-chess-knight"></i> Play Online Chess
                    </a>
                    <a href="playcomp.html" className="demo-btn demo-btn-secondary">
                      <i className="fas fa-robot"></i> Challenge Stockfish
                    </a>
                    <a href="#features-grid" className="demo-btn demo-btn-secondary">
                      <i className="fas fa-compass"></i> Explore Features ↓
                    </a>
                  </div>
                </section>

                {/* 2. PLATFORM STATS GRID */}
                <section className="demo-stats-grid" aria-label="Platform Statistics">
                  <div className="demo-stat-card">
                    <div className="demo-stat-icon"><i className="fas fa-puzzle-piece"></i></div>
                    <div className="demo-stat-number">1,500+</div>
                    <div className="demo-stat-label">Curated Tactics &amp; Checkmate Puzzles</div>
                  </div>
                  <div className="demo-stat-card">
                    <div className="demo-stat-icon"><i className="fas fa-microchip"></i></div>
                    <div className="demo-stat-number">20</div>
                    <div className="demo-stat-label">Stockfish Engine Difficulty Levels</div>
                  </div>
                  <div className="demo-stat-card">
                    <div className="demo-stat-icon"><i className="fas fa-tv"></i></div>
                    <div className="demo-stat-number">6</div>
                    <div className="demo-stat-label">Live GM Broadcast Channels</div>
                  </div>
                  <div className="demo-stat-card">
                    <div className="demo-stat-icon"><i className="fas fa-unlock-alt"></i></div>
                    <div className="demo-stat-number">100%</div>
                    <div className="demo-stat-label">Free &amp; Open-Source Features</div>
                  </div>
                  <div className="demo-stat-card">
                    <div className="demo-stat-icon"><i className="fas fa-shield-alt"></i></div>
                    <div className="demo-stat-number">0</div>
                    <div className="demo-stat-label">Intrusive Ads or Tracking Profiles</div>
                  </div>
                </section>

                {/* 3. CHESS QUOTE STUDIO */}
                <section className="demo-quote-section" aria-label="Chess Quote of the Day">
                  <div className="demo-quote-studio">
                    <div className="demo-quote-visual-wrapper">
                      <img id="demo-quote-img" src="/img/cpcq/id5.webp" alt="Chess Quote of the Day | Marwadi Chess" className="demo-quote-img" loading="eager" />
                    </div>
                    <div className="demo-quote-details">
                      <div className="demo-quote-tag">
                        <i className="fas fa-quote-left"></i> Daily Strategic Mindset
                      </div>
                      <blockquote className="demo-quote-blockquote" id="demo-quote-text">
                        “Chess is the struggle against the error.”
                      </blockquote>
                      <div className="demo-quote-author" id="demo-quote-author">
                        <i className="fas fa-feather-alt"></i> Johannes Zukertort
                      </div>
                      <div className="demo-quote-actions">
                        <button type="button" id="demo-quote-shuffle-btn" className="demo-quote-btn" title="Display another random inspiring quote">
                          <i className="fas fa-random"></i> Shuffle Quote
                        </button>
                        <button type="button" id="demo-quote-copy-btn" className="demo-quote-btn" title="Copy quote to clipboard">
                          <i className="fas fa-copy"></i> Copy Quote
                        </button>
                        <button type="button" id="demo-quote-share-btn" className="demo-quote-btn" title="Share quote on social media">
                          <i className="fas fa-share-alt"></i> Share
                        </button>
                        <a href="blog.html?cat=Chess%20Quotes" className="demo-quote-btn" title="Browse the full chess quotes library">
                          <i className="fas fa-arrow-right"></i> All Quotes →
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. HERITAGE & CULTURE SECTION */}
                <section className="demo-heritage-card" aria-label="Chess Heritage and Cultural Roots">
                  <h2 className="demo-section-title">
                    <i className="fas fa-landmark" style={{ color: 'var(--about-gold-main, #d4af37)' }}></i> Celebrating 4,500 Years of Chess Heritage
                  </h2>
                  <div className="demo-heritage-content">
                    <div className="demo-heritage-text">
                      <p>
                        Chess is one of humanity’s greatest intellectual treasures, originating in ancient India over <strong>4,500 years ago</strong> as <em>Chaturanga</em> (चतुरङ्ग) and <em>Ashtapada</em> during the Indus Valley civilization. From ancient carved stone tablets to modern digital battlefields, the royal game of strategy has trained minds, sharpened intuition, and crossed continents.
                      </p>
                      <p>
                        The spirit of <strong>Marwadi Chess</strong> draws inspiration from this rich cultural tradition—embodying foresight, meticulous calculation, and disciplined strategy. We honor this timeless legacy by bridging ancient chess philosophy with modern digital web engineering.
                      </p>
                    </div>
                    <div className="demo-heritage-box">
                      <div className="demo-heritage-box-title">Evolution Timeline</div>
                      <ul className="demo-heritage-timeline">
                        <li>
                          <i className="fas fa-history"></i>
                          <div><strong>2500 BCE (Indus Valley)</strong>: Early board dice &amp; <em>Ashtapada</em> grids.</div>
                        </li>
                        <li>
                          <i className="fas fa-chess-pawn"></i>
                          <div><strong>6th Century CE (India)</strong>: Four-division military game <em>Chaturanga</em>.</div>
                        </li>
                        <li>
                          <i className="fas fa-globe-asia"></i>
                          <div><strong>7th-15th Century (Persia &amp; Europe)</strong>: <em>Shatranj</em> evolves into modern international chess.</div>
                        </li>
                        <li>
                          <i className="fas fa-laptop-code"></i>
                          <div><strong>Today (Marwadi Chess)</strong>: Universal, open-source digital arena for learners worldwide.</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 5. FEATURE EXPLORATION GRID (3 Columns) */}
                <section id="features-grid" className="demo-features-section" aria-label="Platform Features">
                  <div className="demo-section-header">
                    <h2 className="demo-section-title" style={{ justifyContent: 'center' }}>
                      <i className="fas fa-th-large" style={{ color: 'var(--about-gold-main, #d4af37)' }}></i> Explore the Ecosystem
                    </h2>
                    <p className="demo-section-subtitle">
                      Everything you need to learn, train, play, and analyze—curated into a fast, lightweight, and responsive experience.
                    </p>
                  </div>

                  <div className="demo-features-grid">
                    {/* Card 1: Play Online */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-globe"></i></div>
                          <span className="demo-feature-tag">Multiplayer</span>
                        </div>
                        <h3 className="demo-feature-title">Live Play Online</h3>
                        <p className="demo-feature-desc">
                          Challenge friends or global players with custom time controls (3m, 5m, 10m, 30m), peer-to-peer matchmaking, digital clocks, and PGN export.
                        </p>
                      </div>
                      <a href="playonline.html" className="demo-feature-action">Enter Arena →</a>
                    </div>

                    {/* Card 2: Play Computer */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-robot"></i></div>
                          <span className="demo-feature-tag">Engine AI</span>
                        </div>
                        <h3 className="demo-feature-title">Play vs. Stockfish</h3>
                        <p className="demo-feature-desc">
                          Practice against the world-class Stockfish engine across 20 granular difficulty levels with move hints, side selection, and move undo.
                        </p>
                      </div>
                      <a href="playcomp.html" className="demo-feature-action">Challenge Computer →</a>
                    </div>

                    {/* Card 3: Daily Puzzles */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-calendar-check"></i></div>
                          <span className="demo-feature-tag">Daily Tactics</span>
                        </div>
                        <h3 className="demo-feature-title">Daily Chess Tactics</h3>
                        <p className="demo-feature-desc">
                          Solve fresh daily puzzles powered by official Lichess feeds and Stockfish engine verification with streak tracking and hint systems.
                        </p>
                      </div>
                      <a href="dailypuzzles.html" className="demo-feature-action">Solve Daily Puzzle →</a>
                    </div>

                    {/* Card 4: Tactics Arena */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-brain"></i></div>
                          <span className="demo-feature-tag">Training</span>
                        </div>
                        <h3 className="demo-feature-title">Tactics Trainer</h3>
                        <p className="demo-feature-desc">
                          Master checkmating patterns with 1500+ curated Mate-in-2, Mate-in-3, Mate-in-4, timed sprints, and survival drills.
                        </p>
                      </div>
                      <a href="train.html" className="demo-feature-action">Start Training →</a>
                    </div>

                    {/* Card 5: Opening Traps */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-crosshairs"></i></div>
                          <span className="demo-feature-tag">Theory</span>
                        </div>
                        <h3 className="demo-feature-title">Opening Traps</h3>
                        <p className="demo-feature-desc">
                          Learn lethal opening traps in the Italian, Sicilian, French, and Queen's Gambit to punish early opponent inaccuracies.
                        </p>
                      </div>
                      <a href="chesstraps.html" className="demo-feature-action">Explore Traps →</a>
                    </div>

                    {/* Card 6: Watch Live */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-broadcast-tower"></i></div>
                          <span className="demo-feature-tag">Broadcasts</span>
                        </div>
                        <h3 className="demo-feature-title">Watch Top Live Games</h3>
                        <p className="demo-feature-desc">
                          Spectate live Grandmaster matches across 6 channels (Top GM, Blitz, Rapid, Classical, Bullet) with category filters and fullscreen mode.
                        </p>
                      </div>
                      <a href="watchlive.html" className="demo-feature-action">Watch Live →</a>
                    </div>

                    {/* Card 7: PGN Database */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-database"></i></div>
                          <span className="demo-feature-tag">Archive</span>
                        </div>
                        <h3 className="demo-feature-title">PGN Game Archives</h3>
                        <p className="demo-feature-desc">
                          Study, replay, and analyze historic chess masterpieces move-by-move using our responsive interactive board viewer.
                        </p>
                      </div>
                      <a href="pgngames.html" className="demo-feature-action">Browse PGN Database →</a>
                    </div>

                    {/* Card 8: Interactive Blog & Rules */}
                    <div className="demo-feature-card">
                      <div className="demo-feature-top">
                        <div className="demo-feature-header-row">
                          <div className="demo-feature-icon-wrapper"><i className="fas fa-book-open"></i></div>
                          <span className="demo-feature-tag">Education</span>
                        </div>
                        <h3 className="demo-feature-title">Rules &amp; Studies</h3>
                        <p className="demo-feature-desc">
                          Step-by-step rules for beginners, tactical studies with dynamic FEN puzzle boards, and historical grandmaster deep dives.
                        </p>
                      </div>
                      <a href="chessrules.html" className="demo-feature-action">Learn Chess Rules →</a>
                    </div>
                  </div>
                </section>

                {/* 6. TECH STACK & OPEN SOURCE ARCHITECTURE */}
                <section className="demo-tech-section" aria-label="Technology and Architecture">
                  <h2 className="demo-section-title">
                    <i className="fas fa-code-branch" style={{ color: 'var(--about-gold-main, #d4af37)' }}></i> Technology Behind the Board
                  </h2>
                  <p style={{ fontSize: '14.5px', color: 'var(--about-text-muted, #94a3b8)', marginBottom: 0 }}>
                    Marwadi Chess is engineered to be blazing fast, lightweight, and privacy-respecting without heavy framework overhead.
                  </p>
                  <div className="demo-tech-grid">
                    <div className="demo-tech-item">
                      <div className="demo-tech-icon"><i className="fas fa-microchip"></i></div>
                      <div>
                        <div className="demo-tech-name">Stockfish Engine</div>
                        <p className="demo-tech-detail">WebAssembly and Web Worker background execution for zero UI lag.</p>
                      </div>
                    </div>
                    <div className="demo-tech-item">
                      <div className="demo-tech-icon"><i className="fas fa-cloud"></i></div>
                      <div>
                        <div className="demo-tech-name">Lichess Open API</div>
                        <p className="demo-tech-detail">Real-time daily puzzle integration and Grandmaster broadcast relay.</p>
                      </div>
                    </div>
                    <div className="demo-tech-item">
                      <div className="demo-tech-icon"><i className="fas fa-network-wired"></i></div>
                      <div>
                        <div className="demo-tech-name">WebRTC &amp; PeerJS</div>
                        <p className="demo-tech-detail">Low-latency, peer-to-peer multiplayer communication.</p>
                      </div>
                    </div>
                    <div className="demo-tech-item">
                      <div className="demo-tech-icon"><i className="fas fa-chess-board"></i></div>
                      <div>
                        <div className="demo-tech-name">Vector Staunton Board</div>
                        <p className="demo-tech-detail">Sharp SVG piece rendering scalable from mobile phones to 4K displays.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. FREQUENTLY ASKED QUESTIONS */}
                <section className="demo-faq-section" aria-label="Frequently Asked Questions">
                  <div className="demo-section-header">
                    <h2 className="demo-section-title" style={{ justifyContent: 'center' }}>
                      <i className="fas fa-question-circle" style={{ color: 'var(--about-gold-main, #d4af37)' }}></i> Frequently Asked Questions
                    </h2>
                    <p className="demo-section-subtitle">
                      Common questions about using, playing, and learning on Marwadi Chess.
                    </p>
                  </div>

                  <div className="demo-faq-list">
                    <details className="demo-faq-item" open>
                      <summary className="demo-faq-summary">
                        <span>Is Marwadi Chess free to use?</span>
                        <i className="fas fa-chevron-down"></i>
                      </summary>
                      <div className="demo-faq-body">
                        Yes! As Marwadi Chess website is open-source, all features currently implemented—including online multiplayer, Stockfish engine play across 20 difficulty levels, daily tactical puzzles, checkmate training drills, and PGN game archives—are 100% FREE to use.
                      </div>
                    </details>

                    <details className="demo-faq-item">
                      <summary className="demo-faq-summary">
                        <span>Do I need to register an account to play online?</span>
                        <i className="fas fa-chevron-down"></i>
                      </summary>
                      <div className="demo-faq-body">
                        Currently not required. You can play immediately by choosing a handle, generating a match room, or challenging the Stockfish engine without any signup.
                      </div>
                    </details>

                    <details className="demo-faq-item">
                      <summary className="demo-faq-summary">
                        <span>Can I play on my mobile phone or tablet?</span>
                        <i className="fas fa-chevron-down"></i>
                      </summary>
                      <div className="demo-faq-body">
                        Absolutely. The entire interface is built mobile-first with touch-friendly piece dragging, tap-to-move support, responsive boards, and automatic orientation handling.
                      </div>
                    </details>

                    <details className="demo-faq-item">
                      <summary className="demo-faq-summary">
                        <span>How is player privacy protected?</span>
                        <i className="fas fa-chevron-down"></i>
                      </summary>
                      <div className="demo-faq-body">
                        Marwadi Chess operates under strict privacy-first principles. We do not sell user data, utilize invasive cross-site profiling trackers, or require email verification for casual play.
                      </div>
                    </details>
                  </div>
                </section>

                {/* 8. GUIDING PRINCIPLES & CONTRIBUTION CTA */}
                <section aria-label="Guiding Principles and Community">
                  <div className="demo-principles-grid">
                    <div className="demo-principle-card">
                      <div className="demo-principle-title"><i className="fab fa-github"></i> Open Source Spirit</div>
                      <p className="demo-principle-desc">Public code transparency, modular architecture, and community contributions are in our DNA.</p>
                    </div>
                    <div className="demo-principle-card">
                      <div className="demo-principle-title"><i className="fas fa-user-shield"></i> Privacy-First</div>
                      <p className="demo-principle-desc">Zero intrusive trackers, full cookie consent transparency, and local data persistence.</p>
                    </div>
                    <div className="demo-principle-card">
                      <div className="demo-principle-title"><i className="fas fa-universal-access"></i> Universal Access</div>
                      <p className="demo-principle-desc">Lightweight asset footprints, high accessibility contrast (WCAG 2.1), and seamless Dark Mode.</p>
                    </div>
                    <div className="demo-principle-card">
                      <div className="demo-principle-title"><i className="fas fa-hands-helping"></i> Community Driven</div>
                      <p className="demo-principle-desc">Built for players, teachers, and enthusiasts around the globe with dedicated platforms.</p>
                    </div>
                  </div>

                  <div className="demo-cta-card">
                    <h3>Join the Marwadi Chess Community</h3>
                    <p>
                      Whether you want to suggest an opening trap, report a feature idea, or contribute code improvements, we’d love to hear from you.
                    </p>
                    <div className="demo-cta-actions">
                      <a href="https://github.com/EG1DOTIN/mchess.eg1.in" target="_blank" rel="noopener noreferrer" className="demo-btn demo-btn-primary">
                        <i className="fab fa-github"></i> View GitHub Repository
                      </a>
                      <a href="https://eg1.in/contact" target="_blank" rel="noopener noreferrer" className="demo-btn demo-btn-secondary">
                        <i className="fas fa-envelope"></i> Contact Us
                      </a>
                      <a href="privacypolicy" className="demo-btn demo-btn-secondary">
                        <i className="fas fa-lock"></i> Privacy Policy
                      </a>
                    </div>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
