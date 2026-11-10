import React, { useEffect, useRef } from 'react';
import { ChessModuleInstance } from '../types/chess';
import './DailyPuzzlesPage.css';

/**
 * Interactive daily chess puzzles and tactics solver page.
 *
 * @returns DailyPuzzlesPage view component
 *
 * @example
 * ```tsx
 * <Route path="/dailypuzzles" element={<DailyPuzzlesPage />} />
 * ```
 */
export const DailyPuzzlesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Daily Chess Puzzle & Tactics | Marwadi Chess';

    let instance: ChessModuleInstance | null = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessPuzzleContainer');
      if (el && (window as any).MChessEngineBoard) {
        el.innerHTML = '';
        el.removeAttribute('data-mchess-initialized');
        instance = new (window as any).MChessEngineBoard(el, { mode: 'daily' });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (instance) {
        if (instance.stockfishWorker) {
          try {
            instance.stockfishWorker.terminate();
          } catch (e) {}
        }
        if (instance.clockInterval) {
          clearInterval(instance.clockInterval);
        }
      }
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-puzzle-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-puzzle-content">
          <div className="row">
            <div className="col-md-9">
              {/* Open-Source MCHESS Daily Puzzle & Stockfish Engine Solver */}
              <div id="mchessPuzzleContainer" data-mode="daily" ref={containerRef}></div>
            </div>

            <div className="col-md-3 mchess-puzzle-sidebar">
              {/* 1. Facebook Group Card */}
              <div className="mchess-fb-group-card">
                <div style={{ lineHeight: 0 }}>
                  <img
                    className="img mchess-fb-group-img"
                    src="/img/mchess_fb_group.webp"
                    width="340"
                    height="180"
                    alt="Marwadi Chess Group"
                  />
                </div>
                <div className="mchess-fb-group-title">
                  Marwadi Chess Group
                </div>
                <div className="mchess-fb-group-subtitle">
                  Public group · 225 members
                </div>
                <div style={{ padding: '4px 16px 12px 16px' }}>
                  <div className="mchess-fb-group-btn-box">
                    <a
                      className="mchess-fb-group-btn"
                      href="https://www.facebook.com/groups/2720714741537938"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Group
                    </a>
                  </div>
                </div>
                <div className="mchess-fb-group-footer">
                  Please maintain good behavior. Let's ask, share, and comment only about chess/Shatranj.
                </div>
              </div>

              {/* 2. Facebook Page Embed */}
              <div className="mchess-fb-embed-wrapper">
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fm1chess%2F&tabs=timeline&width=340&height=380&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                  width="100%"
                  height="380"
                  className="mchess-fb-embed-frame"
                  scrolling="no"
                  frameBorder={0}
                  allow="encrypted-media"
                  title="Marwadi Chess Facebook"
                />
              </div>

              {/* 3. Instagram Embed Link */}
              <div className="mchess-insta-card">
                <div className="mchess-insta-title">
                  <i className="fab fa-instagram" style={{ marginRight: '6px' }}></i> Instagram Community
                </div>
                <p className="mchess-insta-desc">
                  Follow @marwadichess for daily tactics, quotes & visual puzzles!
                </p>
                <a
                  href="https://www.instagram.com/marwadichess/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mchess-insta-btn"
                >
                  Follow on Instagram
                </a>
              </div>

              {/* 4. Twitter / X Follow Card */}
              <div className="mchess-twitter-card">
                <div className="mchess-twitter-title">
                  <i className="fab fa-x-twitter" style={{ marginRight: '6px' }}></i> Marwadi Chess on 𝕏
                </div>
                <a
                  href="https://twitter.com/ChessMarwadi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mchess-twitter-btn"
                >
                  Follow @ChessMarwadi
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPuzzlesPage;
