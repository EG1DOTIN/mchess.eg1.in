import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [appVersion, setAppVersion] = useState<string>('v3.9.3');

  useEffect(() => {
    document.title = 'Marwadi Chess | Play Chess Online, Learn Rules & Daily Puzzles';

    let active = true;
    fetch('/data/updates.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data)) return;
        const topItem = data.find((i: any) => i && i.version) || data[0];
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
          <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 15px' }}>
            {/* ROW 1: Play & Tactics (Interactive Arenas & Puzzles) */}
            <div className="row">
              <div className="col-md-3">
                <div className="single_item">
                  <div className="item_list">
                    <a href="playonline.html" onClick={(e) => handleCardClick(e, 'playonline.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-globe"></i>
                      </div>
                    </a>
                    <a href="playonline.html" onClick={(e) => handleCardClick(e, 'playonline.html')}>
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
                    <a href="playcomp.html" onClick={(e) => handleCardClick(e, 'playcomp.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-robot"></i>
                      </div>
                    </a>
                    <a href="playcomp.html" onClick={(e) => handleCardClick(e, 'playcomp.html')}>
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
                    <a href="dailypuzzles.html" onClick={(e) => handleCardClick(e, 'dailypuzzles.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-puzzle-piece"></i>
                      </div>
                    </a>
                    <a href="dailypuzzles.html" onClick={(e) => handleCardClick(e, 'dailypuzzles.html')}>
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
                    <a href="train.html" onClick={(e) => handleCardClick(e, 'train.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-brain"></i>
                      </div>
                    </a>
                    <a href="train.html" onClick={(e) => handleCardClick(e, 'train.html')}>
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
                    <a href="chessrules.html" onClick={(e) => handleCardClick(e, 'chessrules.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-chess-board"></i>
                      </div>
                    </a>
                    <a href="chessrules.html" onClick={(e) => handleCardClick(e, 'chessrules.html')}>
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
                    <a href="chesstraps.html" onClick={(e) => handleCardClick(e, 'chesstraps.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-chess-queen"></i>
                      </div>
                    </a>
                    <a href="chesstraps.html" onClick={(e) => handleCardClick(e, 'chesstraps.html')}>
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
                    <a href="pgngames.html" onClick={(e) => handleCardClick(e, 'pgngames.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-database"></i>
                      </div>
                    </a>
                    <a href="pgngames.html" onClick={(e) => handleCardClick(e, 'pgngames.html')}>
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
                    <a href="watchlive.html" onClick={(e) => handleCardClick(e, 'watchlive.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-tv"></i>
                      </div>
                    </a>
                    <a href="watchlive.html" onClick={(e) => handleCardClick(e, 'watchlive.html')}>
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
                    <a href="blog.html" onClick={(e) => handleCardClick(e, 'blog.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-newspaper"></i>
                      </div>
                    </a>
                    <a href="blog.html" onClick={(e) => handleCardClick(e, 'blog.html')}>
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
                    <a href="blog.html?cat=Chess%20Quotes" onClick={(e) => handleCardClick(e, 'blog.html?cat=Chess%20Quotes')}>
                      <div className="welcome_icon">
                        <i className="fas fa-quote-left"></i>
                      </div>
                    </a>
                    <a href="blog.html?cat=Chess%20Quotes" onClick={(e) => handleCardClick(e, 'blog.html?cat=Chess%20Quotes')}>
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
                    <a href="updates.html" onClick={(e) => handleCardClick(e, 'updates.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-bullhorn"></i>
                      </div>
                    </a>
                    <a href="updates.html" onClick={(e) => handleCardClick(e, 'updates.html')}>
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
                    <a href="about.html" onClick={(e) => handleCardClick(e, 'about.html')}>
                      <div className="welcome_icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                    </a>
                    <a href="about.html" onClick={(e) => handleCardClick(e, 'about.html')}>
                      <h4>
                        About
                        <br />
                        Marwadi Chess <sup className="brand-version" style={{ fontSize: '11px', color: '#d4af37' }}>{appVersion}</sup>
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
