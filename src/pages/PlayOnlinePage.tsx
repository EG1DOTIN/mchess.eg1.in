import React, { useEffect } from 'react';

export const PlayOnlinePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Play Chess Online with Friends - Multiplayer Real-Time Game | Marwadi Chess';

    let p2pEngine: any = null;
    const timer = setTimeout(() => {
      // Initialize Player Name Identity
      const $ = (window as any).$;
      if (!$) return;

      const savedName = localStorage.getItem('mchess_player_name') || 'Guest Player';
      $('#lblPlayerNameDisplay').text(savedName);
      $('#txtNewPlayerName').val(savedName);

      $('#btnEditPlayerIdentity').off('click').on('click', function (this: any) {
        $(this).hide();
        $('#lblPlayerNameDisplay').hide();
        $('#pnlPlayerNameEditor').css('display', 'inline-flex');
        $('#txtNewPlayerName').focus();
      });

      $('#btnSaveNewPlayerName').off('click').on('click', function () {
        const newName = $('#txtNewPlayerName').val().trim() || 'Guest Player';
        localStorage.setItem('mchess_player_name', newName);
        $('#lblPlayerNameDisplay').text(newName).show();
        $('#btnEditPlayerIdentity').show();
        $('#pnlPlayerNameEditor').hide();

        if (p2pEngine) {
          p2pEngine.playerName = newName;
          p2pEngine.registerLobbyPresence();
        }
      });

      // Initialize MChessP2P Engine
      if ((window as any).MChessP2P) {
        p2pEngine = new (window as any).MChessP2P({
          boardContainerId: 'mchessP2pBoard',
          lobbyTableBodyId: 'onlineLobbyTableBody',
          defaultTimeMinutes: 5,
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (p2pEngine) {
        if (p2pEngine.clockInterval) clearInterval(p2pEngine.clockInterval);
        if (p2pEngine.heartbeatInterval) clearInterval(p2pEngine.heartbeatInterval);
        if (p2pEngine.peer) {
          try {
            p2pEngine.peer.destroy();
          } catch (e) {}
        }
      }
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1200px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-12">
              <div style={{ marginBottom: '16px' }}>
                <h1 id="appSoft" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-chess" style={{ color: '#3b82f6' }}></i> Play Online Chess Arena
                </h1>
              </div>

              {/* Top Player Identity & Status Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Player Identity:</span>
                  <strong id="lblPlayerNameDisplay" style={{ color: '#f8fafc', fontSize: '14px' }}>
                    Guest Player
                  </strong>
                  <button id="btnEditPlayerIdentity" style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '12px', padding: '2px 6px' }}>
                    <i className="fas fa-edit"></i> Edit
                  </button>

                  {/* Inline Name Editor */}
                  <div id="pnlPlayerNameEditor" style={{ display: 'none', gap: '6px', alignItems: 'center' }}>
                    <input type="text" id="txtNewPlayerName" maxLength={24} className="setting-input" style={{ padding: '4px 8px', fontSize: '12px', width: '130px' }} />
                    <button id="btnSaveNewPlayerName" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                      Save
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', fontFamily: 'monospace' }}>
                    ID: <span id="myPeerCodeDisplay" style={{ color: '#94a3b8' }}>Connecting...</span>
                  </span>
                  <a
                    href="mygames.html"
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(56,189,248,0.4)',
                      color: '#38bdf8',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fas fa-history"></i> My Played Games Archive
                  </a>
                </div>
              </div>

              {/* VIEW 1: LOBBY & CHALLENGES (Visible when not in game) */}
              <div id="secLobbyView" style={{ display: 'block' }}>
                {/* Card 1: Online Players Live Lobby */}
                <div className="lobby-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <h2 style={{ color: '#f8fafc', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-users" style={{ color: '#22c55e' }}></i> Online Players in Lobby
                      </h2>
                      <div id="lobbyPresenceStatusBadge" style={{ marginTop: '4px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                          <i className="fas fa-eye" style={{ fontSize: '9px' }}></i> Viewer Mode (Invisible to Challenges)
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button id="btnToggleLobbyOnline" style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.2)', padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                        <i className="fas fa-toggle-off"></i> Join Live Lobby (Go Online)
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Time:</span>
                        <select id="selLobbyPreferredTime" className="setting-input" style={{ padding: '5px 8px', fontSize: '12px' }} defaultValue="5">
                          <option value="3">⚡ 3 Min (Blitz)</option>
                          <option value="5">⚡ 5 Min (Blitz)</option>
                          <option value="10">♟️ 10 Min (Rapid)</option>
                          <option value="15">♟️ 15 Min (Rapid)</option>
                          <option value="30">📜 30 Min (Classical)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="lobby-table">
                      <thead>
                        <tr>
                          <th style={{ width: '38%' }}>Player Identity</th>
                          <th style={{ width: '22%' }}>Preferred Time</th>
                          <th style={{ width: '20%' }}>Status</th>
                          <th style={{ width: '20%' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody id="onlineLobbyTableBody">
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '25px' }}>
                            <i className="fas fa-spinner fa-spin" style={{ color: '#38bdf8' }}></i> Connecting to online lobby...
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2-Column Grid: Invite via Link & Local Pass/Play */}
                <div className="lobby-grid-row">
                  {/* Card 2: Invite a Friend via Link */}
                  <div className="lobby-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ color: '#f8fafc', fontSize: '17px', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-link" style={{ color: '#38bdf8' }}></i> Direct Invite Link
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0' }}>
                        Send a 1-click invitation link to a friend on WhatsApp, Discord, or Email.
                      </p>
                    </div>
                    <div>
                      <div className="lobby-input-row" style={{ marginBottom: '12px' }}>
                        <select id="selInviteLinkTime" className="setting-input" style={{ flex: 1 }} defaultValue="5">
                          <option value="3">⚡ 3 Min Blitz</option>
                          <option value="5">⚡ 5 Min Blitz</option>
                          <option value="10">♟️ 10 Min Rapid</option>
                          <option value="30">📜 30 Min Classical</option>
                        </select>
                        <button id="btnCreateInviteLink" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Generate Link
                        </button>
                      </div>
                      <div id="pnlInviteLinkOutput" style={{ display: 'none', background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', padding: '12px' }}>
                        <div className="lobby-input-row" style={{ marginBottom: '6px' }}>
                          <input type="text" id="txtGeneratedInviteUrl" readOnly className="setting-input" style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }} />
                          <button id="btnCopyInviteUrl" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Copy
                          </button>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>When your friend opens this URL, you will be connected directly!</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Local Pass & Play (Same Screen) */}
                  <div className="lobby-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ color: '#f8fafc', fontSize: '17px', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-desktop" style={{ color: '#eab308' }}></i> Local Pass & Play
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0' }}>
                        Two players on the same device/screen sharing clocks and the custom board.
                      </p>
                    </div>
                    <div>
                      <div className="lobby-input-row">
                        <select id="selPassAndPlayTime" className="setting-input" style={{ flex: 1 }} defaultValue="5">
                          <option value="0">Unlimited Time</option>
                          <option value="3">⚡ 3 Min Blitz</option>
                          <option value="5">⚡ 5 Min Blitz</option>
                          <option value="10">♟️ 10 Min Rapid</option>
                        </select>
                        <button id="btnStartPassAndPlay" style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          <i className="fas fa-play"></i> Start Local Match
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Affiliated Clubs */}
                <div className="lobby-card" id="club" style={{ padding: '16px 20px', marginTop: '16px' }}>
                  <div className="club-bar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fas fa-crown" style={{ color: '#fbbf24', fontSize: '15px' }}></i>
                      <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Affiliated Club Hubs:</span>
                    </div>
                    <div className="club-links-container">
                      <a href="https://lichess.org/team/marwadi-chess-club" target="_blank" rel="noopener noreferrer" className="club-chip-btn">
                        <i className="fas fa-chess-knight" style={{ color: '#38bdf8' }}></i> Marwadi Chess on Lichess <i className="fas fa-external-link-alt" style={{ fontSize: '10px', color: '#64748b' }}></i>
                      </a>
                      <a href='https://play.chessbase.com?room=Marwadi Chess Club&roomtext="Welcome to everyone"&pic=https://mchess.eg1.in/img/marwadichesslogo.webp' target="_blank" rel="noopener noreferrer" className="club-chip-btn">
                        <i className="fas fa-chess-king" style={{ color: '#fbbf24' }}></i> ChessBase: Marwadi Chess Club <i className="fas fa-external-link-alt" style={{ fontSize: '10px', color: '#64748b' }}></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIEW 2: LIVE MATCH ARENA (Visible during active match) */}
              <div id="secMatchArenaView" style={{ display: 'none' }}>
                <div className="mchess-board-shell" style={{ maxWidth: '1050px', margin: '0 auto' }}>
                  {/* Header / Player Clocks Card */}
                  <div className="game-meta-card" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div className="player-box">
                        <span className="player-badge white"></span>
                        <span id="p2pWhitePlayerName" className="player-name">White</span>
                        <span id="p2pWhiteClock" className="tech-pill" style={{ marginLeft: '8px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', background: '#0f172a', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>
                          05:00
                        </span>
                      </div>

                      <div>
                        <span id="p2pMatchBadge" className="tech-pill" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)', fontSize: '13px' }}>
                          Match Active
                        </span>
                      </div>

                      <div className="player-box">
                        <span id="p2pBlackClock" className="tech-pill" style={{ marginRight: '8px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', background: '#0f172a', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.4)' }}>
                          05:00
                        </span>
                        <span className="player-badge black"></span>
                        <span id="p2pBlackPlayerName" className="player-name">Black</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Message Banner */}
                  <div id="p2pStatusBanner" style={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', padding: '10px 16px', color: '#f8fafc', fontSize: '14px', marginBottom: '16px' }}>
                    Match in progress...
                  </div>

                  {/* Main Board & Moves Grid */}
                  <div className="board-layout">
                    <div className="board-column">
                      <div className="board-wrapper">
                        <div id="mchessP2pBoard" className="board-container"></div>
                      </div>
                      <div className="controls-bar" style={{ marginTop: '12px' }}>
                        <button id="btnP2pResign" className="btn-action-ctrl" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }} title="Resign Match">
                          <i className="fas fa-flag"></i> Resign
                        </button>
                        <button id="btnP2pDraw" className="btn-action-ctrl" title="Offer Mutual Draw">
                          <i className="fas fa-handshake"></i> Offer Draw
                        </button>
                        <button id="btnP2pFlip" className="btn-action-ctrl" title="Flip Board Orientation">
                          <i className="fas fa-sync-alt"></i> Flip
                        </button>
                        <button id="btnP2pTheme" className="btn-action-ctrl btn-board-theme" title="Board Theme">
                          <i className="fas fa-palette"></i> Theme
                        </button>
                        <button id="btnP2pLeaveMatch" className="btn-action-ctrl" title="Leave & Return to Lobby">
                          <i className="fas fa-door-open"></i> Leave Match
                        </button>
                      </div>
                    </div>

                    <div className="info-column">
                      <div className="moves-panel" style={{ height: '100%', minHeight: '380px' }}>
                        <div className="moves-panel-header">
                          <span><i className="fas fa-list-ol"></i> Live Match Notation</span>
                          <span id="p2pMoveCount" style={{ fontWeight: 'normal', fontSize: '12px', color: '#64748b' }}>0 moves</span>
                        </div>
                        <div id="p2pMovesList" className="moves-list"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: INCOMING CHALLENGE */}
      <div id="modalIncomingChallenge" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-card">
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px auto', border: '1px solid rgba(34,197,94,0.4)' }}>
            <i className="fas fa-chess-knight"></i>
          </div>
          <h3 style={{ color: '#f8fafc', fontSize: '20px', margin: '0 0 6px 0' }}>Incoming Challenge!</h3>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 4px 0' }}>
            <strong id="lblIncomingChallengerName" style={{ color: '#38bdf8' }}>Opponent</strong> has challenged you to a match!
          </p>
          <p id="lblIncomingTimeDetail" style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace', margin: '0 0 20px 0' }}>
            5 Minutes Blitz
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button id="btnAcceptIncomingChallenge" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
              <i className="fas fa-check"></i> Accept & Play
            </button>
            <button id="btnRejectIncomingChallenge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
              <i className="fas fa-times"></i> Decline
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 2: OUTGOING CHALLENGE WAITING */}
      <div id="modalOutgoingChallenge" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-card">
          <div style={{ fontSize: '32px', color: '#38bdf8', marginBottom: '14px' }}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <h3 style={{ color: '#f8fafc', fontSize: '18px', margin: '0 0 6px 0' }}>Sending Match Challenge...</h3>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 20px 0' }}>
            Waiting for <strong id="lblOutgoingTargetName" style={{ color: '#38bdf8' }}>Opponent</strong> to accept the challenge...
          </p>
          <button id="btnCancelOutgoingChallenge" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            <i className="fas fa-times"></i> Cancel Request
          </button>
        </div>
      </div>

      {/* MODAL 3: GAME OVER DIALOG */}
      <div id="modalP2pGameOver" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-card">
          <div style={{ fontSize: '32px', color: '#eab308', marginBottom: '10px' }}>
            <i className="fas fa-trophy"></i>
          </div>
          <h2 id="lblGameOverResult" style={{ color: '#f8fafc', fontSize: '24px', margin: '0 0 6px 0' }}>Game Over</h2>
          <p id="lblGameOverMessage" style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px 0' }}>Match completed.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button id="btnGameOverReturnLobby" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              <i className="fas fa-arrow-left"></i> Return to Lobby
            </button>
            <a href="mygames.html" style={{ background: '#16a34a', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-history"></i> View in My Games
            </a>
          </div>
        </div>
      </div>

      {/* MODAL 4: INCOMING DRAW OFFER */}
      <div id="modalIncomingDrawOffer" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-card">
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px auto', border: '1px solid rgba(56,189,248,0.4)' }}>
            <i className="fas fa-handshake"></i>
          </div>
          <h3 style={{ color: '#f8fafc', fontSize: '20px', margin: '0 0 6px 0' }}>Draw Offered</h3>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 20px 0' }}>
            <strong id="lblIncomingDrawPlayerName" style={{ color: '#38bdf8' }}>Opponent</strong> has offered a mutual draw.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button id="btnAcceptDrawOffer" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
              <i className="fas fa-check"></i> Accept Draw
            </button>
            <button id="btnDeclineDrawOffer" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
              <i className="fas fa-times"></i> Decline
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 5: CONFIRM RESIGN */}
      <div id="modalConfirmResign" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-card">
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px auto', border: '1px solid rgba(239,68,68,0.4)' }}>
            <i className="fas fa-flag"></i>
          </div>
          <h3 style={{ color: '#f8fafc', fontSize: '20px', margin: '0 0 6px 0' }}>Resign Match?</h3>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 20px 0' }}>
            Are you sure you want to resign this game? This will count as a loss.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button id="btnConfirmResignYes" style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
              <i className="fas fa-flag"></i> Yes, Resign
            </button>
            <button id="btnConfirmResignNo" style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayOnlinePage;
