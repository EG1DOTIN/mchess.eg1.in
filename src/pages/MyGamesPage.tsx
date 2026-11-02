import React, { useEffect } from 'react';

export const MyGamesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'My Played Games Archive & Review | Marwadi Chess';

    const timer = setTimeout(() => {
      if ((window as any).initMyGames) {
        (window as any).initMyGames();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1200px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-12">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-history" style={{ color: '#38bdf8' }}></i> My Played Games Archive
                  </h1>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
                    Local match records from Play vs Computer and Online Multiplayer. Review moves, analyze blunders, and export PGNs.
                  </p>
                </div>
                <div>
                  <a
                    href="playonline.html"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    }}
                  >
                    <i className="fas fa-users"></i> Play Online Arena
                  </a>
                </div>
              </div>

              {/* Player Performance Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-chess-board" style={{ color: '#38bdf8', fontSize: '18px' }}></i>
                  <div className="stat-value" id="statTotalGames">0</div>
                  <div className="stat-label">Total Matches</div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-trophy" style={{ color: '#22c55e', fontSize: '18px' }}></i>
                  <div className="stat-value" id="statWins" style={{ color: '#4ade80' }}>0</div>
                  <div className="stat-label">Victories</div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-times-circle" style={{ color: '#ef4444', fontSize: '18px' }}></i>
                  <div className="stat-value" id="statLosses" style={{ color: '#f87171' }}>0</div>
                  <div className="stat-label">Defeats</div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-handshake" style={{ color: '#94a3b8', fontSize: '18px' }}></i>
                  <div className="stat-value" id="statDraws">0</div>
                  <div className="stat-label">Draws</div>
                </div>
                <div className="stat-card">
                  <i className="fas fa-percentage" style={{ color: '#eab308', fontSize: '18px' }}></i>
                  <div className="stat-value" id="statWinRate" style={{ color: '#facc15' }}>0%</div>
                  <div className="stat-label">Win Rate</div>
                </div>
              </div>

              {/* Move Review Board Container (Hidden until user clicks Review) */}
              <div id="reviewBoardContainer" style={{ display: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ color: '#38bdf8', margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-chess-queen"></i> <span id="reviewGameTitle">Game Move Review</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button id="btnDownloadCurrentPgn" className="btn-action" style={{ background: '#16a34a', color: '#fff', padding: '6px 12px' }}>
                      <i className="fas fa-download"></i> Download PGN
                    </button>
                    <button id="btnCloseReview" className="btn-action" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '6px 12px' }}>
                      <i className="fas fa-times"></i> Close Review
                    </button>
                  </div>
                </div>
                <div id="mchessReviewBoardSlot"></div>
              </div>

              {/* Filter & Search Controls Bar */}
              <div className="filter-controls-bar">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ color: 'var(--mg-text-muted, #94a3b8)', fontSize: '13px', fontWeight: 600, marginRight: '4px' }}>Filter:</span>
                  <button className="filter-btn active" data-filter="all">All Games</button>
                  <button className="filter-btn" data-filter="win">Victories</button>
                  <button className="filter-btn" data-filter="loss">Defeats</button>
                  <button className="filter-btn" data-filter="draw">Draws</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="text" id="txtSearchGames" className="search-games-input" placeholder="Search opponent, date..." />
                    <i className="fas fa-search" style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b', fontSize: '12px' }}></i>
                  </div>
                  <button id="btnExportAllPgn" className="btn-action" style={{ background: '#2563eb', color: '#fff', padding: '7px 12px' }}>
                    <i className="fas fa-file-export"></i> Export All PGN
                  </button>
                  <button id="btnClearHistory" className="btn-action" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '7px 12px' }}>
                    <i className="fas fa-trash"></i> Clear All
                  </button>
                </div>
              </div>

              {/* Saved Games Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>Date & Time</th>
                      <th style={{ width: '28%' }}>Matchup</th>
                      <th style={{ width: '14%' }}>Mode / Control</th>
                      <th style={{ width: '14%' }}>Result</th>
                      <th style={{ width: '10%' }}>Moves</th>
                      <th style={{ width: '16%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="savedGamesListBody">
                    {/* Dynamically injected via JavaScript */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGamesPage;
