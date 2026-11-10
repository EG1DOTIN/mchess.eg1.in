import React, { useEffect } from 'react';
import './UpdatesPage.css';

/**
 * Release updates and changelog feed for Marwadi Chess.
 *
 * @returns UpdatesPage view component
 *
 * @example
 * ```tsx
 * <Route path="/updates" element={<UpdatesPage />} />
 * ```
 */
export const UpdatesPage: React.FC = () => {
  useEffect(() => {
    document.title = "What's New & Release Updates | Marwadi Chess";

    const timer = setTimeout(() => {
      if ((window as any).initUpdatesFeed) {
        (window as any).initUpdatesFeed();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-updates-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-updates-content">
          <div className="row">
            <div className="col-md-12">
              <div className="news-page-wrapper">
                {/* Header Banner */}
                <div className="news-header-banner">
                  <div>
                    <h1 className="news-header-title">
                      <i className="fas fa-bullhorn" style={{ color: '#f59e0b' }}></i> What's New & Release Updates
                    </h1>
                    <p className="news-header-desc">
                      Explore our latest feature rollouts, Stockfish engine upgrades, live multiplayer arena enhancements, board customization themes, and performance optimizations.
                    </p>
                  </div>
                  <div className="news-stats-pill">
                    <div className="news-stat-item">
                      <div className="news-stat-num" id="statLatestVersion" data-mchess-version></div>
                      <div className="news-stat-lbl">Latest Release</div>
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.15)' }}></div>
                    <div className="news-stat-item">
                      <div className="news-stat-num" id="statTotalUpdates">22</div>
                      <div className="news-stat-lbl">Total Updates</div>
                    </div>
                  </div>
                </div>

                {/* Filter Toolbar & Search Bar */}
                <div className="news-toolbar">
                  <div className="news-filter-chips">
                    <button className="news-filter-btn active" data-filter="all">
                      <i className="fas fa-th-large"></i> All Updates
                    </button>
                    <button className="news-filter-btn" data-filter="feature">
                      <i className="fas fa-sparkles" style={{ color: '#a855f7' }}></i> Features
                    </button>
                    <button className="news-filter-btn" data-filter="fix">
                      <i className="fas fa-wrench" style={{ color: '#10b981' }}></i> Bug Fixes
                    </button>
                    <button className="news-filter-btn" data-filter="optimization">
                      <i className="fas fa-bolt" style={{ color: '#8b5cf6' }}></i> Optimizations
                    </button>
                    <button className="news-filter-btn" data-filter="tactics">
                      <i className="fas fa-robot" style={{ color: '#eab308' }}></i> AI & Tactics
                    </button>
                  </div>

                  <div className="news-search-box">
                    <i className="fas fa-search news-search-icon"></i>
                    <input type="text" id="txtNewsSearch" className="news-search-input" placeholder="Search updates..." />
                  </div>
                </div>

                {/* News Feed Cards Container */}
                <div id="newsFeedContainer" className="news-feed-list">
                  {/* Loaded dynamically from updates.json */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
