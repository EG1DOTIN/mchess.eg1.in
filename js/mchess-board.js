/**
 * @file mchess-board.js
 * @description Centralized controller for MCHESS Interactive PGN Viewer & Analysis Board.
 * Automatically injects responsive board UI, parses PGN files and direct PGN strings, handles move stepping, and enables drag & drop analysis mode.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    class MChessBoard {
        constructor(containerEl, options = {}) {
            this.$container = $(containerEl);
            this.options = Object.assign({
                pgn: null,
                pgnUrl: this.$container.data('pgn') || './pgn/pgn_games.pgn',
                showSelect: true,
                autoPlay: false
            }, options);

            this.uid = Math.random().toString(36).substr(2, 7);
            this.boardId = 'board_' + this.uid;
            this.pgnUrl = this.options.pgnUrl;
            
            this.pgnGames = [];
            this.currentPgnIndex = 0;
            this.mainChess = new Chess();
            this.activeChess = new Chess();
            this.mainHistory = [];
            this.currentMoveIndex = -1;
            this.board = null;
            this.autoplayTimer = null;
            this.isAnalysisMode = false;
            this.analysisMoves = [];
            this.selectedSquare = null;
            this.legalMoves = [];
            this.resizeObserver = null;

            this.initAudio();
            this.initLayout();
            this.initBoard();

            if (this.options.pgn) {
                this.loadDirectPgn(this.options.pgn);
            } else {
                this.loadPgnFile();
            }

            this.bindEvents();
        }

        initAudio() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.audioCtx = new AudioContext();
                }
            } catch (e) {
                console.warn("[MChessBoard] Web Audio not available:", e);
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
         * Inject the complete PGN Viewer HTML layout into container with unique instance IDs
         */
        initLayout() {
            if (this.$container.children().length > 0) {
                this.$container.empty();
            }

            const selectDisplay = (this.options.showSelect && !this.options.pgn) ? 'block' : 'none';

            const html = `
                <div class="pgn-viewer-container">
                    <div class="demo-badge-header">
                        <h2 class="demo-title">
                            <i class="fas fa-chess-board"></i>
                            Interactive Chess Games & Analysis
                        </h2>
                        <span class="tech-pill">
                            <i class="fas fa-microscope"></i> Interactive Analysis Mode
                        </span>
                    </div>

                    <div class="game-select-wrapper" style="display: ${selectDisplay};">
                        <label for="gameSelect_${this.uid}"><i class="fas fa-trophy"></i> Select Game from Database:</label>
                        <select id="gameSelect_${this.uid}" class="game-select">
                            <option value="">Loading games from database...</option>
                        </select>
                    </div>

                    <div class="viewer-grid">
                        <div class="board-column">
                            <div class="board-wrapper">
                                <div id="${this.boardId}" class="board-container"></div>
                            </div>

                            <div class="controls-bar">
                                <button id="btnStart_${this.uid}" class="btn-ctrl" title="First Move (Home)">
                                    <i class="fas fa-fast-backward"></i>
                                </button>
                                <button id="btnPrev_${this.uid}" class="btn-ctrl" title="Previous Move (Left Arrow)">
                                    <i class="fas fa-step-backward"></i>
                                </button>
                                <button id="btnPlay_${this.uid}" class="btn-ctrl" title="Play / Pause (Spacebar)">
                                    <i class="fas fa-play" id="playIcon_${this.uid}"></i>
                                </button>
                                <button id="btnNext_${this.uid}" class="btn-ctrl" title="Next Move (Right Arrow)">
                                    <i class="fas fa-step-forward"></i>
                                </button>
                                <button id="btnEnd_${this.uid}" class="btn-ctrl" title="Last Move (End)">
                                    <i class="fas fa-fast-forward"></i>
                                </button>
                                <button id="btnFlip_${this.uid}" class="btn-ctrl" title="Flip Board">
                                    <i class="fas fa-sync-alt"></i> Flip
                                </button>
                                <button type="button" class="btn-ctrl btn-board-theme" title="Change Board Theme">
                                    <i class="fas fa-palette"></i> Theme
                                </button>
                                <select id="autoplaySpeed_${this.uid}" class="speed-select" title="Autoplay Speed">
                                    <option value="2000">2s / move</option>
                                    <option value="1000" selected>1s / move</option>
                                    <option value="500">0.5s / move</option>
                                </select>
                            </div>
                            <div class="kb-hint">
                                <i class="far fa-keyboard"></i> <strong>Drag pieces to analyze custom variations anytime!</strong><br />
                                Shortcuts: <strong>&larr; &rarr;</strong> step, <strong>Space</strong> play/pause, <strong>Home/End</strong> jump.
                            </div>
                        </div>

                        <div class="info-column">
                            <div class="game-meta-card">
                                <div class="players-header">
                                    <div class="player-box">
                                        <span class="player-badge white"></span>
                                        <span id="whitePlayer_${this.uid}">White Player</span>
                                    </div>
                                    <span class="result-badge" id="gameResult_${this.uid}">1-0</span>
                                    <div class="player-box">
                                        <span class="player-badge black"></span>
                                        <span id="blackPlayer_${this.uid}">Black Player</span>
                                    </div>
                                </div>
                                <div class="meta-details">
                                    <span><i class="far fa-calendar-alt"></i> <strong id="gameDate_${this.uid}">N/A</strong></span>
                                    <span><i class="fas fa-map-marker-alt"></i> <strong id="gameSite_${this.uid}">N/A</strong></span>
                                    <span><i class="fas fa-bookmark"></i> ECO: <strong id="gameECO_${this.uid}">N/A</strong></span>
                                </div>
                            </div>

                            <div id="modeBanner_${this.uid}" class="mode-banner game-line">
                                <span id="modeText_${this.uid}"><i class="fas fa-book-open"></i> Watching Main Game Line</span>
                                <button id="btnResetAnalysis_${this.uid}" class="btn-reset-analysis" style="display: none;">
                                    <i class="fas fa-undo"></i> Back to Game
                                </button>
                            </div>

                            <div class="moves-panel">
                                <div class="moves-panel-header">
                                    <span><i class="fas fa-list-ol"></i> Game Move List</span>
                                    <span id="moveCountBadge_${this.uid}" style="font-weight:normal; font-size:12px; color:#64748b;">0 moves</span>
                                </div>
                                <div id="movesList_${this.uid}" class="moves-list"></div>
                            </div>

                            <div id="analysisBox_${this.uid}" class="analysis-moves-box" style="display: none;">
                                <strong><i class="fas fa-vial"></i> Trial Variation:</strong>
                                <span id="analysisMovesText_${this.uid}"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.$container.html(html);
        }

        /**
         * Initialize Chessboard.js with Drag & Drop handlers & ResizeObserver
         */
        initBoard() {
            const self = this;
            this.board = Chessboard(this.boardId, {
                position: 'start',
                draggable: true,
                pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
                onDragStart: (source, piece) => self.onDragStart(source, piece),
                onDrop: (source, target) => self.onDrop(source, target),
                onSnapEnd: () => self.onSnapEnd()
            });

            // Dynamic ResizeObserver for responsive resizing
            if (window.ResizeObserver) {
                const domEl = document.getElementById(this.boardId);
                if (domEl) {
                    this.resizeObserver = new ResizeObserver(() => {
                        if (self.board) self.board.resize();
                    });
                    this.resizeObserver.observe(domEl);
                }
            }

            $(window).on(`resize.${this.uid} orientationchange.${this.uid}`, () => {
                setTimeout(() => {
                    if (self.board) self.board.resize();
                }, 100);
            });

            this.bindTapToMove();
        }

        /**
         * Tap-to-Move (Click-to-Move) for Mobile & Desktop
         */
        bindTapToMove() {
            const self = this;
            const $board = this.$container.find('#' + this.boardId);

            $board.off('click', '[class*="square-"]').on('click', '[class*="square-"]', function (e) {
                if (self.activeChess.game_over()) return;
                self.stopAutoplay();

                const $targetSq = $(this).closest('[class*="square-"]');
                const clickedSquare = $targetSq.attr('data-square') || (($targetSq.attr('class') || '').match(/square-([a-h][1-8])/) || [])[1];
                if (!clickedSquare) return;

                const pieceOnSquare = self.activeChess.get(clickedSquare);
                const currentTurn = self.activeChess.turn();
                const isCurrentTurnPiece = pieceOnSquare && pieceOnSquare.color === currentTurn;

                // CASE 1: A square is already selected
                if (self.selectedSquare) {
                    const isLegalDest = self.legalMoves && self.legalMoves.some(m => m.to === clickedSquare);

                    if (isLegalDest) {
                        const fromSq = self.selectedSquare;
                        self.clearTapHighlights();
                        const snapResult = self.onDrop(fromSq, clickedSquare);
                        if (snapResult !== 'snapback') {
                            self.board.position(self.activeChess.fen());
                        }
                        return;
                    } else if (isCurrentTurnPiece && clickedSquare !== self.selectedSquare) {
                        // Switch piece selection
                        self.selectSquareForTap(clickedSquare);
                        return;
                    } else {
                        // Deselect
                        self.clearTapHighlights();
                        return;
                    }
                }

                // CASE 2: Select piece
                if (isCurrentTurnPiece) {
                    self.selectSquareForTap(clickedSquare);
                }
            });
        }

        selectSquareForTap(square) {
            this.clearTapHighlights();
            this.selectedSquare = square;
            this.legalMoves = this.activeChess.moves({ square: square, verbose: true });

            // Highlight selected source square
            this.$container.find(`.square-${square}`).addClass('square-selected');

            // Highlight all legal destination squares with green dots or capture rings
            this.legalMoves.forEach(m => {
                const $dest = this.$container.find(`.square-${m.to}`);
                $dest.addClass('dest-highlight');
                if (m.captured) {
                    $dest.addClass('dest-capture');
                }
            });
        }

        clearTapHighlights() {
            this.selectedSquare = null;
            this.legalMoves = [];
            this.$container.find('[class*="square-"]').removeClass('square-selected dest-highlight dest-capture');
        }

        onDragStart(source, piece) {
            if (this.activeChess.game_over()) return false;

            const isWhiteTurn = this.activeChess.turn() === 'w';
            const isBlackTurn = this.activeChess.turn() === 'b';
            const isPieceWhite = piece.search(/^w/) !== -1;
            const isPieceBlack = piece.search(/^b/) !== -1;

            if ((isWhiteTurn && isPieceBlack) || (isBlackTurn && isPieceWhite)) {
                // Do not clear tap highlights if user touched opponent piece to capture
                return false;
            }

            this.clearTapHighlights();
            this.stopAutoplay();
        }

        isPromotionMove(source, target) {
            const piece = this.activeChess.get(source);
            if (!piece || piece.type !== 'p') return false;
            if ((piece.color === 'w' && target[1] !== '8') || (piece.color === 'b' && target[1] !== '1')) return false;
            const moves = this.activeChess.moves({ square: source, verbose: true });
            return moves.some(m => m.to === target && m.promotion);
        }

        showPromotionDialog(color, callback) {
            $('.mchess-promotion-overlay').remove();
            const colorPrefix = (color === 'w' || color === 'white') ? 'w' : 'b';
            const colorName = colorPrefix === 'w' ? 'White' : 'Black';

            const pieces = [
                { code: 'q', name: 'Queen', icon: colorPrefix === 'w' ? '♕' : '♛', key: 'Q / 1' },
                { code: 'r', name: 'Rook', icon: colorPrefix === 'w' ? '♖' : '♜', key: 'R / 2' },
                { code: 'b', name: 'Bishop', icon: colorPrefix === 'w' ? '♗' : '♝', key: 'B / 3' },
                { code: 'n', name: 'Knight', icon: colorPrefix === 'w' ? '♘' : '♞', key: 'N / 4' }
            ];

            const pieceThemeUrl = (pCode) => `https://chessboardjs.com/img/chesspieces/wikipedia/${colorPrefix}${pCode.toUpperCase()}.png`;

            const html = `
                <div class="mchess-promotion-overlay" id="mchessPromotionOverlay">
                    <div class="mchess-promotion-card" role="dialog" aria-modal="true" aria-labelledby="promoTitle">
                        <h3 class="mchess-promotion-title" id="promoTitle">
                            <i class="fas fa-chess-queen" style="color:#eab308;"></i>
                            Promote Your Pawn
                        </h3>
                        <p class="mchess-promotion-subtitle">Choose your promotion piece for ${colorName}</p>

                        <div class="promotion-piece-grid">
                            ${pieces.map(p => `
                                <button type="button" class="promotion-piece-btn" data-piece="${p.code}" title="Promote to ${p.name}">
                                    <img src="${pieceThemeUrl(p.code)}" alt="${p.name}" class="promotion-piece-img" onerror="this.outerHTML='<span style=\\'font-size:36px;\\'>${p.icon}</span>'">
                                    <span class="promotion-piece-name">${p.name}</span>
                                    <span class="promotion-piece-shortcut">${p.key}</span>
                                </button>
                            `).join('')}
                        </div>

                        <div style="margin-top: 10px;">
                            <button type="button" id="btnCancelPromotion" class="modal-btn modal-btn-secondary" style="font-size:12.5px; padding: 6px 16px;">
                                <i class="fas fa-times"></i> Cancel Move
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const $overlay = $(html);
            $('body').append($overlay);
            $overlay.find('.promotion-piece-btn').first().focus();

            const cleanup = () => {
                $(document).off('keydown.mchessPromotion');
                $overlay.fadeOut(150, function () {
                    $(this).remove();
                });
            };

            $overlay.on('click', '.promotion-piece-btn', function () {
                const piece = $(this).data('piece');
                cleanup();
                if (typeof callback === 'function') callback(piece);
            });

            $overlay.on('click', '#btnCancelPromotion', function () {
                cleanup();
                if (typeof callback === 'function') callback(null);
            });

            $(document).on('keydown.mchessPromotion', function (e) {
                if (e.key === 'Escape') {
                    cleanup();
                    if (typeof callback === 'function') callback(null);
                } else if (e.key === 'q' || e.key === 'Q' || e.key === '1') {
                    cleanup();
                    if (typeof callback === 'function') callback('q');
                } else if (e.key === 'r' || e.key === 'R' || e.key === '2') {
                    cleanup();
                    if (typeof callback === 'function') callback('r');
                } else if (e.key === 'b' || e.key === 'B' || e.key === '3') {
                    cleanup();
                    if (typeof callback === 'function') callback('b');
                } else if (e.key === 'n' || e.key === 'N' || e.key === '4') {
                    cleanup();
                    if (typeof callback === 'function') callback('n');
                }
            });
        }

        onDrop(source, target) {
            if (this.isPromotionMove(source, target)) {
                const turnColor = this.activeChess.turn();
                const self = this;
                this.showPromotionDialog(turnColor, (piece) => {
                    if (piece) {
                        self.executeMove(source, target, piece);
                    } else {
                        self.board.position(self.activeChess.fen());
                    }
                });
                return 'snapback';
            }

            return this.executeMove(source, target, 'q');
        }

        executeMove(source, target, promotionPiece = 'q') {
            const move = this.activeChess.move({
                from: source,
                to: target,
                promotion: promotionPiece
            });

            if (move === null) return 'snapback';

            this.board.position(this.activeChess.fen());

            // Audio effect
            if (this.activeChess.in_checkmate()) this.playSound('checkmate');
            else if (this.activeChess.in_draw() || this.activeChess.in_stalemate() || this.activeChess.in_threefold_repetition() || this.activeChess.insufficient_material()) this.playSound('stalemate');
            else if (this.activeChess.in_check()) this.playSound('check');
            else if (move.captured) this.playSound('capture');
            else this.playSound('move');

            this.isAnalysisMode = true;
            this.analysisMoves.push(move.san);
            this.updateModeBanner();
            this.updateAnalysisBox();
            this.updateButtonStates();
        }

        onSnapEnd() {
            this.board.position(this.activeChess.fen());
        }

        /**
         * Split multi-game PGN file into individual game strings
         */
        splitPgnFile(pgnText) {
            const games = [];
            const lines = pgnText.split(/\r?\n/);
            let currentGameLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('[Event ')) {
                    if (currentGameLines.length > 0) {
                        games.push(currentGameLines.join('\n').trim());
                        currentGameLines = [];
                    }
                }
                currentGameLines.push(line);
            }
            if (currentGameLines.length > 0) {
                games.push(currentGameLines.join('\n').trim());
            }
            return games.filter(g => g.length > 10);
        }

        /**
         * Load Direct PGN String (e.g. from My Games Review)
         */
        loadDirectPgn(pgnText) {
            if (!pgnText) return;
            this.pgnGames = [pgnText.trim()];
            this.$container.find('.game-select-wrapper').hide();
            this.loadGame(0);
        }

        /**
         * Load PGN file specified in data-pgn attribute
         */
        async loadPgnFile() {
            const self = this;
            try {
                const response = await fetch(this.pgnUrl);
                if (!response.ok) throw new Error("Could not load PGN file");
                const pgnText = await response.text();

                this.pgnGames = this.splitPgnFile(pgnText);
                const $select = this.$container.find(`#gameSelect_${this.uid}`);
                $select.empty();

                this.pgnGames.forEach((pgn, idx) => {
                    const tempChess = new Chess();
                    tempChess.load_pgn(pgn);
                    const h = tempChess.header();

                    let title = '';
                    const white = h.White && h.White !== '?' ? h.White : '';
                    const black = h.Black && h.Black !== '?' ? h.Black : '';
                    const eventName = h.Event && h.Event !== '?' ? h.Event : '';
                    const result = h.Result && h.Result !== '*' && h.Result !== '?' ? ` - ${h.Result}` : '';

                    if (eventName && (!white || white === 'White') && (!black || black === 'Black')) {
                        title = `${idx + 1}. ${eventName}${result}`;
                    } else if (white && black) {
                        const eventSuffix = (eventName && eventName !== 'Game' && eventName !== 'Match') ? ` (${eventName})` : '';
                        title = `${idx + 1}. ${white} vs ${black}${eventSuffix}${result}`;
                    } else if (eventName) {
                        title = `${idx + 1}. ${eventName}${result}`;
                    } else {
                        title = `${idx + 1}. Game #${idx + 1}${result}`;
                    }

                    const option = document.createElement("option");
                    option.value = idx;
                    option.textContent = title;
                    $select.append(option);
                });

                $select.off('change').on('change', function () {
                    self.loadGame(parseInt($(this).val(), 10));
                });

                if (this.pgnGames.length > 0) {
                    this.loadGame(0);
                }
            } catch (err) {
                console.error("[MChessBoard] PGN file load error:", err);
                this.$container.find(`#gameSelect_${this.uid}`).html("<option>Error loading PGN database.</option>");
            }
        }

        /**
         * Load individual PGN game by index
         */
        loadGame(index) {
            this.exitAnalysisMode();
            this.currentPgnIndex = index;
            const pgnString = this.pgnGames[index];
            if (!pgnString) return;

            this.mainChess = new Chess();
            let success = this.mainChess.load_pgn(pgnString);

            if (!success) {
                // If direct move text was supplied without headers, try wrapping it
                const wrappedPgn = `[Event "Match"]\n[White "White"]\n[Black "Black"]\n\n` + pgnString;
                success = this.mainChess.load_pgn(wrappedPgn);
            }

            if (!success) {
                // Try sanitizing variations/comments and retrying
                const sanitizedPgn = pgnString.replace(/\([^\)]*\)/g, '').replace(/\{[^\}]*\}/g, '').trim();
                success = this.mainChess.load_pgn(sanitizedPgn);
                if (!success) {
                    const wrappedPgn = `[Event "Match"]\n[White "White"]\n[Black "Black"]\n\n` + sanitizedPgn;
                    success = this.mainChess.load_pgn(wrappedPgn);
                }
            }

            if (!success) {
                console.error("[MChessBoard] Failed to load PGN at index", index);
                return;
            }

            const headers = this.mainChess.header();
            this.$container.find(`#whitePlayer_${this.uid}`).text(headers.White || "White Player");
            this.$container.find(`#blackPlayer_${this.uid}`).text(headers.Black || "Black Player");
            this.$container.find(`#gameResult_${this.uid}`).text(headers.Result || "*");
            this.$container.find(`#gameDate_${this.uid}`).text(headers.Date || "N/A");
            this.$container.find(`#gameSite_${this.uid}`).text(headers.Site || "mchess.eg1.in");
            this.$container.find(`#gameECO_${this.uid}`).text(headers.ECO ? headers.ECO : "N/A");

            this.mainHistory = this.mainChess.history({ verbose: true });
            const tempChess = new Chess();
            this.mainHistory.forEach(m => {
                tempChess.move(m);
                m.fen = tempChess.fen();
            });
            this.$container.find(`#moveCountBadge_${this.uid}`).text(`${this.mainHistory.length} moves`);

            this.renderMoveList();
            this.currentMoveIndex = -1;
            this.updatePosition(false);
        }

        renderMoveList() {
            const $container = this.$container.find(`#movesList_${this.uid}`);
            $container.empty();
            const self = this;

            for (let i = 0; i < this.mainHistory.length; i += 2) {
                const moveNum = Math.floor(i / 2) + 1;

                const numDiv = document.createElement("div");
                numDiv.className = "move-num";
                numDiv.textContent = `${moveNum}.`;
                $container.append(numDiv);

                const whiteMove = this.mainHistory[i];
                const whiteDiv = document.createElement("div");
                whiteDiv.className = "move-cell";
                whiteDiv.id = `move_${this.uid}_${i}`;
                whiteDiv.textContent = whiteMove.san;
                $(whiteDiv).on("click", () => self.goToMove(i));
                $container.append(whiteDiv);

                if (i + 1 < this.mainHistory.length) {
                    const blackMove = this.mainHistory[i + 1];
                    const blackDiv = document.createElement("div");
                    blackDiv.className = "move-cell";
                    blackDiv.id = `move_${this.uid}_${i + 1}`;
                    blackDiv.textContent = blackMove.san;
                    $(blackDiv).on("click", () => self.goToMove(i + 1));
                    $container.append(blackDiv);
                } else {
                    const emptyDiv = document.createElement("div");
                    $container.append(emptyDiv);
                }
            }
        }

        goToMove(targetIndex) {
            this.exitAnalysisMode();
            if (targetIndex < -1) targetIndex = -1;
            if (targetIndex >= this.mainHistory.length) targetIndex = this.mainHistory.length - 1;

            this.currentMoveIndex = targetIndex;
            this.updatePosition(true);
        }

        updatePosition(animated = true) {
            let targetFen = 'start';
            if (this.currentMoveIndex >= 0 && this.currentMoveIndex < this.mainHistory.length) {
                targetFen = this.mainHistory[this.currentMoveIndex].fen;
            }

            this.activeChess = new Chess(targetFen === 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : targetFen);
            if (this.board) {
                this.board.position(targetFen, animated);
            }

            if (animated && this.currentMoveIndex >= 0 && this.currentMoveIndex < this.mainHistory.length) {
                const curMove = this.mainHistory[this.currentMoveIndex];
                if (curMove && curMove.san) {
                    if (curMove.san.includes('x')) this.playSound('capture');
                    else if (curMove.san.includes('+') || curMove.san.includes('#')) this.playSound('check');
                    else this.playSound('move');
                }
            }

            this.$container.find(".move-cell").removeClass("active");
            if (this.currentMoveIndex >= 0) {
                const $activeCell = this.$container.find(`#move_${this.uid}_${this.currentMoveIndex}`);
                if ($activeCell.length) {
                    $activeCell.addClass("active");
                    const movesListEl = this.$container.find(`#movesList_${this.uid}`)[0];
                    if (movesListEl) {
                        const cellTop = $activeCell[0].offsetTop;
                        const cellHeight = $activeCell[0].offsetHeight;
                        const listScrollTop = movesListEl.scrollTop;
                        const listHeight = movesListEl.clientHeight;

                        if (cellTop < listScrollTop) {
                            movesListEl.scrollTop = Math.max(0, cellTop - 6);
                        } else if (cellTop + cellHeight > listScrollTop + listHeight) {
                            movesListEl.scrollTop = cellTop + cellHeight - listHeight + 6;
                        }
                    }
                }
            }

            this.updateButtonStates();
        }

        updateButtonStates() {
            if (this.isAnalysisMode) {
                this.$container.find(`#btnStart_${this.uid}`).prop("disabled", false);
                this.$container.find(`#btnPrev_${this.uid}`).prop("disabled", false);
                this.$container.find(`#btnNext_${this.uid}`).prop("disabled", true);
                this.$container.find(`#btnEnd_${this.uid}`).prop("disabled", true);
            } else {
                this.$container.find(`#btnStart_${this.uid}`).prop("disabled", this.currentMoveIndex === -1);
                this.$container.find(`#btnPrev_${this.uid}`).prop("disabled", this.currentMoveIndex === -1);
                this.$container.find(`#btnNext_${this.uid}`).prop("disabled", this.currentMoveIndex === this.mainHistory.length - 1);
                this.$container.find(`#btnEnd_${this.uid}`).prop("disabled", this.currentMoveIndex === this.mainHistory.length - 1);
            }
        }

        updateModeBanner() {
            const $banner = this.$container.find(`#modeBanner_${this.uid}`);
            const $modeText = this.$container.find(`#modeText_${this.uid}`);
            const $resetBtn = this.$container.find(`#btnResetAnalysis_${this.uid}`);

            if (this.isAnalysisMode) {
                $banner.attr("class", "mode-banner analysis-mode");
                let statusText = `<i class="fas fa-microscope"></i> Analysis Mode (${this.analysisMoves.length} custom move${this.analysisMoves.length > 1 ? 's' : ''})`;
                if (this.activeChess.in_checkmate()) {
                    statusText += " - <strong>Checkmate!</strong>";
                } else if (this.activeChess.in_draw()) {
                    statusText += " - <strong>Draw!</strong>";
                } else if (this.activeChess.in_check()) {
                    statusText += " - <strong>Check!</strong>";
                }
                $modeText.html(statusText);
                $resetBtn.show();
            } else {
                $banner.attr("class", "mode-banner game-line");
                $modeText.html(`<i class="fas fa-book-open"></i> Watching Main Game Line`);
                $resetBtn.hide();
            }
        }

        updateAnalysisBox() {
            const $box = this.$container.find(`#analysisBox_${this.uid}`);
            const $textSpan = this.$container.find(`#analysisMovesText_${this.uid}`);

            if (this.isAnalysisMode && this.analysisMoves.length > 0) {
                $box.show();
                $textSpan.text(" " + this.analysisMoves.join(" "));
            } else {
                $box.hide();
                $textSpan.text("");
            }
        }

        exitAnalysisMode() {
            this.stopAutoplay();
            this.clearTapHighlights();
            this.isAnalysisMode = false;
            this.analysisMoves = [];
            this.updateModeBanner();
            this.updateAnalysisBox();
            if (this.board) {
                let targetFen = 'start';
                if (this.currentMoveIndex >= 0 && this.currentMoveIndex < this.mainHistory.length) {
                    targetFen = this.mainHistory[this.currentMoveIndex].fen;
                }
                this.activeChess = new Chess(targetFen === 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : targetFen);
                this.board.position(targetFen, true);
            }
            this.updateButtonStates();
        }

        toggleAutoplay() {
            if (this.isAnalysisMode) this.exitAnalysisMode();
            if (this.autoplayTimer) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        }

        startAutoplay() {
            if (this.currentMoveIndex >= this.mainHistory.length - 1) {
                this.currentMoveIndex = -1;
            }
            const speed = parseInt(this.$container.find(`#autoplaySpeed_${this.uid}`).val(), 10) || 1000;
            const $playIcon = this.$container.find(`#playIcon_${this.uid}`);
            $playIcon.attr("class", "fas fa-pause");

            this.autoplayTimer = setInterval(() => {
                if (this.currentMoveIndex < this.mainHistory.length - 1) {
                    this.currentMoveIndex++;
                    this.updatePosition(true);
                } else {
                    this.stopAutoplay();
                }
            }, speed);
        }

        stopAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
            const $playIcon = this.$container.find(`#playIcon_${this.uid}`);
            if ($playIcon.length) $playIcon.attr("class", "fas fa-play");
        }

        flipBoard() {
            if (this.board) this.board.flip();
        }

        bindEvents() {
            const self = this;
            this.$container.find(`#btnStart_${this.uid}`).on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(-1);
            });
            this.$container.find(`#btnPrev_${this.uid}`).on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(self.currentMoveIndex - 1);
            });
            this.$container.find(`#btnNext_${this.uid}`).on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(self.currentMoveIndex + 1);
            });
            this.$container.find(`#btnEnd_${this.uid}`).on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(self.mainHistory.length - 1);
            });
            this.$container.find(`#btnPlay_${this.uid}`).on("click", () => self.toggleAutoplay());
            this.$container.find(`#btnFlip_${this.uid}`).on("click", () => self.flipBoard());
            this.$container.find(`#btnResetAnalysis_${this.uid}`).on("click", () => self.exitAnalysisMode());

            $(document).on(`keydown.mchessBoard_${this.uid}`, (e) => {
                if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    if (self.isAnalysisMode) self.exitAnalysisMode();
                    self.goToMove(self.currentMoveIndex - 1);
                } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    if (self.isAnalysisMode) self.exitAnalysisMode();
                    self.goToMove(self.currentMoveIndex + 1);
                } else if (e.key === " ") {
                    e.preventDefault();
                    self.toggleAutoplay();
                } else if (e.key === "Home") {
                    e.preventDefault();
                    if (self.isAnalysisMode) self.exitAnalysisMode();
                    self.goToMove(-1);
                } else if (e.key === "End") {
                    e.preventDefault();
                    if (self.isAnalysisMode) self.exitAnalysisMode();
                    self.goToMove(self.mainHistory.length - 1);
                }
            });
        }
    }

    // Auto-initialize MChessBoard on DOM ready
    $(document).ready(function () {
        if (document.documentElement) {
            document.documentElement.style.overflowX = 'hidden';
            document.documentElement.style.overflowY = 'auto';
        }
        if (document.body) {
            document.body.style.overflow = 'visible';
            document.body.style.position = 'static';
        }

        // Prevent native browser image drag on chess pieces
        $(document).on('dragstart', '.board-container img, .square-55d63 img, .piece-417db, body > img.piece-417db, body > img[class*="piece-"], .dragged-piece-4d2e8, [class*="piece-"]', function (e) {
            e.preventDefault();
            return false;
        });

        $('#mchessBoardContainer, [data-mchess-board]').each(function () {
            new MChessBoard(this);
        });
    });

    // Export globally
    window.MChessBoard = MChessBoard;

})(jQuery);
