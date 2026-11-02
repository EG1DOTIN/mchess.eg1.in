import React, { useEffect } from 'react';

export const ChessRulesPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Learn Basic Chess Rules & Piece Movements | Marwadi Chess';

    const timer = setTimeout(() => {
      if ((window as any).initChessRules) {
        (window as any).initChessRules();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="rules-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
          {/* 1. HERO SECTION */}
          <section className="rules-hero" id="hero">
            <div className="rules-hero-badge">
              <i className="fas fa-chalkboard-teacher"></i> Marwadi Chess Interactive Tutor
            </div>
            <h1 className="rules-hero-title">
              Standard Chess <span className="rules-hero-title-highlight">Rules &amp; Fundamentals</span>
            </h1>
            <p className="rules-hero-subtitle">
              The definitive beginner-to-intermediate guide on board setup, piece movements, special moves (Castling &amp; En Passant), checkmate mechanics, and competitive rules.
            </p>
            <div className="rules-stats-row">
              <div className="rules-stat-pill"><i className="fas fa-chess-board"></i> 64 Squares</div>
              <div className="rules-stat-pill"><i className="fas fa-chess"></i> 6 Unique Pieces</div>
              <div className="rules-stat-pill"><i className="fas fa-bolt"></i> 3 Special Rules</div>
              <div className="rules-stat-pill"><i className="fas fa-crown"></i> 1 Goal: Checkmate</div>
            </div>
          </section>

          {/* MOBILE QUICK-NAV BAR */}
          <nav className="rules-mobile-nav" aria-label="Quick Table of Contents">
            <div className="rules-mobile-nav-title"><i className="fas fa-compass"></i> Jump to section:</div>
            <div className="rules-mobile-nav-pills">
              <a href="#board-setup" className="rules-mobile-nav-pill active"><i className="fas fa-chess-board"></i> 1. Setup</a>
              <a href="#piece-moves" className="rules-mobile-nav-pill"><i className="fas fa-chess"></i> 2. Pieces</a>
              <a href="#special-moves" className="rules-mobile-nav-pill"><i className="fas fa-bolt"></i> 3. Specials</a>
              <a href="#check-checkmate" className="rules-mobile-nav-pill"><i className="fas fa-skull"></i> 4. Checkmate</a>
              <a href="#draws" className="rules-mobile-nav-pill"><i className="fas fa-balance-scale"></i> 5. Draws</a>
              <a href="#quiz" className="rules-mobile-nav-pill"><i className="fas fa-question-circle"></i> 6. Quiz</a>
              <a href="#practice-ctas" className="rules-mobile-nav-pill"><i className="fas fa-rocket"></i> 7. Practice</a>
            </div>
          </nav>

          {/* TWO-COLUMN LAYOUT */}
          <div className="rules-layout">
            {/* MAIN CONTENT COLUMN */}
            <main className="rules-main">
              {/* SECTION 1: THE CHESSBOARD & SETUP */}
              <section className="rules-card rules-section-anchor" id="board-setup">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-chess-board"></i></div>
                  <div>
                    <h2 className="rules-section-title">1. The Chessboard Anatomy &amp; Initial Setup</h2>
                  </div>
                </div>
                <p className="rules-text">
                  Chess is played on an 8&times;8 grid containing <strong>64 alternating light and dark squares</strong>.
                  Understanding the grid coordinates and two universal setup rules is essential before making your first move:
                </p>

                <div className="rules-setup-grid">
                  <div className="rules-golden-rule-box">
                    <h3 className="rules-golden-rule-title"><i className="fas fa-star"></i> Rule 1: "White on Right"</h3>
                    <p className="rules-golden-rule-desc">
                      Before setting up pieces, ensure the square in the bottom-right corner for both players (<strong>h1</strong> for White, <strong>a8</strong> for Black) is a <strong>Light (white) square</strong>.
                    </p>
                  </div>
                  <div className="rules-golden-rule-box">
                    <h3 className="rules-golden-rule-title"><i className="fas fa-female"></i> Rule 2: "Queen on Her Own Color"</h3>
                    <p className="rules-golden-rule-desc">
                      The White Queen always starts on a <strong>white square (d1)</strong>. The Black Queen always starts on a <strong>dark square (d8)</strong>. The King stands right beside her (e1 / e8).
                    </p>
                  </div>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '18px 0 8px 0', color: 'var(--rules-text-heading, #f8fafc)' }}>
                  Board Geography: Ranks, Files &amp; Diagonals
                </h3>
                <ul className="rules-checklist">
                  <li><i className="fas fa-arrows-alt-h"></i> <strong>Ranks (1 to 8):</strong> Horizontal rows across the board. White pieces begin on ranks 1 &amp; 2; Black pieces on ranks 7 &amp; 8.</li>
                  <li><i className="fas fa-arrows-alt-v"></i> <strong>Files (a to h):</strong> Vertical columns running between the two players.</li>
                  <li><i className="fas fa-slash"></i> <strong>Diagonals:</strong> Connected diagonal paths of identical color squares.</li>
                </ul>

                {/* Initial Game Setup Demonstration */}
                <div className="rules-special-card" style={{ marginTop: '24px', marginBottom: 0 }}>
                  <h3 className="rules-special-card-title">
                    <i className="fas fa-chess-board"></i> Official Initial Game Setup (32 Pieces)
                  </h3>
                  <p className="rules-text">
                    At the start of every chess game, all 32 pieces are arranged symmetrically on the first two and last two ranks:
                  </p>

                  <div className="rules-special-flex">
                    <div className="rules-special-board-wrap">
                      <div id="initialSetupBoard" className="board-container"></div>
                      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--rules-text-muted, #94a3b8)', marginTop: '8px' }}>
                        <i className="fas fa-flag"></i> White starts on ranks 1 &amp; 2 &bull; Black starts on ranks 7 &amp; 8
                      </div>
                    </div>
                    <div className="rules-special-info">
                      <strong style={{ fontSize: '13.5px', color: 'var(--rules-text-heading, #f8fafc)' }}>Starting Roster Breakdown:</strong>
                      <ul className="rules-checklist">
                        <li><i className="fas fa-shield-alt"></i> <strong>Back Ranks (Ranks 1 &amp; 8):</strong> Rooks on corners (a &amp; h), Knights on b &amp; g, Bishops on c &amp; f, Queen on d (her color), King on e.</li>
                        <li><i className="fas fa-chess-pawn"></i> <strong>Front Ranks (Ranks 2 &amp; 7):</strong> A protective wall of 8 Pawns guarding the officers.</li>
                        <li><i className="fas fa-play"></i> <strong>First Move:</strong> <strong>White always moves first</strong>, choosing either a pawn move (1 or 2 squares) or a knight leap.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: PIECE MOVEMENTS (INTERACTIVE EXPLORER) */}
              <section className="rules-card rules-section-anchor" id="piece-moves">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-chess"></i></div>
                  <div>
                    <h2 className="rules-section-title">2. How Each Chess Piece Moves (Interactive Explorer)</h2>
                  </div>
                </div>
                <p className="rules-text">
                  Select any piece below to view its legal movement paths highlighted on the interactive demonstration board. You can even pick up and move the piece!
                </p>

                {/* Interactive Explorer Widget */}
                <div className="rules-explorer-container">
                  <div className="rules-piece-tabs" role="tablist">
                    <button className="rules-piece-tab active" data-piece="pawn">
                      <i className="fas fa-chess-pawn"></i> Pawn (1 pt)
                    </button>
                    <button className="rules-piece-tab" data-piece="knight">
                      <i className="fas fa-chess-knight"></i> Knight (3 pts)
                    </button>
                    <button className="rules-piece-tab" data-piece="bishop">
                      <i className="fas fa-chess-bishop"></i> Bishop (3 pts)
                    </button>
                    <button className="rules-piece-tab" data-piece="rook">
                      <i className="fas fa-chess-rook"></i> Rook (5 pts)
                    </button>
                    <button className="rules-piece-tab" data-piece="queen">
                      <i className="fas fa-chess-queen"></i> Queen (9 pts)
                    </button>
                    <button className="rules-piece-tab" data-piece="king">
                      <i className="fas fa-chess-king"></i> King (&infin;)
                    </button>
                  </div>

                  <div className="rules-explorer-flex">
                    <div className="rules-explorer-board-box">
                      <div id="explorerBoard" className="board-container"></div>
                      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--rules-text-muted, #94a3b8)', marginTop: '8px' }}>
                        <i className="fas fa-info-circle"></i> Green dots indicate legal movement squares
                      </div>
                    </div>
                    <div className="rules-explorer-info">
                      <div className="rules-explorer-piece-header">
                        <h3 id="explorerPieceName" className="rules-explorer-piece-name">The Pawn</h3>
                        <span id="explorerPiecePoints" className="rules-explorer-piece-points">1 Point</span>
                      </div>
                      <p id="explorerPieceDesc" className="rules-explorer-summary">
                        Pawns move 1 square straight forward. On their very first move, they have the option to advance 2 squares. Unlike other pieces, pawns capture 1 square diagonally ahead.
                      </p>
                      <ul id="explorerTipsList" className="rules-explorer-tips-list">
                        <li><i className="fas fa-check-circle"></i> <span>Advances straight, captures diagonally.</span></li>
                        <li><i className="fas fa-check-circle"></i> <span>Can move 2 squares forward only from its starting rank.</span></li>
                        <li><i className="fas fa-check-circle"></i> <span>Transforms into a Queen, Rook, Bishop, or Knight upon reaching the 8th rank (Promotion).</span></li>
                        <li><i className="fas fa-check-circle"></i> <span>Can execute the special diagonal "En Passant" capture against adjacent pawns.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Piece Cards Summary */}
                <div className="rules-piece-cards-grid">
                  {/* Pawn */}
                  <div className="rules-piece-card">
                    <div>
                      <div className="rules-piece-card-top">
                        <div className="rules-piece-symbol-badge">&#9823;</div>
                        <div>
                          <h4 className="rules-piece-card-title">Pawn</h4>
                          <span className="rules-piece-card-pts">Value: 1 Point</span>
                        </div>
                      </div>
                      <p className="rules-piece-card-desc">Moves forward 1 square (or 2 on move 1). Captures diagonally forward. The soul of chess strategy.</p>
                    </div>
                    <div className="rules-piece-tags">
                      <span className="rules-tag">Straight</span>
                      <span className="rules-tag">Promotion</span>
                      <span className="rules-tag">En Passant</span>
                    </div>
                  </div>

                  {/* Knight */}
                  <div className="rules-piece-card">
                    <div>
                      <div className="rules-piece-card-top">
                        <div className="rules-piece-symbol-badge">&#9822;</div>
                        <div>
                          <h4 className="rules-piece-card-title">Knight</h4>
                          <span className="rules-piece-card-pts">Value: 3 Points</span>
                        </div>
                      </div>
                      <p className="rules-piece-card-desc">Moves in an "L-shape" (2 squares then 1 perpendicular). The only piece permitted to leap over obstacles.</p>
                    </div>
                    <div className="rules-piece-tags">
                      <span className="rules-tag">L-Shape</span>
                      <span className="rules-tag">Leaping</span>
                      <span className="rules-tag">Forks</span>
                    </div>
                  </div>

                  {/* Bishop */}
                  <div className="rules-piece-card">
                    <div>
                      <div className="rules-piece-card-top">
                        <div className="rules-piece-symbol-badge">&#9821;</div>
                        <div>
                          <h4 className="rules-piece-card-title">Bishop</h4>
                          <span className="rules-piece-card-pts">Value: 3 Points</span>
                        </div>
                      </div>
                      <p className="rules-piece-card-desc">Glides diagonally any distance along squares of its starting color. Powerful on open diagonals.</p>
                    </div>
                    <div className="rules-piece-tags">
                      <span className="rules-tag">Diagonal</span>
                      <span className="rules-tag">Color Bound</span>
                      <span className="rules-tag">Sniper</span>
                    </div>
                  </div>

                  {/* Rook */}
                  <div className="rules-piece-card">
                    <div>
                      <div className="rules-piece-card-top">
                        <div className="rules-piece-symbol-badge">&#9820;</div>
                        <div>
                          <h4 className="rules-piece-card-title">Rook</h4>
                          <span className="rules-piece-card-pts">Value: 5 Points</span>
                        </div>
                      </div>
                      <p className="rules-piece-card-desc">Moves horizontally or vertically across open ranks and files. Powerful heavy piece, vital for castling and endgames.</p>
                    </div>
                    <div className="rules-piece-tags">
                      <span className="rules-tag">Ranks &amp; Files</span>
                      <span className="rules-tag">Castling</span>
                      <span className="rules-tag">Heavy Piece</span>
                    </div>
                  </div>

                  {/* Queen */}
                  <div className="rules-piece-card">
                    <div>
                      <div className="rules-piece-card-top">
                        <div className="rules-piece-symbol-badge">&#9819;</div>
                        <div>
                          <h4 className="rules-piece-card-title">Queen</h4>
                          <span className="rules-piece-card-pts">Value: 9 Points</span>
                        </div>
                      </div>
                      <p className="rules-piece-card-desc">Combines the total powers of Rook and Bishop. Attacks across any straight direction. Your ultimate offensive asset.</p>
                    </div>
                    <div className="rules-piece-tags">
                      <span className="rules-tag">Universal Move</span>
                      <span className="rules-tag">9 Points</span>
                      <span className="rules-tag">Top Attacker</span>
                    </div>
                  </div>

                  {/* King */}
                  <div className="rules-piece-card">
                    <div>
                      <div className="rules-piece-card-top">
                        <div className="rules-piece-symbol-badge">&#9818;</div>
                        <div>
                          <h4 className="rules-piece-card-title">King</h4>
                          <span className="rules-piece-card-pts">Value: &infin; (The Objective)</span>
                        </div>
                      </div>
                      <p className="rules-piece-card-desc">Moves 1 square in any direction. Can never move into check. When trapped with no escape, it is Checkmate.</p>
                    </div>
                    <div className="rules-piece-tags">
                      <span className="rules-tag">1 Square</span>
                      <span className="rules-tag">Royal Piece</span>
                      <span className="rules-tag">Must Protect</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: SPECIAL RULES */}
              <section className="rules-card rules-section-anchor" id="special-moves">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-bolt"></i></div>
                  <div>
                    <h2 className="rules-section-title">3. The Three Special Moves in Chess</h2>
                  </div>
                </div>
                <p className="rules-text">
                  Chess features three unique moves designed to add tactical depth and strategic dynamism to the game:
                </p>

                {/* 1. Castling */}
                <div className="rules-special-card">
                  <h3 className="rules-special-card-title">
                    <i className="fas fa-shield-alt"></i> Special Move 1: Castling (0-0 &amp; 0-0-0)
                  </h3>
                  <p className="rules-text">
                    Castling is the only move in chess where <strong>two pieces move on the same turn</strong>. The King moves two squares toward a Rook, and that Rook hops over to the square the King just crossed. It safeguards the King and brings the Rook into the game.
                  </p>

                  <div className="rules-special-flex">
                    <div className="rules-special-board-wrap">
                      <div id="castleDemoBoard" className="board-container"></div>
                      <div className="rules-special-controls">
                        <button id="btnCastleKingside" className="rules-btn-action"><i className="fas fa-arrow-right"></i> Castle Kingside (0-0)</button>
                        <button id="btnCastleQueenside" className="rules-btn-action"><i className="fas fa-arrow-left"></i> Castle Queenside (0-0-0)</button>
                        <button id="btnResetCastle" className="rules-btn-secondary"><i className="fas fa-undo"></i> Reset</button>
                      </div>
                    </div>
                    <div className="rules-special-info">
                      <div id="castleStatusText" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rules-primary, #38bdf8)', marginBottom: '10px' }}>
                        Click a button on the left to see the King &amp; Rook move simultaneously!
                      </div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--rules-text-heading, #f8fafc)' }}>4 Mandatory Rules for Castling:</strong>
                      <ul className="rules-checklist">
                        <li><i className="fas fa-check"></i> It must be the first move ever for both the King and the chosen Rook.</li>
                        <li><i className="fas fa-check"></i> There must be zero intervening pieces between the King and Rook.</li>
                        <li><i className="fas fa-check"></i> The King cannot currently be in Check.</li>
                        <li><i className="fas fa-check"></i> The King cannot pass through or land on any square attacked by an enemy piece.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 2. En Passant */}
                <div className="rules-special-card">
                  <h3 className="rules-special-card-title">
                    <i className="fas fa-running"></i> Special Move 2: En Passant ("In Passing")
                  </h3>
                  <p className="rules-text">
                    When an opponent advances a pawn <strong>two squares forward</strong> from its starting rank and lands directly adjacent to your pawn, you may capture it diagonally on the very next move as if it had only moved one square!
                  </p>

                  <div className="rules-special-flex">
                    <div className="rules-special-board-wrap">
                      <div id="enPassantDemoBoard" className="board-container"></div>
                      <div className="rules-special-controls">
                        <button id="btnEpStep1" className="rules-btn-action"><i className="fas fa-play"></i> Step 1: Black plays d5</button>
                        <button id="btnEpStep2" className="rules-btn-action" disabled style={{ opacity: 0.6 }}><i className="fas fa-cut"></i> Step 2: White captures En Passant</button>
                        <button id="btnResetEp" className="rules-btn-secondary"><i className="fas fa-undo"></i> Reset</button>
                      </div>
                    </div>
                    <div className="rules-special-info">
                      <div id="epStatusText" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rules-primary, #38bdf8)', marginBottom: '10px' }}>
                        Click "Step 1" to start the En Passant demonstration.
                      </div>
                      <ul className="rules-checklist">
                        <li><i className="fas fa-info-circle"></i> <strong>Strict Time Limit:</strong> En Passant must be claimed on the <em>very next turn immediately after the 2-square pawn move</em>, or the right is lost forever.</li>
                        <li><i className="fas fa-info-circle"></i> The captured pawn is removed from the board, and the capturing pawn lands on the square skipped over.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 3. Pawn Promotion */}
                <div className="rules-special-card" style={{ marginBottom: 0 }}>
                  <h3 className="rules-special-card-title">
                    <i className="fas fa-crown"></i> Special Move 3: Pawn Promotion
                  </h3>
                  <p className="rules-text">
                    When a humble pawn battles its way all the way to the 8th rank, it immediately transforms into any piece of the player's choice: <strong>Queen, Rook, Bishop, or Knight</strong>.
                  </p>
                  <ul className="rules-checklist">
                    <li><i className="fas fa-star"></i> <strong>No Piece Limit:</strong> You can have multiple Queens on the board!</li>
                    <li><i className="fas fa-star"></i> Over 95% of promotions choose a Queen ("Queening"), though occasionally a Knight is chosen for immediate tactics ("Underpromotion").</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 4: CHECK, CHECKMATE & STALEMATE */}
              <section className="rules-card rules-section-anchor" id="check-checkmate">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-skull"></i></div>
                  <div>
                    <h2 className="rules-section-title">4. Check, Checkmate &amp; Stalemate</h2>
                  </div>
                </div>
                <p className="rules-text">
                  Understanding the exact difference between Check, Checkmate, and Stalemate is the single most important conceptual milestone in chess:
                </p>

                {/* CPR Rule Box */}
                <div className="rules-golden-rule-box" style={{ borderLeftColor: 'var(--rules-danger, #ef4444)', marginBottom: '20px' }}>
                  <h3 className="rules-golden-rule-title" style={{ color: 'var(--rules-danger, #ef4444)' }}><i className="fas fa-heartbeat"></i> The "CPR" Escape Rule for Checks</h3>
                  <p className="rules-golden-rule-desc">
                    When your King is placed in Check, you are under strict legal obligation to get out of Check immediately on that turn. Remember the <strong>C-P-R</strong> formula:
                  </p>
                  <ul className="rules-checklist" style={{ marginTop: '10px' }}>
                    <li><strong>C — Capture:</strong> Capture the attacking enemy piece with your King or another friendly piece.</li>
                    <li><strong>P — Protect (Block):</strong> Place a friendly piece directly between the checking piece and your King (cannot block Knights).</li>
                    <li><strong>R — Run:</strong> Move your King to a safe, unattacked adjacent square.</li>
                  </ul>
                </div>

                {/* Comparison Matrix Table */}
                <div className="rules-matrix-wrap">
                  <table className="rules-matrix-table">
                    <thead>
                      <tr>
                        <th>Condition</th>
                        <th>Is King in Check?</th>
                        <th>Any Legal Moves Left?</th>
                        <th>Game Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Check</strong></td>
                        <td><span className="rules-badge-pill rules-badge-check">YES</span></td>
                        <td><span className="rules-badge-pill rules-badge-check">YES</span></td>
                        <td>Game continues. Must escape immediately via CPR.</td>
                      </tr>
                      <tr>
                        <td><strong>Checkmate</strong></td>
                        <td><span className="rules-badge-pill rules-badge-mate">YES</span></td>
                        <td><span className="rules-badge-pill rules-badge-mate">NO</span></td>
                        <td><strong>Game Over!</strong> Attacking player wins the game (1 - 0).</td>
                      </tr>
                      <tr>
                        <td><strong>Stalemate</strong></td>
                        <td><span className="rules-badge-pill rules-badge-draw">NO</span></td>
                        <td><span className="rules-badge-pill rules-badge-draw">NO</span></td>
                        <td><strong>Game Over — DRAW!</strong> Split points equally (&frac12; - &frac12;).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECTION 5: WAYS A GAME CAN END & DRAWS */}
              <section className="rules-card rules-section-anchor" id="draws">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-balance-scale"></i></div>
                  <div>
                    <h2 className="rules-section-title">5. Game Endings &amp; The 5 Ways to Draw</h2>
                  </div>
                </div>
                <p className="rules-text">
                  A game of chess does not always conclude with a checkmate. It can conclude in either a decisive result or one of five recognized draw conditions:
                </p>

                <div className="rules-piece-cards-grid">
                  <div className="rules-piece-card">
                    <div>
                      <h4 className="rules-piece-card-title"><i className="fas fa-handshake" style={{ color: 'var(--rules-warning, #eab308)' }}></i> 1. Mutual Agreement</h4>
                      <p className="rules-piece-card-desc">Both players agree at any point during their turn that neither side has winning prospects.</p>
                    </div>
                  </div>
                  <div className="rules-piece-card">
                    <div>
                      <h4 className="rules-piece-card-title"><i className="fas fa-hourglass-end" style={{ color: 'var(--rules-warning, #eab308)' }}></i> 2. Stalemate</h4>
                      <p className="rules-piece-card-desc">The player whose turn it is has no legal moves and their King is not in check.</p>
                    </div>
                  </div>
                  <div className="rules-piece-card">
                    <div>
                      <h4 className="rules-piece-card-title"><i className="fas fa-redo-alt" style={{ color: 'var(--rules-warning, #eab308)' }}></i> 3. Threefold Repetition</h4>
                      <p className="rules-piece-card-desc">The exact same board position (with identical legal moves and castling rights) occurs 3 times.</p>
                    </div>
                  </div>
                  <div className="rules-piece-card">
                    <div>
                      <h4 className="rules-piece-card-title"><i className="fas fa-history" style={{ color: 'var(--rules-warning, #eab308)' }}></i> 4. 50-Move Rule</h4>
                      <p className="rules-piece-card-desc">50 consecutive moves have been made by both players with zero pawn moves and zero captures.</p>
                    </div>
                  </div>
                  <div className="rules-piece-card">
                    <div>
                      <h4 className="rules-piece-card-title"><i className="fas fa-chess-king" style={{ color: 'var(--rules-warning, #eab308)' }}></i> 5. Insufficient Material</h4>
                      <p className="rules-piece-card-desc">Neither player has enough pieces left to mathematically deliver checkmate (e.g., King vs King, King+Bishop vs King).</p>
                    </div>
                  </div>
                  <div className="rules-piece-card">
                    <div>
                      <h4 className="rules-piece-card-title"><i className="fas fa-flag-checkered" style={{ color: 'var(--rules-danger, #ef4444)' }}></i> Resignation &amp; Time</h4>
                      <p className="rules-piece-card-desc">A player may resign at any time if in a hopeless position, or lose if their game clock reaches 00:00.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 6: INTERACTIVE KNOWLEDGE CHECK QUIZ */}
              <section className="rules-card rules-section-anchor" id="quiz">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-question-circle"></i></div>
                  <div>
                    <h2 className="rules-section-title">6. Test Your Chess Knowledge (Micro-Quiz)</h2>
                  </div>
                </div>
                <p className="rules-text">
                  Test your grasp of fundamental chess rules with these 3 quick interactive questions:
                </p>

                {/* Question 1 */}
                <div className="rules-quiz-box">
                  <h3 className="rules-quiz-question">Question 1: Can a Knight leap over other pieces during its move?</h3>
                  <div className="rules-quiz-options">
                    <button className="rules-quiz-opt" data-correct="true" data-feedback="The Knight is the ONLY piece on the chessboard capable of jumping over friendly or opponent pieces!">
                      <span>A) Yes, always</span>
                    </button>
                    <button className="rules-quiz-opt" data-correct="false" data-feedback="Knights can always jump over pieces! It is their unique superpower.">
                      <span>B) No, it gets blocked like other pieces</span>
                    </button>
                    <button className="rules-quiz-opt" data-correct="false" data-feedback="Knights can jump over friendly AND enemy pieces at any time.">
                      <span>C) Only on its first move</span>
                    </button>
                  </div>
                  <div className="rules-quiz-feedback"></div>
                </div>

                {/* Question 2 */}
                <div className="rules-quiz-box">
                  <h3 className="rules-quiz-question">Question 2: If your King is NOT in check, but you have no legal moves anywhere, what is the result?</h3>
                  <div className="rules-quiz-options">
                    <button className="rules-quiz-opt" data-correct="false" data-feedback="Checkmate requires the King to be in Check. Since the King is not in check, this is a Stalemate!">
                      <span>A) Checkmate (You lose)</span>
                    </button>
                    <button className="rules-quiz-opt" data-correct="true" data-feedback="When a player has no legal moves and their King is NOT in check, it is a Stalemate — a Draw (1/2 - 1/2)!">
                      <span>B) Stalemate (The game is a Draw)</span>
                    </button>
                    <button className="rules-quiz-opt" data-correct="false" data-feedback="You cannot pass a turn in chess. If no moves are legal and not in check, it is a Draw.">
                      <span>C) You skip your turn</span>
                    </button>
                  </div>
                  <div className="rules-quiz-feedback"></div>
                </div>

                {/* Question 3 */}
                <div className="rules-quiz-box">
                  <h3 className="rules-quiz-question">Question 3: What color square does the White Queen always start on?</h3>
                  <div className="rules-quiz-options">
                    <button className="rules-quiz-opt" data-correct="true" data-feedback="Remember the universal chess rule: 'Queen on her own color' (White Queen on d1 white square, Black Queen on d8 dark square)!">
                      <span>A) White (Light) square (d1)</span>
                    </button>
                    <button className="rules-quiz-opt" data-correct="false" data-feedback="The White Queen starts on d1 (white square), matching her own color!">
                      <span>B) Dark (Black) square (e1)</span>
                    </button>
                  </div>
                  <div className="rules-quiz-feedback"></div>
                </div>
              </section>

              {/* SECTION 7: PRACTICE PATHWAYS */}
              <section className="rules-card rules-section-anchor" id="practice-ctas">
                <div className="rules-section-header">
                  <div className="rules-section-icon"><i className="fas fa-rocket"></i></div>
                  <div>
                    <h2 className="rules-section-title">7. Put Your Knowledge Into Practice!</h2>
                  </div>
                </div>
                <p className="rules-text">
                  Congratulations on mastering standard chess rules! The quickest way to cement your understanding is to play and practice:
                </p>

                <div className="rules-cta-grid">
                  <div className="rules-cta-card">
                    <div>
                      <div className="rules-cta-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#3b82f6' }}>
                        <i className="fas fa-robot"></i>
                      </div>
                      <h3 className="rules-cta-title">Play Against Computer</h3>
                      <p className="rules-cta-desc">Play against the open-source Stockfish engine at Level 1 with full move hints and takebacks.</p>
                    </div>
                    <a href="playcomp.html" className="rules-cta-btn" style={{ background: '#2563eb', color: '#ffffff' }}>
                      Play vs AI <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>

                  <div className="rules-cta-card">
                    <div>
                      <div className="rules-cta-icon" style={{ background: 'rgba(217,119,6,0.1)', color: '#f59e0b' }}>
                        <i className="fas fa-puzzle-piece"></i>
                      </div>
                      <h3 className="rules-cta-title">Solve Tactical Puzzles</h3>
                      <p className="rules-cta-desc">Sharpen your pattern recognition with curated checkmate drills and daily tactics.</p>
                    </div>
                    <a href="train.html" className="rules-cta-btn" style={{ background: '#d97706', color: '#ffffff' }}>
                      Train Tactics <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>

                  <div className="rules-cta-card">
                    <div>
                      <div className="rules-cta-icon" style={{ background: 'rgba(22,163,74,0.1)', color: '#22c55e' }}>
                        <i className="fas fa-users"></i>
                      </div>
                      <h3 className="rules-cta-title">Play Online Friends</h3>
                      <p className="rules-cta-desc">Create a room code, invite a friend, and play live timed chess with real-time digital clocks.</p>
                    </div>
                    <a href="playonline.html" className="rules-cta-btn" style={{ background: '#16a34a', color: '#ffffff' }}>
                      Online Arena <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </section>
            </main>

            {/* STICKY TABLE OF CONTENTS SIDEBAR */}
            <aside className="rules-sidebar">
              <div className="rules-toc-card">
                <div className="rules-toc-header">
                  <i className="fas fa-list-ol"></i> Table of Contents
                </div>
                <ul className="rules-toc-list">
                  <li className="rules-toc-item">
                    <a href="#board-setup" className="rules-toc-link active">
                      <i className="fas fa-chess-board" style={{ width: '18px' }}></i> 1. Board Anatomy
                    </a>
                  </li>
                  <li className="rules-toc-item">
                    <a href="#piece-moves" className="rules-toc-link">
                      <i className="fas fa-chess" style={{ width: '18px' }}></i> 2. Piece Movement
                    </a>
                  </li>
                  <li className="rules-toc-item">
                    <a href="#special-moves" className="rules-toc-link">
                      <i className="fas fa-bolt" style={{ width: '18px' }}></i> 3. Special Moves
                    </a>
                  </li>
                  <li className="rules-toc-item">
                    <a href="#check-checkmate" className="rules-toc-link">
                      <i className="fas fa-skull" style={{ width: '18px' }}></i> 4. Check &amp; Mate
                    </a>
                  </li>
                  <li className="rules-toc-item">
                    <a href="#draws" className="rules-toc-link">
                      <i className="fas fa-balance-scale" style={{ width: '18px' }}></i> 5. Draw Rules
                    </a>
                  </li>
                  <li className="rules-toc-item">
                    <a href="#quiz" className="rules-toc-link">
                      <i className="fas fa-question-circle" style={{ width: '18px' }}></i> 6. Knowledge Quiz
                    </a>
                  </li>
                  <li className="rules-toc-item">
                    <a href="#practice-ctas" className="rules-toc-link">
                      <i className="fas fa-rocket" style={{ width: '18px' }}></i> 7. Practice Now
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessRulesPage;
