import React, { useState, useEffect } from 'react';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

/**
 * Marwadi Chess home portal featuring game mode grid, rules preview, and daily puzzle highlight.
 *
 * @param props - HomePageProps configuration
 * @returns HomePage view component
 *
 * @example
 * ```tsx
 * <HomePage onNavigate={navigate} />
 * ```
 */
export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [appVersion, setAppVersion] = useState<string>('v3.9.3');

  useEffect(() => {
    document.title = 'Marwadi Chess | Play Chess Online, Learn Rules & Daily Puzzles';

    let active = true;
    fetch('/data/updates.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data)) return;
        const topItem = data.find((i: Record<string, unknown>) => i && i.version) || data[0];
        if (topItem && topItem.version) {
          let verStr = String(topItem.version).trim();
          if (!verStr.startsWith('v')) verStr = `v${verStr}`;
          setAppVersion(verStr);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="box-100 bg-E3 main-master">
      <div className="row mainContentHeader home-hero-header">
        <div id="scrlbar" className="box-90 overflow">
          <div id="Content3Header" className="col-md-12"></div>
        </div>
      </div>
      <div className="row body">
        <div id="welcome">
          <div className="container mchess-home-container">
            {/* ROW 1: Play & Tactics (Interactive Arenas & Puzzles) */}
            <div className="row">
              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/playonline" onClick={(e) => handleCardClick(e, 'playonline')}>
                      <div className="welcome_icon">
                        <i className="fas fa-globe"></i>
                      </div>
                    </a>
                    <a href="/playonline" onClick={(e) => handleCardClick(e, 'playonline')}>
                      <h4>
                        Play online
                        <br />
                        chess
                      </h4>
                    </a>
                    <p>
                      Play live timed chess (3m, 5m, 10m, 30m) on our open-source board with digital clocks, game history review, and PGN export.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/playcomp" onClick={(e) => handleCardClick(e, 'playcomp')}>
                      <div className="welcome_icon">
                        <i className="fas fa-robot"></i>
                      </div>
                    </a>
                    <a href="/playcomp" onClick={(e) => handleCardClick(e, 'playcomp')}>
                      <h4>
                        Play vs
                        <br />
                        computer
                      </h4>
                    </a>
                    <p>
                      Practice against Stockfish engine across 20 difficulty levels with side selection, move hints, navigation, and undo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/dailypuzzles" onClick={(e) => handleCardClick(e, 'dailypuzzles')}>
                      <div className="welcome_icon">
                        <i className="fas fa-puzzle-piece"></i>
                      </div>
                    </a>
                    <a href="/dailypuzzles" onClick={(e) => handleCardClick(e, 'dailypuzzles')}>
                      <h4>
                        Daily chess
                        <br />
                        puzzles
                      </h4>
                    </a>
                    <p>
                      Solve daily tactics powered by Lichess API and Stockfish engine solver with move hints, solutions, and streak counter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/train" onClick={(e) => handleCardClick(e, 'train')}>
                      <div className="welcome_icon">
                        <i className="fas fa-brain"></i>
                      </div>
                    </a>
                    <a href="/train" onClick={(e) => handleCardClick(e, 'train')}>
                      <h4>
                        Train
                        <br />
                        Yourself
                      </h4>
                    </a>
                    <p>
                      Sharpen tactical calculations with 1500+ curated checkmate puzzles from Mate in 2 to 5, sprint drills, and zen practice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Learn & Master (Rules, Traps, Master PGN Database & Broadcasts) */}
            <div className="row">
              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/chessrules" onClick={(e) => handleCardClick(e, 'chessrules')}>
                      <div className="welcome_icon">
                        <i className="fas fa-chess-board"></i>
                      </div>
                    </a>
                    <a href="/chessrules" onClick={(e) => handleCardClick(e, 'chessrules')}>
                      <h4>
                        Basic
                        <br />
                        Chess Rules
                      </h4>
                    </a>
                    <p>
                      Learn chess fundamentals with step-by-step rules. Master piece movement, board setup, castling, and beginner strategy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/chesstraps" onClick={(e) => handleCardClick(e, 'chesstraps')}>
                      <div className="welcome_icon">
                        <i className="fas fa-chess-queen"></i>
                      </div>
                    </a>
                    <a href="/chesstraps" onClick={(e) => handleCardClick(e, 'chesstraps')}>
                      <h4>
                        Learn
                        <br />
                        Chess Traps
                      </h4>
                    </a>
                    <p>
                      Master famous opening traps to surprise your opponents. Protect your king, avoid blunders, and win with sharp tactics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/pgngames" onClick={(e) => handleCardClick(e, 'pgngames')}>
                      <div className="welcome_icon">
                        <i className="fas fa-database"></i>
                      </div>
                    </a>
                    <a href="/pgngames" onClick={(e) => handleCardClick(e, 'pgngames')}>
                      <h4>
                        PGN Games
                        <br />
                        Database
                      </h4>
                    </a>
                    <p>
                      Explore grandmaster PGN archives, historical tournament collections, annotated openings, and move-by-move replays.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/watchlive" onClick={(e) => handleCardClick(e, 'watchlive')}>
                      <div className="welcome_icon">
                        <i className="fas fa-tv"></i>
                      </div>
                    </a>
                    <a href="/watchlive" onClick={(e) => handleCardClick(e, 'watchlive')}>
                      <h4>
                        Watch top live
                        <br />
                        games
                      </h4>
                    </a>
                    <p>
                      Watch live Grandmaster broadcasts across 6 channels (Top GM, Blitz, Rapid, Bullet, Classical, UltraBullet) with fullscreen mode.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Community, Knowledge & About (Blog, Quotes, Updates & About Us) */}
            <div className="row">
              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/blog" onClick={(e) => handleCardClick(e, 'blog')}>
                      <div className="welcome_icon">
                        <i className="fas fa-newspaper"></i>
                      </div>
                    </a>
                    <a href="/blog" onClick={(e) => handleCardClick(e, 'blog')}>
                      <h4>
                        Chess
                        <br />
                        Blog
                      </h4>
                    </a>
                    <p>
                      Read chess blogs featuring dynamic FEN puzzle engines (MI2, MI3, MI4), chess history, quotes, and tactical studies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/blog?cat=Chess%20Quotes" onClick={(e) => handleCardClick(e, 'blog?cat=Chess%20Quotes')}>
                      <div className="welcome_icon">
                        <i className="fas fa-quote-left"></i>
                      </div>
                    </a>
                    <a href="/blog?cat=Chess%20Quotes" onClick={(e) => handleCardClick(e, 'blog?cat=Chess%20Quotes')}>
                      <h4>
                        Chess
                        <br />
                        Quotes
                      </h4>
                    </a>
                    <p>
                      Explore inspiring chess quotes from Marwadi Chess to boost your tactical mindset, strategic vision, and passion for the game.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/updates" onClick={(e) => handleCardClick(e, 'updates')}>
                      <div className="welcome_icon">
                        <i className="fas fa-bullhorn"></i>
                      </div>
                    </a>
                    <a href="/updates" onClick={(e) => handleCardClick(e, 'updates')}>
                      <h4>
                        Website
                        <br />
                        Updates
                      </h4>
                    </a>
                    <p>
                      Discover the latest feature releases, engine improvements, bug fixes, dynamic defense updates, and platform notes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="/about" onClick={(e) => handleCardClick(e, 'about')}>
                      <div className="welcome_icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                    </a>
                    <a href="/about" onClick={(e) => handleCardClick(e, 'about')}>
                      <h4>
                        About
                        <br />
                        Marwadi Chess <sup className="brand-version mchess-home-version-badge">{appVersion}</sup>
                      </h4>
                    </a>
                    <p>
                      Learn about our mission to make high-quality chess learning, open-source boards, puzzles, and tournaments accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
