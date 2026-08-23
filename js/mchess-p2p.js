/**
 * @file mchess-p2p.js
 * @description Native WebRTC Peer-to-Peer Real-Time Multiplayer Chess Engine & Live Lobby for MCHESS.
 * Features:
 * - Direct WebRTC P2P DataChannels for zero Firestore write costs during gameplay.
 * - Live Player Lobby with Option B (1 single Firestore write only on explicit user click).
 * - Mobile Touch Optimization: ResizeObserver auto-recalibration & Tap-to-Move (Click-to-Move) support.
 * - Session Persistence & Reconnection: Recovers active games on browser refresh with a 30s grace period.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    class MChessP2P {
        constructor(options) {
            this.options = Object.assign({
                boardContainerId: 'mchessP2pBoard',
                lobbyTableBodyId: 'onlineLobbyTableBody',
                defaultTimeMinutes: 5,
                pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
            }, options);

            this.playerName = localStorage.getItem('mchess_player_name') || 'Guest Player';
            this.peerId = null;
            this.peer = null;
            this.activeConnection = null;
            this.lastConnectedPeerId = null;
            this.isHost = false;
            this.mySide = 'white'; // 'white' or 'black'
            this.opponentName = 'Opponent';
            this.timeControlMinutes = this.options.defaultTimeMinutes;
            this.whiteTime = this.timeControlMinutes * 60;
            this.blackTime = this.timeControlMinutes * 60;
            this.clockInterval = null;
            this.graceTimer = null;
            this.gameActive = false;
            this.gameSaved = false;
            this.isPassAndPlay = false;
            this.isLobbyOnline = false; // Option B: Offline/Viewer by default

            // Outbound message queue for unready channels
            this.outboundQueue = [];
            // Application ACK tracking for moves
            this.pendingMoveAck = null;
            this.moveAckTimer = null;
            this.heartbeatInterval = null;

            // Tap-to-Move state
            this.selectedSquare = null;
            this.legalMoves = [];

            this.chess = new Chess();
            this.board = null;
            this.historyFen = [];
            this.currentPly = 0;

            // Audio Context for sound effects
            this.audioCtx = null;
            this.resizeObserver = null;

            // Firestore Lobby Tracker
            this.lobbyUnsubscribe = null;

            this.init();
        }

        init() {
            this.initAudio();
            this.initPeer();
            this.bindDOMEvents();
            this.initFirestoreLobby();
        }

        initAudio() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.audioCtx = new AudioContext();
                }
            } catch (e) {
                console.warn("[MChessP2P] Web Audio not available:", e);
            }
        }

        playSound(type) {
            if (!this.audioCtx) return;
            try {
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }
                const now = this.audioCtx.currentTime;

                if (type === 'checkmate') {
                    // Triumphant 4-note ascending fanfare (C5 -> E5 -> G5 -> C6)
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, i) => {
                        const osc = this.audioCtx.createOscillator();
                        const gain = this.audioCtx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, now + i * 0.08);
                        gain.gain.setValueAtTime(0.3, now + i * 0.08);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
                        osc.connect(gain);
                        gain.connect(this.audioCtx.destination);
                        osc.start(now + i * 0.08);
                        osc.stop(now + i * 0.08 + 0.35);
                    });
                    return;
                } else if (type === 'stalemate' || type === 'draw') {
                    // Neutral 2-tone harmonic chime (A4 -> F4)
                    const notes = [440, 349.23];
                    notes.forEach((freq, i) => {
                        const osc = this.audioCtx.createOscillator();
                        const gain = this.audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now + i * 0.12);
                        gain.gain.setValueAtTime(0.25, now + i * 0.12);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
                        osc.connect(gain);
                        gain.connect(this.audioCtx.destination);
                        osc.start(now + i * 0.12);
                        osc.stop(now + i * 0.12 + 0.3);
                    });
                    return;
                }

                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                if (type === 'capture') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.12);
                } else if (type === 'check') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(800, now + 0.08);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else {
                    // Regular move
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                }
            } catch (e) {
                // Ignore audio errors
            }
        }

        /**
         * Initialize WebRTC PeerJS with Session-Persistent ID
         */
        initPeer() {
            const self = this;
            // Reuse peer ID for this tab session so refresh doesn't break reconnection
            const savedSessionPeerId = sessionStorage.getItem('mchess_session_peer_id');
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const preferredId = savedSessionPeerId || ('MC-' + randomCode);

            try {
                this.peer = new Peer(preferredId, {
                    debug: 1,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun.cloudflare.com:3478' }
                        ]
                    }
                });

                this.peer.on('open', (id) => {
                    self.peerId = id;
                    sessionStorage.setItem('mchess_session_peer_id', id);
                    console.log("[MChessP2P] PeerJS initialized with ID:", id);
                    $('#myPeerCodeDisplay').text(id);

                    // Check if recovering from active game refresh
                    self.checkSessionRecovery();
                    self.checkUrlRoomParam();
                });

                this.peer.on('connection', (conn) => {
                    self.handleIncomingConnection(conn);
                });

                this.peer.on('error', (err) => {
                    console.warn("[MChessP2P] PeerJS error:", err);
                    if (err.type === 'unavailable-id') {
                        // Generate fresh ID if previous is still locked on server
                        const freshId = 'MC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                        sessionStorage.setItem('mchess_session_peer_id', freshId);
                        self.peer = new Peer(freshId, { debug: 1 });
                    }
                });

            } catch (e) {
                console.error("[MChessP2P] Failed to initialize PeerJS:", e);
            }
        }

        /**
         * Check and restore active game if user refreshed page
         */
        checkSessionRecovery() {
            try {
                const sessionRaw = sessionStorage.getItem('mchess_active_match');
                if (!sessionRaw) return;

                const session = JSON.parse(sessionRaw);
                if (!session || !session.matchActive) return;

                console.log("[MChessP2P] Active match session found, recovering game...", session);

                this.isPassAndPlay = !!session.isPassAndPlay;
                this.isHost = !!session.isHost;
                this.mySide = session.mySide || 'white';
                this.opponentName = session.opponentName || 'Opponent';
                this.lastConnectedPeerId = session.opponentPeerId || null;
                this.timeControlMinutes = session.timeControlMinutes || 5;
                this.whiteTime = typeof session.whiteTime === 'number' ? session.whiteTime : (this.timeControlMinutes * 60);
                this.blackTime = typeof session.blackTime === 'number' ? session.blackTime : (this.timeControlMinutes * 60);
                this.gameActive = true;
                this.gameSaved = false;

                // Load chess position
                this.chess = new Chess();
                if (session.fen) {
                    this.chess.load(session.fen);
                }

                // Switch UI to Arena View
                $('#secLobbyView').hide();
                $('#secMatchArenaView').fadeIn(250);

                const whiteName = (this.mySide === 'white') ? `${this.playerName} (You)` : this.opponentName;
                const blackName = (this.mySide === 'black') ? `${this.playerName} (You)` : this.opponentName;
                $('#p2pWhitePlayerName').text(whiteName);
                $('#p2pBlackPlayerName').text(blackName);
                $('#p2pMatchBadge').text('Match Resumed').css({ background: 'rgba(34,197,94,0.2)', color: '#4ade80' });

                this.updateClockDisplays();
                this.initChessboard(this.mySide);

                if (this.isPassAndPlay) {
                    this.updateStatusBanner(`<i class="fas fa-play" style="color:#22c55e;"></i> Local Match Resumed. <strong>${this.chess.turn() === 'w' ? 'White' : 'Black'} to move</strong>.`);
                    this.startClockTimer();
                } else if (this.lastConnectedPeerId) {
                    this.updateStatusBanner(`<i class="fas fa-spinner fa-spin" style="color:#38bdf8;"></i> Reconnecting to active match with <strong>${this.opponentName}</strong>...`);
                    this.reconnectToOpponent(this.lastConnectedPeerId);
                }

            } catch (e) {
                console.warn("[MChessP2P] Session recovery error:", e);
                sessionStorage.removeItem('mchess_active_match');
            }
        }

        reconnectToOpponent(opponentPeerId) {
            const self = this;
            if (!this.peer || !opponentPeerId) return;

            const conn = this.peer.connect(opponentPeerId);
            this.activeConnection = conn;

            conn.on('open', () => {
                console.log("[MChessP2P] Reconnected to opponent peer!");
                self.flushOutboundQueue();
                self.safeSend({
                    type: 'reconnect_request',
                    senderPeerId: self.peerId,
                    senderName: self.playerName,
                    fen: self.chess.fen(),
                    whiteTime: self.whiteTime,
                    blackTime: self.blackTime
                });
            });

            conn.on('data', (data) => self.handleP2PMessage(data));
            conn.on('close', () => self.onOpponentDisconnected());
            conn.on('error', (err) => console.warn("[MChessP2P] Reconnect connection error:", err));
        }

        saveActiveMatchToSession() {
            if (!this.gameActive) return;
            try {
                const data = {
                    matchActive: true,
                    isHost: this.isHost,
                    mySide: this.mySide,
                    opponentName: this.opponentName,
                    opponentPeerId: (this.activeConnection ? this.activeConnection.peer : null) || this.lastConnectedPeerId,
                    timeControlMinutes: this.timeControlMinutes,
                    whiteTime: this.whiteTime,
                    blackTime: this.blackTime,
                    fen: this.chess.fen(),
                    isPassAndPlay: this.isPassAndPlay
                };
                sessionStorage.setItem('mchess_active_match', JSON.stringify(data));
            } catch (e) {}
        }

        clearActiveMatchSession() {
            try {
                sessionStorage.removeItem('mchess_active_match');
            } catch (e) {}
        }

        /**
         * Firestore Lobby Presence (Read-only on load, writes 1 doc ONLY on explicit user click)
         */
        initFirestoreLobby() {
            if (typeof db === 'undefined' || !db) {
                console.warn("[MChessP2P] Firestore not available for live lobby. Peer link invites will function as fallback.");
                return;
            }

            const self = this;
            try {
                // Subscribe to lobby updates (reads online players)
                this.lobbyUnsubscribe = db.collection('mchess_lobby').onSnapshot((snapshot) => {
                    const players = [];
                    const now = Date.now();
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const docTime = data.updatedAt ? data.updatedAt.toMillis() : now;
                        if (now - docTime < 15 * 60 * 1000) {
                            players.push({ id: doc.id, ...data });
                        }
                    });
                    self.renderLobbyTable(players);
                }, (err) => {
                    console.warn("[MChessP2P] Lobby listener notice:", err);
                });

                // Auto-cleanup on window close if user was online in lobby
                window.addEventListener('beforeunload', () => {
                    if (self.isLobbyOnline) {
                        self.removeLobbyPresence();
                    }
                });

            } catch (e) {
                console.warn("[MChessP2P] Lobby setup error:", e);
            }
        }

        /**
         * Explicit Toggle: Join / Leave Live Lobby (Option B: Exactly 1 write on click)
         */
        toggleLobbyOnline() {
            if (!this.isLobbyOnline) {
                this.isLobbyOnline = true;
                this.registerLobbyPresence('available');
                $('#btnToggleLobbyOnline').html('<i class="fas fa-toggle-on" style="color:#4ade80; margin-right:4px;"></i> Live in Lobby (Click to Go Offline)').css({
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.4)'
                });
                $('#lobbyPresenceStatusBadge').html('<span style="color:#4ade80; font-size:12px;"><i class="fas fa-circle" style="font-size:9px;"></i> You are Live & Discoverable to Challengers</span>');
            } else {
                this.isLobbyOnline = false;
                this.removeLobbyPresence();
                $('#btnToggleLobbyOnline').html('<i class="fas fa-toggle-off" style="margin-right:4px;"></i> Join Live Lobby (Go Online)').css({
                    background: '#1e293b',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                });
                $('#lobbyPresenceStatusBadge').html('<span style="color:#94a3b8; font-size:12px;"><i class="fas fa-eye" style="font-size:9px;"></i> Viewer Mode (Invisible to Challengers)</span>');
            }
        }

        registerLobbyPresence(status) {
            if (!this.peerId || typeof db === 'undefined' || !db || !this.isLobbyOnline) return;
            const self = this;
            try {
                // Exactly 1 write to Firestore per user action
                db.collection('mchess_lobby').doc(this.peerId).set({
                    name: self.playerName,
                    peerId: self.peerId,
                    status: status || (self.gameActive ? 'in_game' : 'available'),
                    timeControl: self.timeControlMinutes + 'm',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(() => {});
            } catch (e) {}
        }

        removeLobbyPresence() {
            if (!this.peerId || typeof db === 'undefined' || !db) return;
            try {
                db.collection('mchess_lobby').doc(this.peerId).delete().catch(() => {});
            } catch (e) {}
        }

        renderLobbyTable(players) {
            const $tbody = $('#' + this.options.lobbyTableBodyId);
            $tbody.empty();

            const otherPlayers = players.filter(p => p.peerId !== this.peerId);

            if (otherPlayers.length === 0) {
                $tbody.append(`
                    <tr>
                        <td colspan="4" style="text-align:center; color:#94a3b8; padding: 28px 15px;">
                            <i class="fas fa-satellite-dish" style="font-size:22px; color:#38bdf8; margin-bottom:8px; display:block;"></i>
                            <strong>No other players in the lobby right now.</strong><br />
                            <span style="font-size:12px; color:#64748b;">Click <strong>Join Live Lobby</strong> to make yourself discoverable, or generate a <strong>Direct Invite Link</strong> below to play with a friend!</span>
                        </td>
                    </tr>
                `);
                return;
            }

            otherPlayers.forEach(p => {
                const isAvailable = p.status === 'available';
                const statusBadge = isAvailable
                    ? `<span style="background:rgba(34,197,94,0.2); color:#4ade80; border:1px solid rgba(34,197,94,0.4); padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold;"><i class="fas fa-circle" style="font-size:8px;"></i> Available</span>`
                    : `<span style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.4); padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold;"><i class="fas fa-chess"></i> In Match</span>`;

                const actionBtn = isAvailable
                    ? `<button class="btn-challenge-peer" data-peer="${p.peerId}" data-name="${p.name}" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color:#fff; border:none; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow: 0 2px 8px rgba(22,163,74,0.3);">
                        <i class="fas fa-crosshairs"></i> Challenge
                       </button>`
                    : `<button disabled style="background:#334155; color:#64748b; border:none; padding:6px 12px; border-radius:6px; font-size:12px; cursor:not-allowed;">Playing</button>`;

                const row = `
                    <tr>
                        <td style="font-weight:600; color:#f8fafc;">
                            <i class="fas fa-user" style="color:#38bdf8; margin-right:6px;"></i> ${p.name || 'Anonymous Player'}
                        </td>
                        <td><span style="font-family:monospace; color:#94a3b8; font-size:12px;">${p.timeControl || '5m'}</span></td>
                        <td>${statusBadge}</td>
                        <td>${actionBtn}</td>
                    </tr>
                `;
                $tbody.append(row);
            });
        }

        /**
         * Safe WebRTC Data Transmission with Queueing & ReadyState Checks
         */
        safeSend(payload) {
            if (!payload) return false;

            if (this.activeConnection && this.activeConnection.open) {
                try {
                    this.activeConnection.send(payload);
                    return true;
                } catch (e) {
                    console.warn("[MChessP2P] Send failed, queueing message:", e);
                    this.outboundQueue.push(payload);
                    return false;
                }
            } else if (this.activeConnection) {
                console.log("[MChessP2P] Connection not yet open, queuing message:", payload.type);
                this.outboundQueue.push(payload);
                return false;
            }
            return false;
        }

        flushOutboundQueue() {
            if (!this.activeConnection || !this.activeConnection.open || this.outboundQueue.length === 0) return;
            console.log(`[MChessP2P] Flushing ${this.outboundQueue.length} queued messages...`);
            while (this.outboundQueue.length > 0 && this.activeConnection.open) {
                const item = this.outboundQueue.shift();
                try {
                    this.activeConnection.send(item);
                } catch (e) {
                    console.warn("[MChessP2P] Error flushing queued message:", e);
                    this.outboundQueue.unshift(item);
                    break;
                }
            }
        }

        /**
         * Handle Incoming WebRTC Connection
         */
        handleIncomingConnection(conn) {
            const self = this;
            this.activeConnection = conn;
            this.lastConnectedPeerId = conn.peer;

            conn.on('open', () => {
                console.log("[MChessP2P] Incoming DataConnection opened successfully with:", conn.peer);
                self.flushOutboundQueue();
            });

            conn.on('data', (data) => {
                self.handleP2PMessage(data);
            });

            conn.on('close', () => {
                self.onOpponentDisconnected();
            });

            conn.on('error', (err) => {
                console.warn("[MChessP2P] Incoming connection error:", err);
            });
        }

        /**
         * Dispatch P2P Messages
         */
        handleP2PMessage(msg) {
            if (!msg || !msg.type) return;

            switch (msg.type) {
                case 'challenge_request':
                    this.onChallengeReceived(msg);
                    break;
                case 'challenge_accepted':
                    this.onChallengeAcceptedByOpponent(msg);
                    break;
                case 'challenge_rejected':
                    this.onChallengeRejectedByOpponent(msg);
                    break;
                case 'challenge_cancelled':
                    $('#modalIncomingChallenge').fadeOut(200);
                    break;
                case 'reconnect_request':
                    this.onReconnectRequestReceived(msg);
                    break;
                case 'reconnect_accept':
                    this.onReconnectAcceptedByOpponent(msg);
                    break;
                case 'move':
                    this.onRemoteMoveReceived(msg);
                    break;
                case 'move_ack':
                    this.onMoveAckReceived(msg);
                    break;
                case 'sync_heartbeat':
                    this.onSyncHeartbeatReceived(msg);
                    break;
                case 'resign':
                    this.onOpponentResigned();
                    break;
                case 'draw_offer':
                    this.onDrawOfferReceived();
                    break;
                case 'draw_accept':
                    this.onDrawAccepted();
                    break;
                case 'draw_decline':
                    this.onDrawDeclined();
                    break;
            }
        }

        /**
         * Send Challenge to a Peer from Lobby
         */
        sendChallenge(targetPeerId, targetName, timeMins, sideChoice) {
            if (!this.peer || !targetPeerId) return;

            const self = this;
            this.timeControlMinutes = parseInt(timeMins, 10) || 5;
            this.opponentName = targetName || 'Opponent';
            this.lastConnectedPeerId = targetPeerId;

            $('#lblOutgoingTargetName').text(this.opponentName);
            $('#modalOutgoingChallenge').fadeIn(200);

            const conn = this.peer.connect(targetPeerId);
            this.activeConnection = conn;

            conn.on('open', () => {
                console.log("[MChessP2P] Outgoing DataConnection opened to target peer:", targetPeerId);
                self.flushOutboundQueue();
                self.isHost = true;
                let hostSide = sideChoice || 'random';
                if (hostSide === 'random') {
                    hostSide = Math.random() > 0.5 ? 'white' : 'black';
                }
                self.mySide = hostSide;
                const guestSide = hostSide === 'white' ? 'black' : 'white';

                self.safeSend({
                    type: 'challenge_request',
                    challengerName: self.playerName,
                    timeControlMinutes: self.timeControlMinutes,
                    assignedGuestSide: guestSide
                });
            });

            conn.on('data', (data) => self.handleP2PMessage(data));
            conn.on('close', () => self.onOpponentDisconnected());
            conn.on('error', (err) => console.warn("[MChessP2P] Outgoing connection error:", err));
        }

        /**
         * Incoming Challenge Notification
         */
        onChallengeReceived(msg) {
            if (this.gameActive) {
                this.safeSend({ type: 'challenge_rejected', reason: 'busy' });
                return;
            }

            this.opponentName = msg.challengerName || 'Challenger';
            this.timeControlMinutes = msg.timeControlMinutes || 5;
            this.mySide = msg.assignedGuestSide || 'black';
            this.isHost = false;
            this.lastConnectedPeerId = this.activeConnection ? this.activeConnection.peer : null;

            $('#lblIncomingChallengerName').text(this.opponentName);
            $('#lblIncomingTimeDetail').text(`${this.timeControlMinutes} Minutes Blitz (Playing as ${this.mySide.toUpperCase()})`);
            $('#modalIncomingChallenge').fadeIn(200);
            this.playSound('check');
        }

        acceptIncomingChallenge() {
            $('#modalIncomingChallenge').fadeOut(200);
            if (!this.activeConnection) return;

            this.safeSend({
                type: 'challenge_accepted',
                accepterName: this.playerName
            });

            this.startLiveGame();
        }

        rejectIncomingChallenge() {
            $('#modalIncomingChallenge').fadeOut(200);
            if (this.activeConnection) {
                this.safeSend({ type: 'challenge_rejected' });
                this.activeConnection.close();
                this.activeConnection = null;
            }
        }

        onChallengeAcceptedByOpponent(msg) {
            $('#modalOutgoingChallenge').fadeOut(200);
            if (msg.accepterName) this.opponentName = msg.accepterName;
            this.startLiveGame();
        }

        onChallengeRejectedByOpponent() {
            $('#modalOutgoingChallenge').fadeOut(200);
            alert(`${this.opponentName} declined your challenge request.`);
            if (this.activeConnection) {
                this.activeConnection.close();
                this.activeConnection = null;
            }
        }

        /**
         * Reconnection Handshake handlers
         */
        onReconnectRequestReceived(msg) {
            console.log("[MChessP2P] Opponent reconnected to active match!", msg);
            this.stopDisconnectGraceTimer();

            this.safeSend({
                type: 'reconnect_accept',
                fen: this.chess.fen(),
                whiteTime: this.whiteTime,
                blackTime: this.blackTime
            });

            this.updateStatusBanner(`<i class="fas fa-link" style="color:#22c55e;"></i> Opponent reconnected! Match resumed.`);
            this.startClockTimer();
            this.initHeartbeat();
        }

        onReconnectAcceptedByOpponent(msg) {
            console.log("[MChessP2P] Reconnect accepted by opponent!", msg);
            this.stopDisconnectGraceTimer();

            if (msg.fen) {
                this.chess.load(msg.fen);
                if (this.board) this.board.position(msg.fen, false);
            }
            if (typeof msg.whiteTime === 'number') this.whiteTime = msg.whiteTime;
            if (typeof msg.blackTime === 'number') this.blackTime = msg.blackTime;
            this.updateClockDisplays();
            this.renderMovesList();

            this.updateStatusBanner(`<i class="fas fa-check-circle" style="color:#22c55e;"></i> Reconnected! <strong>${this.chess.turn() === 'w' ? 'White' : 'Black'} to move</strong>.`);
            this.startClockTimer();
            this.initHeartbeat();
        }

        /**
         * Start Live Match View
         */
        startLiveGame() {
            this.gameActive = true;
            this.gameSaved = false;
            this.isPassAndPlay = false;
            this.stopDisconnectGraceTimer();
            this.clearPendingMoveAck();
            this.registerLobbyPresence('in_game');

            // Strictly reset game engine and history state for fresh match
            this.chess = new Chess();
            this.historyFen = [{ fen: this.chess.fen(), san: 'Start', ply: 0 }];
            this.currentPly = 0;
            this.clearTapHighlights();
            this.saveActiveMatchToSession();

            // Switch UI view to Arena Match View
            $('#secLobbyView').hide();
            $('#secMatchArenaView').fadeIn(300);

            // Setup players and board
            const whiteName = (this.mySide === 'white') ? `${this.playerName} (You)` : this.opponentName;
            const blackName = (this.mySide === 'black') ? `${this.playerName} (You)` : this.opponentName;

            $('#p2pWhitePlayerName').text(whiteName);
            $('#p2pBlackPlayerName').text(blackName);
            $('#p2pMatchBadge').text('Match Active').css({ background: 'rgba(34,197,94,0.2)', color: '#4ade80' });

            this.whiteTime = this.timeControlMinutes * 60;
            this.blackTime = this.timeControlMinutes * 60;
            this.updateClockDisplays();

            this.initChessboard(this.mySide);
            this.updateStatusBanner(`<i class="fas fa-play" style="color:#22c55e;"></i> Match Started! <strong>White to move</strong>.`);
            this.startClockTimer();
            this.initHeartbeat();
        }

        /**
         * Start Pass & Play Local Mode (Same device)
         */
        startPassAndPlay(timeMins) {
            this.isPassAndPlay = true;
            this.gameActive = true;
            this.gameSaved = false;
            this.mySide = 'white';
            this.timeControlMinutes = parseInt(timeMins, 10) || 5;
            this.saveActiveMatchToSession();

            $('#secLobbyView').hide();
            $('#secMatchArenaView').fadeIn(300);

            $('#p2pWhitePlayerName').text('Player 1 (White)');
            $('#p2pBlackPlayerName').text('Player 2 (Black)');
            $('#p2pMatchBadge').text('Local Pass & Play').css({ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' });

            this.whiteTime = this.timeControlMinutes * 60;
            this.blackTime = this.timeControlMinutes * 60;
            this.updateClockDisplays();

            this.initChessboard('white');
            this.updateStatusBanner(`<i class="fas fa-users" style="color:#38bdf8;"></i> Local Pass & Play Match Started! <strong>White to move</strong>.`);
            this.startClockTimer();
        }

        /**
         * Initialize Interactive Chessboard.js with ResizeObserver & Tap-to-Move
         */
        initChessboard(orientation) {
            const self = this;
            if (this.chess.fen() === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
                this.historyFen = [{ fen: this.chess.fen(), san: 'Start', ply: 0 }];
                this.currentPly = 0;
            }

            const $container = $('#' + this.options.boardContainerId);
            $container.empty();

            this.board = Chessboard(this.options.boardContainerId, {
                position: this.chess.fen() || 'start',
                orientation: orientation || 'white',
                draggable: true,
                pieceTheme: this.options.pieceTheme,
                onDragStart: (source, piece) => self.onDragStart(source, piece),
                onDrop: (source, target) => self.onDrop(source, target),
                onSnapEnd: () => self.onSnapEnd()
            });

            // Clean up previous observers
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }

            // Mobile-Friendly Dynamic ResizeObserver
            if (window.ResizeObserver) {
                const domContainer = document.getElementById(this.options.boardContainerId);
                if (domContainer) {
                    this.resizeObserver = new ResizeObserver(() => {
                        if (self.board) {
                            self.board.resize();
                        }
                    });
                    this.resizeObserver.observe(domContainer);
                }
            }

            $(window).off('resize.p2p orientationchange.p2p').on('resize.p2p orientationchange.p2p', () => {
                setTimeout(() => {
                    if (self.board) self.board.resize();
                }, 100);
            });

            this.renderMovesList();
            this.bindTapToMove();
        }

        /**
         * Tap-to-Move (Click-to-Move) for Mobile & Desktop
         */
        bindTapToMove() {
            const self = this;
            const $container = $('#' + this.options.boardContainerId);

            $container.off('click', '[class*="square-"]').on('click', '[class*="square-"]', function (e) {
                if (!self.gameActive || self.chess.game_over()) return;

                const clickedSquare = $(this).attr('data-square') || (($(this).attr('class') || '').match(/square-([a-h][1-8])/) || [])[1];
                if (!clickedSquare) return;

                const pieceOnSquare = self.chess.get(clickedSquare);

                // Determine if clicked square has player's piece
                const isMyPiece = pieceOnSquare && (
                    self.isPassAndPlay ||
                    (self.mySide === 'white' && pieceOnSquare.color === 'w') ||
                    (self.mySide === 'black' && pieceOnSquare.color === 'b')
                );

                // Is it this player's turn?
                const isMyTurn = (self.chess.turn() === 'w' && self.mySide === 'white') ||
                                 (self.chess.turn() === 'b' && self.mySide === 'black') ||
                                 self.isPassAndPlay;

                if (!isMyTurn) return;

                // CASE 1: A square is already selected
                if (self.selectedSquare) {
                    // Check if clicked square is a valid legal move destination
                    const isLegalDest = self.legalMoves.some(m => m.to === clickedSquare);

                    if (isLegalDest) {
                        // Execute move via click
                        const fromSq = self.selectedSquare;
                        const move = self.chess.move({
                            from: fromSq,
                            to: clickedSquare,
                            promotion: 'q'
                        });

                        if (move) {
                            self.clearTapHighlights();
                            self.board.position(self.chess.fen());
                            self.onMoveExecuted(move, fromSq, clickedSquare);
                            return;
                        }
                    } else if (isMyPiece && clickedSquare !== self.selectedSquare) {
                        // Switch piece selection
                        self.selectSquareForTap(clickedSquare);
                        return;
                    } else {
                        // Deselect
                        self.clearTapHighlights();
                        return;
                    }
                }

                // CASE 2: No square selected yet -> Select piece
                if (isMyPiece) {
                    self.selectSquareForTap(clickedSquare);
                }
            });
        }

        selectSquareForTap(square) {
            this.clearTapHighlights();
            this.selectedSquare = square;
            this.legalMoves = this.chess.moves({ square: square, verbose: true });

            // Highlight selected source square
            $(`.square-${square}`).addClass('square-selected');

            // Highlight all legal destination squares with green dots or capture rings
            this.legalMoves.forEach(m => {
                const $dest = $(`.square-${m.to}`);
                $dest.addClass('dest-highlight');
                if (m.captured) {
                    $dest.addClass('dest-capture');
                }
            });
        }

        clearTapHighlights() {
            this.selectedSquare = null;
            this.legalMoves = [];
            $('[class*="square-"]').removeClass('square-selected dest-highlight dest-capture');
        }

        onDragStart(source, piece) {
            if (!this.gameActive || this.chess.game_over()) return false;
            this.clearTapHighlights();

            // In P2P mode, player can only drag their own color
            if (!this.isPassAndPlay) {
                if (this.mySide === 'white' && piece.search(/^b/) !== -1) return false;
                if (this.mySide === 'black' && piece.search(/^w/) !== -1) return false;
            }

            // Must be that player's turn
            if ((this.chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (this.chess.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
        }

        onDrop(source, target) {
            this.clearTapHighlights();
            const move = this.chess.move({
                from: source,
                to: target,
                promotion: 'q'
            });

            if (move === null) return 'snapback';

            this.onMoveExecuted(move, source, target);
        }

        onMoveExecuted(move, source, target) {
            // Sound
            if (this.chess.in_checkmate()) this.playSound('checkmate');
            else if (this.chess.in_draw() || this.chess.in_stalemate() || this.chess.in_threefold_repetition() || this.chess.insufficient_material()) this.playSound('stalemate');
            else if (this.chess.in_check()) this.playSound('check');
            else if (move.captured) this.playSound('capture');
            else this.playSound('move');

            // Record history
            this.historyFen.push({
                fen: this.chess.fen(),
                san: move.san,
                ply: this.historyFen.length
            });
            this.currentPly = this.historyFen.length - 1;

            this.renderMovesList();
            this.highlightLastMove(source, target);
            this.saveActiveMatchToSession();

            // Transmit to peer if online match
            if (!this.isPassAndPlay) {
                const movePayload = {
                    type: 'move',
                    from: source,
                    to: target,
                    promotion: move.promotion || 'q',
                    san: move.san,
                    fen: this.chess.fen(),
                    ply: this.currentPly,
                    whiteTime: this.whiteTime,
                    blackTime: this.blackTime
                };
                this.safeSend(movePayload);
                this.trackPendingMoveAck(movePayload);
            }

            this.checkGameOver();
        }

        trackPendingMoveAck(payload) {
            this.clearPendingMoveAck();

            this.pendingMoveAck = {
                payload: payload,
                attempts: 0
            };

            const self = this;
            const checkAck = () => {
                if (!self.gameActive || !self.pendingMoveAck || self.pendingMoveAck.payload.ply !== payload.ply) {
                    return;
                }

                if (self.pendingMoveAck.attempts < 3) {
                    self.pendingMoveAck.attempts++;
                    console.log(`[MChessP2P] No ACK for move ply ${payload.ply}. Auto-retransmitting (attempt ${self.pendingMoveAck.attempts})...`);
                    self.safeSend(self.pendingMoveAck.payload);
                    self.moveAckTimer = setTimeout(checkAck, 600);
                } else {
                    console.warn(`[MChessP2P] Move ply ${payload.ply} unacknowledged after 3 retries.`);
                    self.clearPendingMoveAck();
                }
            };

            this.moveAckTimer = setTimeout(checkAck, 600);
        }

        onMoveAckReceived(msg) {
            if (this.pendingMoveAck && (!msg.ply || msg.ply >= this.pendingMoveAck.payload.ply)) {
                this.clearPendingMoveAck();
            }
        }

        clearPendingMoveAck() {
            if (this.moveAckTimer) {
                clearTimeout(this.moveAckTimer);
                this.moveAckTimer = null;
            }
            this.pendingMoveAck = null;
        }

        onSnapEnd() {
            this.board.position(this.chess.fen());
        }

        onRemoteMoveReceived(msg) {
            this.clearTapHighlights();
            if (!this.gameActive) return;

            let moveSuccess = false;
            let moveSan = msg.san;
            let moveCaptured = false;
            let inCheck = false;

            // 1. Attempt standard legal move in current engine state
            try {
                const move = this.chess.move({
                    from: msg.from,
                    to: msg.to,
                    promotion: msg.promotion || 'q'
                });
                if (move) {
                    moveSuccess = true;
                    moveSan = move.san;
                    moveCaptured = !!move.captured;
                    inCheck = this.chess.in_check();
                }
            } catch (e) {
                moveSuccess = false;
            }

            // 2. Smart FEN Fallback: If move failed (due to desync or stale state), load authoritative FEN
            if (!moveSuccess && msg.fen) {
                console.warn("[MChessP2P] Standard move failed. Falling back to authoritative FEN:", msg.fen);
                try {
                    const loaded = this.chess.load(msg.fen);
                    if (loaded) {
                        moveSuccess = true;
                        inCheck = this.chess.in_check();
                    }
                } catch (err) {
                    console.error("[MChessP2P] FEN fallback failed:", err);
                }
            }

            if (moveSuccess) {
                // Play appropriate sound
                if (this.chess.in_checkmate()) this.playSound('checkmate');
                else if (this.chess.in_draw() || this.chess.in_stalemate() || this.chess.in_threefold_repetition() || this.chess.insufficient_material()) this.playSound('stalemate');
                else if (inCheck) this.playSound('check');
                else if (moveCaptured) this.playSound('capture');
                else this.playSound('move');

                // Update move history
                this.historyFen.push({
                    fen: this.chess.fen(),
                    san: moveSan || 'Move',
                    ply: this.historyFen.length
                });
                this.currentPly = this.historyFen.length - 1;

                // Sync board visually without animation glitch
                if (this.board) {
                    this.board.position(this.chess.fen(), false);
                }
                this.renderMovesList();
                if (msg.from && msg.to) {
                    this.highlightLastMove(msg.from, msg.to);
                }
                this.saveActiveMatchToSession();

                // Sync clocks if provided
                if (typeof msg.whiteTime === 'number') this.whiteTime = msg.whiteTime;
                if (typeof msg.blackTime === 'number') this.blackTime = msg.blackTime;
                this.updateClockDisplays();

                // Send immediate ACK to sender so they know move was rendered
                this.safeSend({
                    type: 'move_ack',
                    ply: msg.ply || this.currentPly
                });

                this.checkGameOver();
            } else {
                console.error("[MChessP2P] Failed to apply remote move payload:", msg);
            }
        }

        initHeartbeat() {
            this.stopHeartbeat();
            const self = this;
            this.heartbeatInterval = setInterval(() => {
                if (!self.gameActive || self.isPassAndPlay || self.chess.game_over()) {
                    return;
                }
                self.safeSend({
                    type: 'sync_heartbeat',
                    ply: self.currentPly,
                    fen: self.chess.fen(),
                    whiteTime: self.whiteTime,
                    blackTime: self.blackTime
                });
            }, 10000);
        }

        stopHeartbeat() {
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
        }

        onSyncHeartbeatReceived(msg) {
            if (!this.gameActive || this.isPassAndPlay || !msg || !msg.fen) return;

            // Check if remote state differs from local state
            if (msg.fen !== this.chess.fen()) {
                console.log("[MChessP2P] Heartbeat detected state drift. Reconciling with remote state...");
                try {
                    const loaded = this.chess.load(msg.fen);
                    if (loaded) {
                        if (this.board) this.board.position(this.chess.fen(), false);
                        if (typeof msg.whiteTime === 'number') this.whiteTime = msg.whiteTime;
                        if (typeof msg.blackTime === 'number') this.blackTime = msg.blackTime;
                        this.updateClockDisplays();
                        this.saveActiveMatchToSession();
                        this.checkGameOver();
                    }
                } catch (e) {
                    console.warn("[MChessP2P] Heartbeat alignment error:", e);
                }
            }
        }

        highlightLastMove(from, to) {
            $('[class*="square-"]').css('box-shadow', '');
            $(`.square-${from}`).css('box-shadow', 'inset 0 0 12px 2px #38bdf8');
            $(`.square-${to}`).css('box-shadow', 'inset 0 0 12px 2px #22c55e');
        }

        /**
         * Clock Timers
         */
        startClockTimer() {
            if (this.timeControlMinutes === 0) return;
            const self = this;
            this.stopClockTimer();

            this.clockInterval = setInterval(() => {
                if (!self.gameActive || self.chess.game_over()) {
                    self.stopClockTimer();
                    return;
                }

                const turn = self.chess.turn();
                if (turn === 'w') {
                    self.whiteTime--;
                    if (self.whiteTime <= 0) {
                        self.whiteTime = 0;
                        self.updateClockDisplays();
                        self.handleTimeout('White');
                        return;
                    }
                } else {
                    self.blackTime--;
                    if (self.blackTime <= 0) {
                        self.blackTime = 0;
                        self.updateClockDisplays();
                        self.handleTimeout('Black');
                        return;
                    }
                }
                self.updateClockDisplays();
            }, 1000);
        }

        stopClockTimer() {
            if (this.clockInterval) {
                clearInterval(this.clockInterval);
                this.clockInterval = null;
            }
        }

        formatTime(seconds) {
            if (seconds < 0) seconds = 0;
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }

        updateClockDisplays() {
            if (this.timeControlMinutes === 0) {
                $('#p2pWhiteClock').text('∞');
                $('#p2pBlackClock').text('∞');
            } else {
                $('#p2pWhiteClock').text(this.formatTime(this.whiteTime));
                $('#p2pBlackClock').text(this.formatTime(this.blackTime));
            }
        }

        handleTimeout(flaggedSide) {
            this.stopClockTimer();
            const winner = flaggedSide === 'White' ? 'Black' : 'White';
            const resultText = winner === 'White' ? '1-0' : '0-1';

            this.updateStatusBanner(`<i class="fas fa-hourglass-end" style="color:#ef4444;"></i> <strong>Time Out! ${flaggedSide} ran out of time. ${winner} wins!</strong>`);
            this.onGameCompleted(resultText + ' (Time Out)', `${winner} won on time.`);
        }

        checkGameOver() {
            let isOver = false;
            let result = '*';
            let message = '';

            if (this.chess.in_checkmate()) {
                isOver = true;
                const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
                result = winner === 'White' ? '1-0' : '0-1';
                message = `Checkmate! ${winner} wins!`;
                this.updateStatusBanner(`<i class="fas fa-crown" style="color:#d4af37;"></i> <strong>${message}</strong>`);
            } else if (this.chess.in_draw() || this.chess.in_stalemate() || this.chess.in_threefold_repetition() || this.chess.insufficient_material()) {
                isOver = true;
                result = '1/2-1/2';
                let reason = 'Draw';
                if (this.chess.in_stalemate()) reason = 'Stalemate';
                else if (this.chess.in_threefold_repetition()) reason = 'Threefold Repetition';
                else if (this.chess.insufficient_material()) reason = 'Insufficient Material';
                message = `Game Draw (${reason})`;
                this.updateStatusBanner(`<i class="fas fa-handshake"></i> <strong>${message}</strong>`);
            }

            if (isOver) {
                this.onGameCompleted(result, message);
            }
        }

        promptResign() {
            if (!this.gameActive || this.chess.game_over()) return;
            $('#modalConfirmResign').fadeIn(200);
        }

        confirmResign() {
            $('#modalConfirmResign').fadeOut(200);
            this.resignMatch();
        }

        cancelResign() {
            $('#modalConfirmResign').fadeOut(200);
        }

        resignMatch() {
            if (!this.gameActive || this.chess.game_over()) return;

            const winner = this.mySide === 'white' ? 'Black' : 'White';
            const resultText = winner === 'White' ? '1-0' : '0-1';

            if (!this.isPassAndPlay) {
                this.safeSend({ type: 'resign' });
            }

            this.onGameCompleted(resultText + ' (Resignation)', `You resigned. ${winner} wins.`);
        }

        onOpponentResigned() {
            const winner = this.mySide === 'white' ? 'White' : 'Black';
            const resultText = winner === 'White' ? '1-0' : '0-1';
            this.onGameCompleted(resultText + ' (Resignation)', `${this.opponentName} resigned. You win!`);
        }

        offerDraw() {
            if (!this.gameActive || this.chess.game_over()) return;
            if (!this.isPassAndPlay) {
                this.safeSend({ type: 'draw_offer' });
                this.updateStatusBanner(`<i class="fas fa-handshake" style="color:#38bdf8;"></i> <strong>Draw offer sent.</strong> Waiting for opponent's response...`);
                $('#btnP2pDraw').prop('disabled', true).css('opacity', '0.6').html('<i class="fas fa-handshake"></i> Draw Offered');
            } else if (this.isPassAndPlay) {
                this.onGameCompleted('1/2-1/2 (Agreement)', 'Mutual Draw Agreed.');
            }
        }

        onDrawOfferReceived() {
            if (!this.gameActive || this.chess.game_over()) return;
            $('#lblIncomingDrawPlayerName').text(this.opponentName);
            $('#modalIncomingDrawOffer').fadeIn(200);
            this.playSound('check');
        }

        acceptIncomingDrawOffer() {
            $('#modalIncomingDrawOffer').fadeOut(200);
            this.safeSend({ type: 'draw_accept' });
            this.onGameCompleted('1/2-1/2 (Agreement)', 'Draw accepted by agreement.');
        }

        declineIncomingDrawOffer() {
            $('#modalIncomingDrawOffer').fadeOut(200);
            this.safeSend({ type: 'draw_decline' });
        }

        onDrawDeclined() {
            this.updateStatusBanner(`<i class="fas fa-info-circle" style="color:#f87171;"></i> <strong>${this.opponentName} declined the draw offer.</strong>`);
            $('#btnP2pDraw').prop('disabled', false).css('opacity', '1').html('<i class="fas fa-handshake"></i> Offer Draw');
        }

        onDrawAccepted() {
            $('#btnP2pDraw').prop('disabled', false).css('opacity', '1').html('<i class="fas fa-handshake"></i> Offer Draw');
            this.onGameCompleted('1/2-1/2 (Agreement)', 'Draw accepted by agreement.');
        }

        /**
         * 30-Second Disconnection Grace Period Countdown
         */
        onOpponentDisconnected() {
            if (this.gameActive && !this.gameSaved) {
                this.startDisconnectGraceTimer();
            }
        }

        startDisconnectGraceTimer() {
            const self = this;
            this.stopDisconnectGraceTimer();
            let remaining = 30;

            this.updateStatusBanner(`<i class="fas fa-exclamation-triangle" style="color:#eab308;"></i> <strong>Opponent disconnected. Waiting <span id="lblGraceCount" style="color:#f87171;">30</span>s for reconnection...</strong>`);

            this.graceTimer = setInterval(() => {
                remaining--;
                $('#lblGraceCount').text(remaining);
                if (remaining <= 0) {
                    self.stopDisconnectGraceTimer();
                    self.handleOpponentAbandoned();
                }
            }, 1000);
        }

        stopDisconnectGraceTimer() {
            if (this.graceTimer) {
                clearInterval(this.graceTimer);
                this.graceTimer = null;
            }
        }

        handleOpponentAbandoned() {
            const winner = this.mySide === 'white' ? 'White' : 'Black';
            const resultText = winner === 'White' ? '1-0' : '0-1';
            this.onGameCompleted(resultText + ' (Abandonment)', `${this.opponentName} did not reconnect in time. You win by abandonment!`);
        }

        /**
         * Conclude and Save Game to LocalStorage
         */
        onGameCompleted(resultText, message) {
            this.gameActive = false;
            this.stopClockTimer();
            this.stopDisconnectGraceTimer();
            this.stopHeartbeat();
            this.clearPendingMoveAck();
            this.clearActiveMatchSession();
            this.clearTapHighlights();
            this.registerLobbyPresence('available');

            $('#btnP2pDraw').prop('disabled', false).css('opacity', '1').html('<i class="fas fa-handshake"></i> Offer Draw');
            $('#modalIncomingDrawOffer').hide();
            $('#modalConfirmResign').hide();
            $('#p2pMatchBadge').text(resultText).css({ background: 'rgba(234,179,8,0.2)', color: '#facc15' });

            if (!this.gameSaved && typeof MChessGameHistory !== 'undefined') {
                this.gameSaved = true;
                const whitePlayer = this.isPassAndPlay ? 'Player 1' : ((this.mySide === 'white') ? this.playerName : this.opponentName);
                const blackPlayer = this.isPassAndPlay ? 'Player 2' : ((this.mySide === 'black') ? this.playerName : this.opponentName);

                const moveSanList = (this.historyFen && this.historyFen.length > 1)
                    ? this.historyFen.slice(1).map(h => h.san)
                    : this.chess.history();

                let cleanPgn = this.chess.pgn();
                if (!cleanPgn || cleanPgn.trim().length === 0 || moveSanList.length > this.chess.history().length) {
                    cleanPgn = MChessGameHistory.buildPgnFromMoves({
                        white: whitePlayer,
                        black: blackPlayer,
                        date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
                        result: resultText.includes('1-0') ? '1-0' : (resultText.includes('0-1') ? '0-1' : (resultText.includes('1/2') ? '1/2-1/2' : '*')),
                        termination: message,
                        moves: moveSanList,
                        mode: this.isPassAndPlay ? `Local Pass & Play (${this.timeControlMinutes}m)` : `Online P2P (${this.timeControlMinutes}m)`
                    });
                }

                MChessGameHistory.saveGame({
                    white: whitePlayer,
                    black: blackPlayer,
                    userSide: this.mySide || 'white',
                    playerName: this.playerName || 'Guest Player',
                    result: resultText,
                    moveCount: moveSanList.length,
                    moves: moveSanList,
                    pgn: cleanPgn,
                    mode: this.isPassAndPlay ? `Local Pass & Play (${this.timeControlMinutes}m)` : `Online P2P (${this.timeControlMinutes}m)`
                });
            }

            // Show Game Over Modal
            $('#lblGameOverResult').text(resultText);
            $('#lblGameOverMessage').text(message);
            $('#modalP2pGameOver').fadeIn(250);
        }

        leaveMatch() {
            this.gameActive = false;
            this.stopClockTimer();
            this.stopDisconnectGraceTimer();
            this.stopHeartbeat();
            this.clearPendingMoveAck();
            this.clearActiveMatchSession();
            this.clearTapHighlights();
            this.registerLobbyPresence('available');

            $('#btnP2pDraw').prop('disabled', false).css('opacity', '1').html('<i class="fas fa-handshake"></i> Offer Draw');
            $('#modalIncomingDrawOffer').hide();
            $('#modalConfirmResign').hide();

            if (this.activeConnection) {
                this.activeConnection.close();
                this.activeConnection = null;
            }

            $('#modalP2pGameOver').hide();
            $('#secMatchArenaView').hide();
            $('#secLobbyView').fadeIn(300);
        }

        renderMovesList() {
            const history = this.chess.history({ verbose: true });
            const $container = $('#p2pMovesList');
            $container.empty();

            for (let i = 0; i < history.length; i += 2) {
                const moveNum = Math.floor(i / 2) + 1;
                const plyWhite = i + 1;
                const plyBlack = i + 2;

                const numDiv = `<div class="move-num">${moveNum}.</div>`;
                const whiteActive = (this.currentPly === plyWhite) ? ' active' : '';
                const whiteDiv = `<div class="move-cell${whiteActive}" data-ply="${plyWhite}">${history[i].san}</div>`;

                let blackDiv = `<div></div>`;
                if (i + 1 < history.length) {
                    const blackActive = (this.currentPly === plyBlack) ? ' active' : '';
                    blackDiv = `<div class="move-cell${blackActive}" data-ply="${plyBlack}">${history[i + 1].san}</div>`;
                }

                $container.append(numDiv + whiteDiv + blackDiv);
            }

            $('#p2pMoveCount').text(`${history.length} moves`);
        }

        updateStatusBanner(html) {
            $('#p2pStatusBanner').html(html);
        }

        checkUrlRoomParam() {
            const urlParams = new URLSearchParams(window.location.search);
            const room = urlParams.get('room');
            if (room && room !== this.peerId) {
                // Consume and clean invite parameter so reload won't spawn duplicate connections
                if (window.history && window.history.replaceState) {
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                }
                this.sendChallenge(room, 'Friend (Invite Link)', 5, 'random');
            }
        }

        bindDOMEvents() {
            const self = this;

            // Toggle Live Lobby Online (Option B: Exactly 1 Firestore write on click)
            $('#btnToggleLobbyOnline').on('click', () => self.toggleLobbyOnline());

            // Challenge click from Lobby table
            $(document).on('click', '.btn-challenge-peer', function () {
                const targetPeer = $(this).data('peer');
                const targetName = $(this).data('name');
                const selectedTime = $('#selLobbyPreferredTime').val() || 5;
                self.sendChallenge(targetPeer, targetName, selectedTime, 'random');
            });

            // Accept / Reject Challenge Modals
            $('#btnAcceptIncomingChallenge').on('click', () => self.acceptIncomingChallenge());
            $('#btnRejectIncomingChallenge').on('click', () => self.rejectIncomingChallenge());
            $('#btnCancelOutgoingChallenge').on('click', () => {
                $('#modalOutgoingChallenge').fadeOut(200);
                if (self.activeConnection) {
                    self.safeSend({ type: 'challenge_cancelled' });
                    self.activeConnection.close();
                    self.activeConnection = null;
                }
            });

            // In-Game Action Buttons & Modals
            $('#btnP2pResign').on('click', () => self.promptResign());
            $('#btnConfirmResignYes').on('click', () => self.confirmResign());
            $('#btnConfirmResignNo').on('click', () => self.cancelResign());

            $('#btnP2pDraw').on('click', () => self.offerDraw());
            $('#btnAcceptDrawOffer').on('click', () => self.acceptIncomingDrawOffer());
            $('#btnDeclineDrawOffer').on('click', () => self.declineIncomingDrawOffer());

            $('#btnP2pFlip').on('click', () => {
                if (self.board) self.board.flip();
            });

            $('#btnP2pLeaveMatch, #btnGameOverReturnLobby').on('click', () => self.leaveMatch());

            // Pass & Play Launch Button
            $('#btnStartPassAndPlay').on('click', () => {
                const time = $('#selPassAndPlayTime').val();
                self.startPassAndPlay(time);
            });

            // Direct Link Generator Button
            $('#btnCreateInviteLink').on('click', () => {
                const time = $('#selInviteLinkTime').val();
                const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${self.peerId}`;
                $('#txtGeneratedInviteUrl').val(inviteUrl);
                $('#pnlInviteLinkOutput').slideDown(250);
            });

            $('#btnCopyInviteUrl').on('click', function () {
                const url = $('#txtGeneratedInviteUrl').val();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        $(this).html('<i class="fas fa-check"></i> Copied!');
                        setTimeout(() => $(this).html('<i class="fas fa-copy"></i> Copy Link'), 2000);
                    });
                }
            });
        }
    }

    // Export globally
    window.MChessP2P = MChessP2P;

})(jQuery);
