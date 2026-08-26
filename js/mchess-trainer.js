/**
 * @file mchess-trainer.js
 * @description Fast-Paced Tactics Trainer & Checkmate Puzzle Solver Engine for Marwadi Chess.
 * Supports Mate in 2, 3, 4, 5, Sprint, Time Controls, 3-Mistakes Strike System, Auto-Advance, and Focused Zen Mode.
 * @project Marwadi Chess (mchess.eg1.in)
 */

(function ($) {
    'use strict';

    class MChessTrainer {
        constructor(containerEl, options) {
            this.$container = $(containerEl);
            this.options = $.extend({
                pgnPath: 'pgn/train.pgn',
                mode: 'mateIn2', // 'mateIn2', 'mateIn3', 'mateIn4', 'mateIn5', 'sprint', 'all'
                timeControl: 180 // Default 3 minutes (180 seconds)
            }, options);

            this.boardId = 'trainerBoard_' + Math.floor(Math.random() * 1000000);
            this.chess = new Chess();
            this.board = null;

            // Puzzle state
            this.allPuzzles = [];
            this.activeQueue = [];
            this.currentPuzzleIndex = 0;
            this.currentPuzzle = null;
            this.solutionMoves = [];
            this.solutionIndex = 0;
            this.playerTurnColor = 'w';

            // Game / Run state
            this.isPlaying = false;
            this.strikesLeft = 3;
            this.solvedCount = 0;
            this.attemptsCount = 0;
            this.currentStreak = 0;
            this.bestStreak = this.getStoredBestStreak();
            this.timeLeft = this.options.timeControl;
            this.clockTimer = null;
            this.stockfishWorker = null;

            // Tap-to-Move state
            this.selectedSquare = null;
            this.legalMoves = [];

            this.initAudio();
            this.initStockfishWorker();
            this.initLayout();
            this.loadPgnPuzzles();
            this.bindEvents();
        }

        initAudio() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.audioCtx = new AudioContext();
                }
            } catch (e) {
                console.warn("[MChessTrainer] Web Audio not available:", e);
            }
        }

        initStockfishWorker() {
            try {
                const workerBlob = new Blob([
                    `importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');`
                ], { type: 'application/javascript' });

                this.stockfishWorker = new Worker(URL.createObjectURL(workerBlob));
                this.stockfishWorker.postMessage('uci');
                this.stockfishWorker.postMessage('setoption name Skill Level value 20');
            } catch (err) {
                console.warn("[MChessTrainer] Stockfish Web Worker fallback:", err);
                this.stockfishWorker = null;
            }
        }

        playSound(type) {
            if (!this.audioCtx) return;
            try {
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }
                const now = this.audioCtx.currentTime;

                if (type === 'checkmate' || type === 'solved') {
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, i) => {
                        const osc = this.audioCtx.createOscillator();
                        const gain = this.audioCtx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, now + i * 0.07);
                        gain.gain.setValueAtTime(0.3, now + i * 0.07);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
                        osc.connect(gain);
                        gain.connect(this.audioCtx.destination);
                        osc.start(now + i * 0.07);
                        osc.stop(now + i * 0.07 + 0.3);
                    });
                    return;
                } else if (type === 'error') {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.setValueAtTime(150, now + 0.08);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    osc.start(now);
                    osc.stop(now + 0.25);
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

        getStoredBestStreak() {
            try {
                return parseInt(localStorage.getItem('mchess_trainer_best_streak') || '0', 10);
            } catch (e) {
                return 0;
            }
        }

        saveBestStreak(val) {
            try {
                localStorage.setItem('mchess_trainer_best_streak', val.toString());
            } catch (e) {}
        }

        initLayout() {
            if (this.$container.children().length > 0) return;

            const html = `
                <div class="pgn-viewer-container" style="max-width: 100%;">
                    <div class="demo-badge-header" style="flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center;">
                        <h2 class="demo-title" style="margin:0;">
                            <i class="fas fa-bolt" style="color:#eab308;"></i>
                            Tactics Trainer & Fast-Paced Puzzle Rush
                        </h2>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button id="btnEnterZenMode" class="btn-zen-mode" title="Enter Distraction-Free Focused Board">
                                <i class="fas fa-expand"></i> Focused Board Mode
                            </button>
                        </div>
                    </div>

                    <div id="trainerStatusBanner" class="mode-banner game-line" style="margin-bottom: 16px;">
                        <span id="trainerStatusText"><i class="fas fa-spinner fa-spin"></i> Loading tactical puzzle library...</span>
                        <div style="display:inline-flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <button id="btnTrainerRestartTop" class="btn-reset-analysis" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);" title="Restart Training Session">
                                <i class="fas fa-redo"></i> Restart
                            </button>
                            <button id="btnTrainerHint" class="btn-reset-analysis" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%);">
                                <i class="far fa-lightbulb"></i> Hint
                            </button>
                            <button id="btnTrainerSolution" class="btn-reset-analysis" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                                <i class="fas fa-eye"></i> Solution
                            </button>
                            <button id="btnTrainerSkip" class="btn-reset-analysis" style="background: linear-gradient(135deg, #475569 0%, #334155 100%);" title="Skip to Next Puzzle">
                                <i class="fas fa-forward"></i> Skip
                            </button>
                        </div>
                    </div>

                    <div class="viewer-grid">
                        <div class="board-column">
                            <div class="board-wrapper" id="trainerBoardWrapper">
                                <div id="${this.boardId}" class="board-container"></div>
                            </div>

                            <div class="controls-bar">
                                <button id="btnTrainerRestartBottom" class="btn-ctrl" style="border-color: rgba(34,197,94,0.4); color:#4ade80;" title="Restart Training Session">
                                    <i class="fas fa-redo"></i> Restart
                                </button>
                                <button id="btnTrainerResetPuzzle" class="btn-ctrl" title="Reset Current Position">
                                    <i class="fas fa-undo"></i> Reset
                                </button>
                                <button id="btnTrainerFlip" class="btn-ctrl" title="Flip Board">
                                    <i class="fas fa-sync-alt"></i> Flip
                                </button>
                                <button type="button" class="btn-ctrl btn-board-theme" title="Change Board Theme">
                                    <i class="fas fa-palette"></i> Theme
                                </button>
                                <select id="selTrainerTime" class="speed-select" title="Time Control">
                                    <option value="180" selected>⚡ 3 Minutes (Sprint)</option>
                                    <option value="300">⚡ 5 Minutes (Blitz)</option>
                                    <option value="0">♾️ Unlimited (Survival)</option>
                                </select>
                            </div>
                        </div>

                        <div class="info-column">
                            <div class="game-meta-card">
                                <div class="players-header" style="flex-wrap: wrap; gap: 8px;">
                                    <div class="player-box">
                                        <span class="player-badge white"></span>
                                        <span id="lblTrainerSideToMove">White to Move</span>
                                        <span id="trainerClockDisplay" class="tech-pill" style="margin-left: 6px; font-family: monospace; font-size: 14px; font-weight: bold; background: #0f172a; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">03:00</span>
                                    </div>
                                    
                                    <div class="strikes-container" id="strikesContainer" title="3 Strike Chances">
                                        <span style="font-size:12px; color:#94a3b8; font-weight:bold; margin-right:4px;">Chances:</span>
                                        <i class="fas fa-heart strike-heart" id="strikeHeart1"></i>
                                        <i class="fas fa-heart strike-heart" id="strikeHeart2"></i>
                                        <i class="fas fa-heart strike-heart" id="strikeHeart3"></i>
                                    </div>
                                </div>
                                <div class="meta-details" style="margin-top: 10px;">
                                    <span><i class="fas fa-trophy"></i> Solved: <strong id="lblTrainerSolvedCount">0</strong></span>
                                    <span><i class="fas fa-fire" style="color:#ef4444;"></i> Streak: <strong id="lblTrainerStreak">0</strong></span>
                                    <span><i class="fas fa-medal" style="color:#eab308;"></i> Best: <strong id="lblTrainerBestStreak">${this.bestStreak}</strong></span>
                                </div>
                            </div>

                            <div class="moves-panel">
                                <div class="moves-panel-header">
                                    <span id="lblPuzzleEventTitle"><i class="fas fa-puzzle-piece"></i> Puzzle Details</span>
                                    <span id="lblPuzzleThemeTag" class="tech-pill" style="padding: 2px 8px; font-size: 11px;">MATE IN 2</span>
                                </div>
                                <div id="trainerMovesList" class="moves-list">
                                    <!-- Move notation will be rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Focused Board Mode Fullscreen Overlay -->
                <div id="zenTrainerOverlay" class="zen-modal-overlay">
                    <div class="zen-board-shell">
                        <div class="zen-topbar">
                            <div class="zen-topbar-info">
                                <span><i class="fas fa-chess-knight" style="color:#38bdf8;"></i> <span id="zenSideLabel">White to Move</span></span>
                                <span id="zenClockBadge" class="tech-pill" style="background:#0f172a; color:#38bdf8; font-family:monospace;">03:00</span>
                                <div class="strikes-container" id="zenStrikesContainer">
                                    <i class="fas fa-heart strike-heart" id="zenHeart1"></i>
                                    <i class="fas fa-heart strike-heart" id="zenHeart2"></i>
                                    <i class="fas fa-heart strike-heart" id="zenHeart3"></i>
                                </div>
                            </div>
                            <div class="zen-topbar-actions">
                                <span style="color:#fbbf24; font-weight:bold; font-size:13px; margin-right:8px;"><i class="fas fa-trophy"></i> <span id="zenSolvedBadge">0</span> Solved</span>
                                <button id="btnExitZen" class="btn-exit-zen" title="Exit Focused Mode (Esc)">
                                    <i class="fas fa-compress"></i> Exit Focus
                                </button>
                            </div>
                        </div>
                        <div class="board-wrapper" style="max-width: 520px; width: 100%;">
                            <div id="zenBoardSlot" class="board-container"></div>
                        </div>
                    </div>
                </div>

                <!-- Training Session Game Over Summary Modal -->
                <div id="modalTrainerSummary" class="modal-overlay" style="display: none;">
                    <div class="modal-card">
                        <div class="modal-icon-circle warning" id="summaryIconCircle">
                            <i class="fas fa-flag-checkered"></i>
                        </div>
                        <h2 class="modal-title" id="summaryTitle">Session Complete!</h2>
                        <p class="modal-description" id="summaryDesc">Great calculation workout! Here is your performance summary:</p>

                        <div class="summary-stat-grid">
                            <div class="summary-stat-box">
                                <div class="val" id="sumSolved">0</div>
                                <div class="lbl">Puzzles Solved</div>
                            </div>
                            <div class="summary-stat-box">
                                <div class="val" id="sumAccuracy">100%</div>
                                <div class="lbl">Accuracy</div>
                            </div>
                            <div class="summary-stat-box">
                                <div class="val" id="sumStreak">0</div>
                                <div class="lbl">Best Streak</div>
                            </div>
                            <div class="summary-stat-box">
                                <div class="val" id="sumBestRecord">${this.bestStreak}</div>
                                <div class="lbl">All-Time Best</div>
                            </div>
                        </div>

                        <div class="modal-btn-row">
                            <button id="btnTrainerRestart" class="modal-btn modal-btn-success">
                                <i class="fas fa-redo"></i> Play Again
                            </button>
                            <button id="btnTrainerReviewLast" class="modal-btn modal-btn-secondary">
                                Review Position
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.$container.html(html);
        }

        /**
         * Load and parse multi-game PGN puzzles from train.pgn
         */
        async loadPgnPuzzles() {
            try {
                const res = await fetch(this.options.pgnPath + '?_t=' + Date.now());
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const pgnText = await res.text();
                this.allPuzzles = this.parseMultiPgn(pgnText);
                this.filterQueueAndStart(this.options.mode);
            } catch (err) {
                console.error("[MChessTrainer] Failed to load train.pgn:", err);
                this.updateStatusBanner(`<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i> Could not load train.pgn database.`);
            }
        }

        parseMultiPgn(pgnText) {
            const rawGames = pgnText.split(/\n\s*\n(?=\[Event)/g);
            const list = [];

            rawGames.forEach((gStr, idx) => {
                const trimmed = gStr.trim();
                if (!trimmed) return;

                const eventMatch = trimmed.match(/\[Event\s+"([^"]+)"\]/i);
                const fenMatch = trimmed.match(/\[FEN\s+"([^"]+)"\]/i);
                const themeMatch = trimmed.match(/\[Theme\s+"([^"]+)"\]/i);

                const cleanMoves = trimmed.replace(/\[[^\]]+\]/g, '').replace(/\{[^\}]*\}/g, '').trim();

                if (fenMatch && fenMatch[1]) {
                    list.push({
                        id: idx + 1,
                        event: eventMatch ? eventMatch[1] : `Puzzle #${idx + 1}`,
                        fen: fenMatch[1],
                        theme: themeMatch ? themeMatch[1] : 'mateIn2',
                        pgnMoves: cleanMoves
                    });
                }
            });

            return list;
        }

        filterQueueAndStart(mode) {
            this.options.mode = mode || 'all';
            let matched = [];

            if (this.options.mode === 'all') {
                matched = [...this.allPuzzles];
            } else {
                matched = this.allPuzzles.filter(p => p.theme === this.options.mode);
            }

            // Fallback if none matched
            if (matched.length === 0) matched = [...this.allPuzzles];

            // Shuffle active queue for fast-paced variety
            this.activeQueue = this.shuffleArray(matched);
            this.currentPuzzleIndex = 0;
            this.resetRunStats();
            this.loadActivePuzzle();
        }

        shuffleArray(arr) {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        }

        resetRunStats() {
            this.stopClock();
            this.isPlaying = true;
            this.strikesLeft = 3;
            this.solvedCount = 0;
            this.attemptsCount = 0;
            this.currentStreak = 0;
            this.timeLeft = parseInt(this.options.timeControl, 10);
            this.updateStrikesUI();
            this.updateStatsUI();
            this.updateClockUI();
        }

        loadActivePuzzle() {
            if (this.currentPuzzleIndex >= this.activeQueue.length) {
                // Loop back with re-shuffle
                this.activeQueue = this.shuffleArray(this.activeQueue);
                this.currentPuzzleIndex = 0;
            }

            this.currentPuzzle = this.activeQueue[this.currentPuzzleIndex];
            if (!this.currentPuzzle) return;

            const normalizedFen = (typeof MChessFenParser !== 'undefined')
                ? MChessFenParser.normalizeFen(this.currentPuzzle.fen)
                : this.currentPuzzle.fen;

            this.chess = new Chess();
            this.chess.load(normalizedFen);

            this.playerTurnColor = this.chess.turn();
            const playerColorText = this.playerTurnColor === 'w' ? 'White' : 'Black';

            this.solutionMoves = this.extractSolutionMoves(this.currentPuzzle.pgnMoves, normalizedFen);
            this.solutionIndex = 0;

            // Calculate strict maximum allowed player moves from theme or solution length
            let themeMoves = 0;
            if (this.currentPuzzle.theme) {
                const match = this.currentPuzzle.theme.match(/mateIn(\d+)/i);
                if (match) themeMoves = parseInt(match[1], 10);
            }
            const solutionPlayerMoves = Math.ceil(this.solutionMoves.length / 2);
            this.maxPlayerMoves = Math.max(themeMoves || solutionPlayerMoves || 1, 1);
            this.playerMovesPlayed = 0;

            // UI updates
            this.$container.find('#lblTrainerSideToMove, #zenSideLabel').text(`${playerColorText} to Move`);
            this.$container.find('#lblPuzzleEventTitle').html(`<i class="fas fa-puzzle-piece"></i> ${this.currentPuzzle.event}`);
            this.$container.find('#lblPuzzleThemeTag').text((this.currentPuzzle.theme || 'TACTICS').toUpperCase());

            const themeColor = this.currentPuzzle.theme === 'mateIn2' ? '#38bdf8' : (this.currentPuzzle.theme === 'mateIn3' ? '#a855f7' : '#eab308');
            this.$container.find('#lblPuzzleThemeTag').css({ background: `${themeColor}22`, color: themeColor, border: `1px solid ${themeColor}55` });

            this.updateStatusBanner(`<i class="fas fa-bolt" style="color:#eab308;"></i> <strong>${playerColorText} to move.</strong> Find the tactical sequence!`);

            this.renderBoard(normalizedFen, playerColorText.toLowerCase());
            this.renderMovesList();
            this.clearTapHighlights();
            this.bindTapToMove();
        }

        extractSolutionMoves(pgnMoveStr, fen) {
            const tempChess = new Chess();
            tempChess.load(fen);
            const tokens = pgnMoveStr.split(/\s+/).filter(t => t && !t.match(/^\d+\./) && t !== '*');
            const moves = [];

            tokens.forEach(tok => {
                const cleanTok = tok.replace(/[\+#!\?]/g, '');
                const m = tempChess.move(cleanTok) || tempChess.move(tok);
                if (m) {
                    moves.push({ from: m.from, to: m.to, san: m.san, promotion: m.promotion || 'q' });
                }
            });

            return moves;
        }

        renderBoard(fen, orientation) {
            const self = this;
            const boardEl = document.getElementById(this.boardId);
            if (!boardEl) return;

            if (!this.board) {
                this.board = Chessboard(boardEl, {
                    position: fen,
                    orientation: orientation || 'white',
                    draggable: true,
                    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
                    onDragStart: (source, piece) => self.onDragStart(source, piece),
                    onDrop: (source, target) => self.onDrop(source, target),
                    onSnapEnd: () => self.onSnapEnd()
                });

                if (window.ResizeObserver) {
                    this.resizeObserver = new ResizeObserver(() => {
                        if (self.board) self.board.resize();
                    });
                    this.resizeObserver.observe(boardEl);
                }
            } else {
                this.board.orientation(orientation || 'white');
                this.board.position(fen, true);
            }
        }

        startClock() {
            if (this.clockTimer || this.timeLeft === 0) return;
            const self = this;

            this.clockTimer = setInterval(() => {
                self.timeLeft--;
                self.updateClockUI();
                if (self.timeLeft <= 0) {
                    self.timeLeft = 0;
                    self.stopClock();
                    self.endTrainingSession('Time Up!');
                }
            }, 1000);
        }

        stopClock() {
            if (this.clockTimer) {
                clearInterval(this.clockTimer);
                this.clockTimer = null;
            }
        }

        updateClockUI() {
            const str = (this.timeLeft === 0 && this.options.timeControl === 0)
                ? '∞'
                : `${Math.floor(this.timeLeft / 60).toString().padStart(2, '0')}:${(this.timeLeft % 60).toString().padStart(2, '0')}`;
            this.$container.find('#trainerClockDisplay, #zenClockBadge').text(str);
        }

        updateStrikesUI() {
            for (let i = 1; i <= 3; i++) {
                const $h = this.$container.find(`#strikeHeart${i}, #zenHeart${i}`);
                if (i > this.strikesLeft) {
                    $h.addClass('lost');
                } else {
                    $h.removeClass('lost');
                }
            }
        }

        updateStatsUI() {
            this.$container.find('#lblTrainerSolvedCount, #zenSolvedBadge').text(this.solvedCount);
            this.$container.find('#lblTrainerStreak').text(this.currentStreak);
            this.$container.find('#lblTrainerBestStreak, #sumBestRecord').text(this.bestStreak);
        }

        /**
         * Tap-to-Move with Capture Bug Fix
         */
        bindTapToMove() {
            const self = this;
            const $board = this.$container.find('#' + this.boardId);

            $board.off('click', '[class*="square-"]').on('click', '[class*="square-"]', function (e) {
                if (!self.isPlaying) {
                    self.updateStatusBanner('<i class="fas fa-flag-checkered" style="color:#eab308;"></i> <strong>Session Ended.</strong> Click <a href="javascript:void(0)" class="link-restart-trainer" style="color:#38bdf8; text-decoration:underline; font-weight:bold;">Restart Session</a> or <strong>Skip</strong> to start fresh!');
                    return;
                }
                if (self.chess.game_over()) return;

                const $targetSq = $(this).closest('[class*="square-"]');
                const clickedSquare = $targetSq.attr('data-square') || (($targetSq.attr('class') || '').match(/square-([a-h][1-8])/) || [])[1];
                if (!clickedSquare) return;

                const pieceOnSquare = self.chess.get(clickedSquare);
                const isMyPiece = pieceOnSquare && pieceOnSquare.color === self.playerTurnColor;
                const isMyTurn = self.chess.turn() === self.playerTurnColor;

                if (!isMyTurn && !self.selectedSquare) return;

                // CASE 1: Piece is already selected
                if (self.selectedSquare) {
                    const isLegalDest = self.legalMoves && self.legalMoves.some(m => m.to === clickedSquare);

                    if (isLegalDest) {
                        const fromSq = self.selectedSquare;
                        self.clearTapHighlights();
                        const snapResult = self.onDrop(fromSq, clickedSquare);
                        if (snapResult !== 'snapback') {
                            self.board.position(self.chess.fen());
                        }
                        return;
                    } else if (isMyPiece && clickedSquare !== self.selectedSquare) {
                        self.selectSquareForTap(clickedSquare);
                        return;
                    } else {
                        self.clearTapHighlights();
                        return;
                    }
                }

                // CASE 2: Select piece
                if (isMyPiece && isMyTurn) {
                    self.selectSquareForTap(clickedSquare);
                }
            });
        }

        selectSquareForTap(square) {
            this.clearTapHighlights();
            this.selectedSquare = square;
            this.legalMoves = this.chess.moves({ square: square, verbose: true });

            this.$container.find(`.square-${square}`).addClass('square-selected');
            this.legalMoves.forEach(m => {
                const $dest = this.$container.find(`.square-${m.to}`);
                $dest.addClass('dest-highlight');
                if (m.captured) $dest.addClass('dest-capture');
            });
        }

        clearTapHighlights() {
            this.selectedSquare = null;
            this.legalMoves = [];
            this.$container.find('[class*="square-"]').removeClass('square-selected dest-highlight dest-capture');
        }

        onDragStart(source, piece) {
            if (!this.isPlaying) {
                this.updateStatusBanner('<i class="fas fa-flag-checkered" style="color:#eab308;"></i> <strong>Session Ended.</strong> Click <a href="javascript:void(0)" class="link-restart-trainer" style="color:#38bdf8; text-decoration:underline; font-weight:bold;">Restart Session</a> or <strong>Skip</strong> to start fresh!');
                return false;
            }
            if (this.chess.game_over()) return false;

            const isWhiteTurn = this.chess.turn() === 'w';
            const isBlackTurn = this.chess.turn() === 'b';
            const isPieceWhite = piece.search(/^w/) !== -1;
            const isPieceBlack = piece.search(/^b/) !== -1;

            if ((isWhiteTurn && isPieceBlack) || (isBlackTurn && isPieceWhite)) {
                // Do not clear tap highlights when clicking opponent piece to capture
                return false;
            }

            this.clearTapHighlights();
        }

        isPromotionMove(source, target) {
            const piece = this.chess.get(source);
            if (!piece || piece.type !== 'p') return false;
            if ((piece.color === 'w' && target[1] !== '8') || (piece.color === 'b' && target[1] !== '1')) return false;
            const moves = this.chess.moves({ square: source, verbose: true });
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
                const turnColor = this.chess.turn();
                const self = this;
                this.showPromotionDialog(turnColor, (piece) => {
                    if (piece) {
                        self.executePlayerMove(source, target, piece);
                    } else {
                        self.board.position(self.chess.fen());
                    }
                });
                return 'snapback';
            }

            return this.executePlayerMove(source, target, 'q');
        }

        executePlayerMove(source, target, promotionPiece = 'q') {
            this.startClock();
            this.attemptsCount++;

            const prevFen = this.chess.fen();
            const move = this.chess.move({
                from: source,
                to: target,
                promotion: promotionPiece
            });

            if (move === null) {
                this.board.position(this.chess.fen());
                return 'snapback';
            }

            const promoChar = (move.promotion || promotionPiece || '').toLowerCase();
            const playedMoveUci = `${source}${target}${promoChar}`;

            this.board.position(this.chess.fen());
            this.playerMovesPlayed++;

            // 1. Immediate Checkmate Rule: Any legal checkmate move immediately solves the puzzle!
            if (this.chess.in_checkmate()) {
                this.playSound('checkmate');
                this.renderMovesList();
                this.onPuzzleSolved();
                return;
            }

            const expectedMove = this.solutionMoves[this.solutionIndex];
            const isCorrect = expectedMove && (
                (typeof expectedMove === 'object' && source === expectedMove.from && target === expectedMove.to && (expectedMove.promotion ? expectedMove.promotion.toLowerCase() === promotionPiece.toLowerCase() : true)) ||
                (typeof expectedMove === 'object' && move.san === expectedMove.san) ||
                (typeof expectedMove === 'string' && (
                    playedMoveUci === expectedMove.toLowerCase() ||
                    `${source}${target}` === expectedMove.toLowerCase() ||
                    (move.san || '').toLowerCase() === expectedMove.toLowerCase()
                ))
            );

            if (isCorrect) {
                this.solutionIndex++;
                if (this.chess.in_checkmate()) this.playSound('checkmate');
                else if (this.chess.in_check()) this.playSound('check');
                else if (move.captured) this.playSound('capture');
                else this.playSound('move');

                this.renderMovesList();

                if (this.solutionIndex >= this.solutionMoves.length) {
                    // Fully solved!
                    this.onPuzzleSolved();
                } else {
                    // Play opponent's automatic response
                    this.updateStatusBanner(`<i class="fas fa-check" style="color:#16a34a;"></i> Good move! Continue sequence...`);
                    const self = this;
                    setTimeout(() => {
                        const counter = self.solutionMoves[self.solutionIndex];
                        if (counter) {
                            self.chess.move({ from: counter.from, to: counter.to, promotion: counter.promotion || 'q' });
                            self.board.position(self.chess.fen(), true);
                            self.solutionIndex++;
                            self.renderMovesList();
                            if (self.solutionIndex >= self.solutionMoves.length || self.chess.in_checkmate() || self.chess.game_over()) {
                                self.onPuzzleSolved();
                            }
                        }
                    }, 350);
                }
            } else if (this.stockfishWorker) {
                // Stockfish Dynamic Defense for unscripted forced mate branches
                this.evaluateAlternativeMove(playedMoveUci, prevFen);
            } else {
                this.handleIncorrectMove();
                return 'snapback';
            }
        }

        async evaluateAlternativeMove(playedUci, prevFen) {
            if (!this.stockfishWorker) {
                this.handleIncorrectMove();
                return;
            }

            // Strict rule: If player has reached or exceeded maxPlayerMoves and position is not checkmate, fail immediately!
            if (this.maxPlayerMoves && this.playerMovesPlayed >= this.maxPlayerMoves) {
                this.updateStatusBanner(`<i class="fas fa-times-circle" style="color:#ef4444;"></i> <strong>Incorrect!</strong> Does not force Mate in ${this.maxPlayerMoves}.`);
                this.handleIncorrectMove();
                return;
            }

            this.updateStatusBanner(`<i class="fas fa-robot fa-spin" style="color:#38bdf8;"></i> Analyzing best move with Stockfish...`);

            try {
                // Scaled search time: Mate in 2 = 2000ms, Mate in 3 = 4000ms, Mate in 4 = 6000ms
                let evalTime = 2000;
                if (this.maxPlayerMoves === 3) evalTime = 4000;
                else if (this.maxPlayerMoves >= 4) evalTime = 6000;

                // 1. Verify if the played move matches Stockfish's top calculated bestmove from the position before the move
                const prevEval = await this.queryStockfishEval(prevFen, evalTime);
                const isTopMove = prevEval.bestMove && (
                    playedUci === prevEval.bestMove ||
                    playedUci.startsWith(prevEval.bestMove) ||
                    prevEval.bestMove.startsWith(playedUci)
                );

                // 2. Or verify if the resulting position directly forces checkmate against the opponent within strict remaining move budget
                let isForcedMate = false;
                if (!isTopMove && this.maxPlayerMoves) {
                    const postEval = await this.queryStockfishEval(this.chess.fen(), Math.min(2500, evalTime));
                    if (postEval.mateVal !== null && postEval.mateVal < 0) {
                        const remainingMoves = this.maxPlayerMoves - this.playerMovesPlayed;
                        if (Math.abs(postEval.mateVal) <= remainingMoves) {
                            isForcedMate = true;
                        }
                    }
                }

                if (isTopMove || isForcedMate) {
                    this.updateStatusBanner(`<i class="fas fa-check" style="color:#16a34a;"></i> <strong>Best move!</strong> Opponent defending...`);
                    this.renderMovesList();

                    // Query opponent's best defense reply
                    const defEval = await this.queryStockfishEval(this.chess.fen(), 1200);
                    const defMove = defEval.bestMove;

                    const self = this;
                    setTimeout(() => {
                        let m = null;
                        if (defMove) {
                            m = self.playUciDefenseMove(defMove);
                        }
                        if (self.chess.in_checkmate() || self.chess.game_over()) {
                            self.onPuzzleSolved();
                        } else if (defMove) {
                            const playedSan = m ? m.san : defMove;
                            self.updateStatusBanner(`<i class="fas fa-crosshairs" style="color:#eab308;"></i> Opponent defended with <strong>${playedSan}</strong>.`);
                        }
                    }, 350);
                } else {
                    this.updateStatusBanner(`<i class="fas fa-times-circle" style="color:#ef4444;"></i> <strong>Incorrect!</strong> Does not force Mate in ${this.maxPlayerMoves}.`);
                    this.handleIncorrectMove();
                }
            } catch (err) {
                console.warn("[MChessTrainer] Alternative move eval error:", err);
                this.handleIncorrectMove();
            }
        }

        queryStockfishEval(fen, timeoutMs = 2000) {
            return new Promise((resolve) => {
                if (!this.stockfishWorker) {
                    resolve({ isMateForPlayer: false, mateVal: null, cpScore: null, bestMove: null });
                    return;
                }

                let bestMove = null;
                let isMateForPlayer = false;
                let mateVal = null;
                let cpScore = null;
                let resolved = false;

                const timer = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        this.stockfishWorker.onmessage = null;
                        resolve({ isMateForPlayer, mateVal, cpScore, bestMove });
                    }
                }, timeoutMs);

                this.stockfishWorker.onmessage = (event) => {
                    const line = typeof event.data === 'string' ? event.data : '';

                    if (line.includes('score mate')) {
                        const matchMate = line.match(/score mate (-?\d+)/);
                        if (matchMate) {
                            const val = parseInt(matchMate[1], 10);
                            if (val < 0) {
                                isMateForPlayer = true;
                                mateVal = val;
                            } else {
                                mateVal = val;
                            }
                        }
                    } else if (line.includes('score cp')) {
                        const matchCp = line.match(/score cp (-?\d+)/);
                        if (matchCp) {
                            cpScore = parseInt(matchCp[1], 10);
                        }
                    }

                    if (line.startsWith('bestmove')) {
                        const matchMove = line.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
                        if (matchMove && matchMove[1]) {
                            bestMove = matchMove[1];
                        }
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timer);
                            this.stockfishWorker.onmessage = null;
                            resolve({ isMateForPlayer, mateVal, cpScore, bestMove });
                        }
                    }
                };

                const movetime = Math.max(500, timeoutMs - 200);
                const depth = timeoutMs >= 5000 ? 18 : (timeoutMs >= 3500 ? 16 : 14);
                this.stockfishWorker.postMessage(`position fen ${fen}`);
                this.stockfishWorker.postMessage(`go depth ${depth} movetime ${movetime}`);
            });
        }

        playUciDefenseMove(uciString) {
            if (!uciString) return null;
            const from = uciString.substring(0, 2);
            const to = uciString.substring(2, 4);
            const promotion = uciString.length > 4 ? uciString.substring(4, 5) : 'q';

            const move = this.chess.move({ from: from, to: to, promotion: promotion });
            if (move) {
                if (this.chess.in_checkmate()) this.playSound('checkmate');
                else if (this.chess.in_check()) this.playSound('check');
                else if (move.captured) this.playSound('capture');
                else this.playSound('move');

                this.board.position(this.chess.fen(), true);
                this.renderMovesList();
                return move;
            }
            return null;
        }

        handleIncorrectMove() {
            this.playSound('error');
            this.onIncorrectMove();
            this.chess.undo();
            if (this.playerMovesPlayed > 0) this.playerMovesPlayed--;
            this.board.position(this.chess.fen());
        }

        onSnapEnd() {
            this.board.position(this.chess.fen());
        }

        onPuzzleSolved() {
            this.playSound('solved');
            this.solvedCount++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) {
                this.bestStreak = this.currentStreak;
                this.saveBestStreak(this.bestStreak);
            }

            this.updateStatsUI();
            this.updateStatusBanner(`<i class="fas fa-trophy" style="color:#d4af37;"></i> 🎉 <strong>Solved! Auto-loading next...</strong>`);

            const self = this;
            setTimeout(() => {
                self.currentPuzzleIndex++;
                self.loadActivePuzzle();
            }, 600);
        }

        onIncorrectMove() {
            this.strikesLeft--;
            this.currentStreak = 0;
            this.updateStrikesUI();
            this.updateStatsUI();

            this.$container.find('#trainerBoardWrapper, .zen-board-shell').addClass('shake-effect');
            setTimeout(() => {
                this.$container.find('#trainerBoardWrapper, .zen-board-shell').removeClass('shake-effect');
            }, 400);

            if (this.strikesLeft <= 0) {
                this.strikesLeft = 0;
                this.updateStrikesUI();
                this.endTrainingSession('3 Strikes! Out of Chances');
            } else {
                this.updateStatusBanner(`<i class="fas fa-times-circle" style="color:#ef4444;"></i> <strong>Incorrect! ${this.strikesLeft} ${this.strikesLeft === 1 ? 'chance' : 'chances'} remaining.</strong>`);
            }
        }

        endTrainingSession(reasonTitle) {
            this.stopClock();
            this.isPlaying = false;

            const accuracy = this.attemptsCount > 0 ? Math.round((this.solvedCount / this.attemptsCount) * 100) : 0;
            $('#summaryTitle').text(reasonTitle || 'Session Complete!');
            $('#sumSolved').text(this.solvedCount);
            $('#sumAccuracy').text(`${accuracy}%`);
            $('#sumStreak').text(this.currentStreak);
            $('#sumBestRecord').text(this.bestStreak);

            this.updateStatusBanner('<i class="fas fa-flag-checkered" style="color:#eab308;"></i> <strong>Session Ended.</strong> Click <a href="javascript:void(0)" class="link-restart-trainer" style="color:#38bdf8; text-decoration:underline; font-weight:bold;">Restart Session</a> or <strong>Skip</strong> to start fresh!');

            $('#modalTrainerSummary').css('display', 'flex').hide().fadeIn(250);
        }

        restartSession() {
            $('#modalTrainerSummary').fadeOut(150);
            this.filterQueueAndStart(this.options.mode);
        }

        triggerHint() {
            const expectedMove = this.solutionMoves[this.solutionIndex];
            if (expectedMove) {
                this.clearTapHighlights();
                const $fromSq = this.$container.find(`.square-${expectedMove.from}`);
                $fromSq.css('box-shadow', 'inset 0 0 16px 4px #eab308');
                this.updateStatusBanner(`<i class="far fa-lightbulb" style="color:#eab308;"></i> Hint: Try moving piece from <strong>${expectedMove.from.toUpperCase()}</strong>.`);
                setTimeout(() => $fromSq.css('box-shadow', ''), 2000);
            }
        }

        revealSolution() {
            if (!this.currentPuzzle || !this.solutionMoves.length) return;
            const self = this;
            this.chess.load(this.currentPuzzle.fen);
            this.board.position(this.chess.fen());

            let idx = 0;
            const interval = setInterval(() => {
                if (idx < self.solutionMoves.length) {
                    const m = self.solutionMoves[idx];
                    self.chess.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
                    self.board.position(self.chess.fen(), true);
                    self.playSound('move');
                    self.renderMovesList();
                    idx++;
                } else {
                    clearInterval(interval);
                    self.updateStatusBanner(`<i class="fas fa-eye" style="color:#38bdf8;"></i> Solution displayed. Click Reset or Skip to continue.`);
                }
            }, 600);
        }

        renderMovesList() {
            const history = this.chess.history({ verbose: true });
            const $list = this.$container.find('#trainerMovesList');
            $list.empty();

            const rows = [];
            for (let i = 0; i < history.length; i += 2) {
                const moveNum = Math.floor(i / 2) + 1;
                const numDiv = `<div class="move-num">${moveNum}.</div>`;
                const whiteDiv = `<div class="move-cell active">${history[i].san}</div>`;
                let blackDiv = `<div></div>`;
                if (i + 1 < history.length) {
                    blackDiv = `<div class="move-cell active">${history[i + 1].san}</div>`;
                }
                rows.push(numDiv + whiteDiv + blackDiv);
            }

            // Append in reverse order so latest move is at the top
            for (let r = rows.length - 1; r >= 0; r--) {
                $list.append(rows[r]);
            }
        }

        updateStatusBanner(html) {
            this.$container.find('#trainerStatusText').html(html);
        }

        openZenMode() {
            const $zenOverlay = $('#zenTrainerOverlay');
            const $zenSlot = $('#zenBoardSlot');
            $zenSlot.empty();

            $zenOverlay.css('display', 'flex').hide().fadeIn(250);
            $('body').css('overflow', 'hidden');

            const zenBoard = Chessboard('zenBoardSlot', {
                position: this.chess.fen(),
                orientation: this.playerTurnColor === 'w' ? 'white' : 'black',
                draggable: true,
                pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
                onDragStart: (s, p) => this.onDragStart(s, p),
                onDrop: (s, t) => {
                    const res = this.onDrop(s, t);
                    if (res !== 'snapback') {
                        zenBoard.position(this.chess.fen());
                    }
                    return res;
                },
                onSnapEnd: () => zenBoard.position(this.chess.fen())
            });

            this.zenBoard = zenBoard;
        }

        closeZenMode() {
            const self = this;
            $('#zenTrainerOverlay').fadeOut(200, function () {
                $(this).css('display', 'none');
                $('#zenBoardSlot').empty();
                $('body').css('overflow', 'auto');
                if (self.board) self.board.position(self.chess.fen(), true);
            });
        }

        bindEvents() {
            const self = this;

            // Mode switcher buttons
            $(document).on('click', '.mode-chip-btn', function () {
                $('.mode-chip-btn').removeClass('active');
                $(this).addClass('active');
                const mode = $(this).data('mode');
                self.filterQueueAndStart(mode);
            });

            // Time control change
            this.$container.find('#selTrainerTime').on('change', function () {
                self.options.timeControl = parseInt($(this).val(), 10);
                self.filterQueueAndStart(self.options.mode);
            });

            // Action controls
            this.$container.find('#btnTrainerRestartTop, #btnTrainerRestartBottom').on('click', () => self.restartSession());
            this.$container.on('click', '.link-restart-trainer', () => self.restartSession());
            this.$container.find('#btnTrainerHint').on('click', () => self.triggerHint());
            this.$container.find('#btnTrainerSolution').on('click', () => self.revealSolution());
            this.$container.find('#btnTrainerSkip').on('click', () => {
                if (!self.isPlaying) {
                    self.restartSession();
                    return;
                }
                self.currentPuzzleIndex++;
                self.loadActivePuzzle();
            });
            this.$container.find('#btnTrainerResetPuzzle').on('click', () => {
                if (!self.isPlaying) {
                    self.restartSession();
                    return;
                }
                if (self.currentPuzzle) self.loadActivePuzzle();
            });
            this.$container.find('#btnTrainerFlip').on('click', () => {
                if (self.board) self.board.flip();
            });

            // Zen Focused Mode
            this.$container.find('#btnEnterZenMode').on('click', () => self.openZenMode());
            $(document).on('click', '#btnExitZen', () => self.closeZenMode());
            $(document).on('keydown.zenTrainer', (e) => {
                if (e.key === 'Escape') self.closeZenMode();
            });

            // Restart / Summary modal
            $('#btnTrainerRestart').on('click', () => {
                self.restartSession();
            });
            $('#btnTrainerReviewLast').on('click', () => {
                $('#modalTrainerSummary').fadeOut(150);
                self.updateStatusBanner('<i class="fas fa-flag-checkered" style="color:#eab308;"></i> <strong>Reviewing Position.</strong> Click <a href="javascript:void(0)" class="link-restart-trainer" style="color:#38bdf8; text-decoration:underline; font-weight:bold;">Restart Session</a> or <strong>Skip</strong> to start a new workout.');
            });
        }
    }

    window.MChessTrainer = MChessTrainer;

    $(document).ready(function () {
        $('#mchessTrainerContainer').each(function () {
            if (!$(this).data('mchess-trainer-init')) {
                $(this).data('mchess-trainer-init', true);
                new MChessTrainer(this);
            }
        });
    });

})(jQuery);
