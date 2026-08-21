/**
 * @file mchess-engine-board.js
 * @description Interactive Open-Source Stockfish Engine Board, Timed Game Arena & Puzzle Solver Component for MCHESS.
 * Connects Stockfish.js Web Worker to Chessboard.js, fetches Lichess Daily Puzzle API, powers timed games (3m, 5m, 10m, 30m) with live clocks.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    class MChessEngineBoard {
        constructor(containerEl, options) {
            this.$container = $(containerEl);

            // Read data-fen from element or options
            const rawFen = options && options.fen ? options.fen : (this.$container.attr('data-fen') || this.$container.data('fen'));
            const normalizedFen = (typeof MChessFenParser !== 'undefined')
                ? MChessFenParser.normalizeFen(rawFen)
                : (rawFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

            this.options = $.extend({
                mode: this.$container.data('mode') || 'engine', // 'engine', 'puzzle', 'daily'
                fen: normalizedFen,
                skillLevel: 10, // 0 to 20 Stockfish skill level
                orientation: 'white',
                timeControl: 5 // Default 5 minutes clock
            }, options);

            this.boardId = 'stockfishBoard_' + Math.floor(Math.random() * 1000000);
            this.userSide = this.options.orientation || 'white'; // 'white' or 'black'
            this.chess = new Chess();
            this.board = null;
            this.stockfishWorker = null;
            this.isEngineThinking = false;
            
            // Clock & Game Timer State
            this.timeControlMinutes = parseInt(this.options.timeControl, 10) || 5;
            this.whiteTime = this.timeControlMinutes * 60;
            this.blackTime = this.timeControlMinutes * 60;
            this.clockInterval = null;
            this.gameSaved = false;

            // Move history navigation state
            this.historyFen = []; // Array of { fen: string, san: string, ply: number }
            this.currentPly = 0;

            // Puzzle specific state
            this.puzzleData = null;
            this.solutionMoves = [];
            this.solutionIndex = 0;
            this.scoreStreak = 0;

            this.initLayout();
            this.initEngineWorker();

            if (this.options.mode === 'daily') {
                this.fetchDailyPuzzle();
            } else {
                this.setupPosition(this.options.fen, this.userSide);
            }

            this.bindEvents();
        }

        /**
         * Inject responsive board & engine UI layout
         */
        initLayout() {
            if (this.$container.children().length > 0) return;

            const isDailyOrPuzzle = (this.options.mode === 'daily' || this.options.mode === 'puzzle');
            const headerTitle = isDailyOrPuzzle ? 'Daily Chess Puzzle & Tactics Trainer' : 'Play vs Stockfish Computer Engine';
            const techPill = isDailyOrPuzzle ? 'Official Lichess Daily API & Stockfish' : 'Stockfish #1 Open-Source Engine';

            const html = `
                <div class="pgn-viewer-container">
                    <div class="demo-badge-header">
                        <h2 class="demo-title">
                            <i class="fas ${isDailyOrPuzzle ? 'fa-puzzle-piece' : 'fa-robot'}"></i>
                            ${headerTitle}
                        </h2>
                        <span class="tech-pill">
                            <i class="fas fa-microscope"></i> ${techPill}
                        </span>
                    </div>

                    <div id="engineStatusBanner" class="mode-banner game-line" style="margin-bottom: 16px;">
                        <span id="engineStatusText"><i class="fas fa-info-circle"></i> Initializing Stockfish Chess Engine...</span>
                        <div id="puzzleActionBtns" style="display: none; gap: 8px;">
                            <button id="btnSolve" class="btn-reset-analysis" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
                                <i class="fas fa-eye"></i> Solution
                            </button>
                            <button id="btnNextPuzzle" class="btn-reset-analysis" style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                                <i class="fas fa-forward"></i> Next
                            </button>
                        </div>
                    </div>

                    <div class="viewer-grid">
                        <div class="board-column">
                            <div class="board-wrapper">
                                <div id="${this.boardId}" class="board-container"></div>
                            </div>

                            <div class="controls-bar">
                                <button id="btnEngineFirst" class="btn-ctrl" title="First Move (<|)">
                                    <i class="fas fa-fast-backward"></i>
                                </button>
                                <button id="btnEnginePrev" class="btn-ctrl" title="Previous Move (<)">
                                    <i class="fas fa-step-backward"></i>
                                </button>
                                <button id="btnEngineNext" class="btn-ctrl" title="Next Move (>)">
                                    <i class="fas fa-step-forward"></i>
                                </button>
                                <button id="btnEngineLast" class="btn-ctrl" title="Last Move (|>)">
                                    <i class="fas fa-fast-forward"></i>
                                </button>
                                <button id="btnEngineHintMain" class="btn-ctrl" title="Get Move Hint" style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #fff;">
                                    <i class="far fa-lightbulb"></i> Hint
                                </button>
                                <button id="btnEngineReset" class="btn-ctrl" title="Reset Position">
                                    <i class="fas fa-undo"></i> Reset
                                </button>
                                <button id="btnEngineFlip" class="btn-ctrl" title="Flip Board">
                                    <i class="fas fa-sync-alt"></i> Flip
                                </button>
                                ${!isDailyOrPuzzle ? `
                                <select id="userSideSelect" class="speed-select" title="Choose Side to Play">
                                    <option value="white" selected>Play as White ♔</option>
                                    <option value="black">Play as Black ♚</option>
                                </select>
                                <select id="timeControlSelect" class="speed-select" title="Game Time Control">
                                    <option value="0">Unlimited Time</option>
                                    <option value="3">3 Minutes (Blitz)</option>
                                    <option value="5" selected>5 Minutes (Blitz)</option>
                                    <option value="10">10 Minutes (Rapid)</option>
                                    <option value="30">30 Minutes (Classical)</option>
                                </select>
                                ` : ''}
                                <select id="engineLevelSelect" class="speed-select" title="Engine Difficulty Level">
                                    <option value="1">Level 1 (Easy)</option>
                                    <option value="5">Level 5 (Casual)</option>
                                    <option value="10" selected>Level 10 (Intermediate)</option>
                                    <option value="15">Level 15 (Advanced)</option>
                                    <option value="20">Level 20 (Grandmaster)</option>
                                </select>
                            </div>
                            <div class="kb-hint">
                                <i class="far fa-keyboard"></i> <strong>Use Left/Right Arrow keys or controls to navigate move history!</strong>
                            </div>
                        </div>

                        <div class="info-column">
                            <div class="game-meta-card">
                                <div class="players-header" style="flex-wrap: wrap; gap: 8px;">
                                    <div class="player-box">
                                        <span class="player-badge white"></span>
                                        <span id="engineWhitePlayer">White</span>
                                        <span id="whiteClockDisplay" class="tech-pill" style="margin-left: 6px; font-family: monospace; font-size: 13px; font-weight: bold; background: #0f172a; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">05:00</span>
                                    </div>
                                    <span class="result-badge" id="engineResultBadge">Active</span>
                                    <div class="player-box">
                                        <span id="blackClockDisplay" class="tech-pill" style="margin-right: 6px; font-family: monospace; font-size: 13px; font-weight: bold; background: #0f172a; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">05:00</span>
                                        <span class="player-badge black"></span>
                                        <span id="engineBlackPlayer">Stockfish Computer</span>
                                    </div>
                                </div>
                                <div class="meta-details">
                                    <span><i class="fas fa-chess-king"></i> Side to Move: <strong id="engineSideToMove">White</strong></span>
                                    <span><i class="fas fa-trophy"></i> Solved Streak: <strong id="puzzleStreakBadge">0</strong></span>
                                </div>
                            </div>

                            <div class="moves-panel">
                                <div class="moves-panel-header">
                                    <span><i class="fas fa-list-ol"></i> Game & Move History</span>
                                    <span id="engineMoveCount" style="font-weight:normal; font-size:12px; color:#64748b;">0 moves</span>
                                </div>
                                <div id="engineMovesList" class="moves-list"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.$container.html(html);
            this.updateClockDisplays();
        }

        /**
         * Initialize Stockfish Web Worker Engine
         */
        initEngineWorker() {
            const self = this;
            try {
                // Stockfish CDN Web Worker URL
                const workerBlob = new Blob([
                    `importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');`
                ], { type: 'application/javascript' });

                this.stockfishWorker = new Worker(URL.createObjectURL(workerBlob));

                this.stockfishWorker.onmessage = function (event) {
                    const line = event.data;
                    if (typeof line === 'string' && line.startsWith('bestmove')) {
                        const match = line.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
                        if (match && match[1]) {
                            if (self.isRequestingHint) {
                                self.isRequestingHint = false;
                                self.showEngineHint(match[1]);
                            } else {
                                self.onEngineMoveFound(match[1]);
                            }
                        }
                    }
                };

                this.stockfishWorker.postMessage('uci');
                this.stockfishWorker.postMessage(`setoption name Skill Level value ${this.options.skillLevel}`);
                this.updateStatusBanner(`<i class="fas fa-check-circle" style="color:#16a34a;"></i> Stockfish Engine Ready! Make your move.`);

                // If user selected Black at start in engine mode, trigger engine's first move
                if (this.options.mode === 'engine' && this.userSide === 'black' && this.chess.history().length === 0) {
                    setTimeout(() => self.requestEngineMove(), 300);
                }
            } catch (err) {
                console.warn("[MChessEngineBoard] Stockfish Web Worker fallback:", err);
                this.updateStatusBanner(`<i class="fas fa-info-circle"></i> Engine Ready (Local Engine Validation)`);
            }
        }

        /**
         * Setup position and initialize board
         */
        setupPosition(fen, orientation) {
            this.stopClockTimer();
            this.gameSaved = false;
            this.whiteTime = this.timeControlMinutes * 60;
            this.blackTime = this.timeControlMinutes * 60;
            this.updateClockDisplays();

            const normalizedFen = (typeof MChessFenParser !== 'undefined')
                ? MChessFenParser.normalizeFen(fen)
                : (fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

            this.chess = new Chess();
            let success = this.chess.load(normalizedFen);

            if (!success) {
                const boardOnly = normalizedFen.split(' ')[0] + ' w - - 0 1';
                success = this.chess.load(boardOnly);
                if (!success) {
                    console.warn("[MChessEngineBoard] Strict chess.js validation notice for FEN:", normalizedFen);
                }
            }

            const turn = (success && this.chess.turn) ? this.chess.turn() : (normalizedFen.includes(' b ') ? 'b' : 'w');
            const sideText = turn === 'w' ? 'White' : 'Black';
            this.$container.find('#engineSideToMove').text(sideText);

            // Update player labels based on chosen user side
            if (this.userSide === 'black') {
                this.$container.find('#engineWhitePlayer').text('Stockfish Computer');
                this.$container.find('#engineBlackPlayer').text('You (Black)');
            } else {
                this.$container.find('#engineWhitePlayer').text('You (White)');
                this.$container.find('#engineBlackPlayer').text('Stockfish Computer');
            }

            const boardOrientation = orientation || this.userSide || (turn === 'w' ? 'white' : 'black');
            const displayFen = success ? this.chess.fen() : normalizedFen.split(' ')[0];

            // Reset history FEN array for move jumping
            this.historyFen = [{ fen: displayFen, san: 'Start', ply: 0 }];
            this.currentPly = 0;

            if (!this.board) {
                const self = this;
                const boardEl = this.$container.find('#' + this.boardId)[0] || this.$container.find('.board-container')[0] || this.$container[0];

                if (!boardEl) {
                    console.error("[MChessEngineBoard] Board container element not found for Chessboard initialization");
                    return;
                }

                this.board = Chessboard(boardEl, {
                    position: displayFen,
                    orientation: boardOrientation,
                    draggable: true,
                    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
                    onDragStart: (source, piece) => self.onDragStart(source, piece),
                    onDrop: (source, target) => self.onDrop(source, target),
                    onSnapEnd: () => self.onSnapEnd()
                });

                $(window).on('resize orientationchange', () => {
                    if (self.board) self.board.resize();
                });
            } else {
                this.board.orientation(boardOrientation);
                this.board.position(displayFen, true);
            }

            this.renderMovesList();

            // Auto-start Stockfish if player chose Black and it's White's turn
            if (this.options.mode === 'engine' && this.userSide === 'black' && turn === 'w' && this.chess.history().length === 0) {
                const self = this;
                setTimeout(() => self.requestEngineMove(), 300);
            }
        }

        /**
         * Clock Timer Controls
         */
        startClockTimer() {
            if (this.timeControlMinutes === 0 || this.chess.game_over()) {
                this.stopClockTimer();
                return;
            }

            const self = this;
            this.stopClockTimer();

            this.clockInterval = setInterval(() => {
                const turn = self.chess.turn();
                if (turn === 'w') {
                    self.whiteTime--;
                    if (self.whiteTime <= 0) {
                        self.whiteTime = 0;
                        self.updateClockDisplays();
                        self.stopClockTimer();
                        self.handleTimeout('White');
                        return;
                    }
                } else {
                    self.blackTime--;
                    if (self.blackTime <= 0) {
                        self.blackTime = 0;
                        self.updateClockDisplays();
                        self.stopClockTimer();
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
                this.$container.find('#whiteClockDisplay').text('∞');
                this.$container.find('#blackClockDisplay').text('∞');
            } else {
                this.$container.find('#whiteClockDisplay').text(this.formatTime(this.whiteTime));
                this.$container.find('#blackClockDisplay').text(this.formatTime(this.blackTime));
            }
        }

        handleTimeout(flaggedSide) {
            const winner = flaggedSide === 'White' ? 'Black' : 'White';
            const resultText = winner === 'White' ? '1-0' : '0-1';
            this.updateStatusBanner(`<i class="fas fa-hourglass-end" style="color:#ef4444;"></i> <strong>Time Out! ${flaggedSide} ran out of time. ${winner} wins!</strong>`);

            if (typeof MChessGameHistory !== 'undefined' && !this.gameSaved) {
                this.gameSaved = true;
                const whitePlayer = this.$container.find('#engineWhitePlayer').text() || 'White';
                const blackPlayer = this.$container.find('#engineBlackPlayer').text() || 'Black';
                MChessGameHistory.saveGame({
                    white: whitePlayer,
                    black: blackPlayer,
                    result: resultText + ' (Time Out)',
                    moveCount: this.chess.history().length,
                    pgn: this.chess.pgn(),
                    mode: `${this.options.mode} (${this.timeControlMinutes}m)`
                });
            }
        }

        /**
         * Fetch Official Lichess Daily Puzzle API
         */
        async fetchDailyPuzzle() {
            this.updateStatusBanner(`<i class="fas fa-spinner fa-spin"></i> Fetching Daily Puzzle from Lichess API...`);
            try {
                const response = await fetch('https://lichess.org/api/puzzle/daily');
                if (!response.ok) throw new Error("Could not fetch daily puzzle");
                const data = await response.json();

                this.puzzleData = data;
                const puzzleFen = data.game.tree ? data.game.tree[data.puzzle.initialPly].fen : data.puzzle.fen;
                this.solutionMoves = data.puzzle.solution || [];
                this.solutionIndex = 0;

                const tempChess = new Chess();
                tempChess.load(MChessFenParser.normalizeFen(puzzleFen));
                const puzzleTurn = tempChess.turn() === 'w' ? 'white' : 'black';

                this.$container.find('#puzzleActionBtns').css('display', 'inline-flex');
                this.$container.find('#engineWhitePlayer').text(`Puzzle #${data.puzzle.id} (Rating: ${data.puzzle.rating})`);
                this.$container.find('#engineBlackPlayer').text(`Themes: ${(data.puzzle.themes || []).slice(0,2).join(', ')}`);

                this.setupPosition(tempChess.fen(), puzzleTurn);
                this.updateStatusBanner(`<i class="fas fa-puzzle-piece" style="color:#d4af37;"></i> Daily Puzzle: <strong>${puzzleTurn.toUpperCase()} to move</strong>. Find the best move!`);

            } catch (err) {
                console.error("[MChessEngineBoard] Daily Puzzle API error:", err);
                this.updateStatusBanner(`<i class="fas fa-exclamation-triangle"></i> Offline Daily Puzzle Mode Loaded.`);
                this.setupPosition('r1bqk2r/pppp1Bpp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4', 'black');
            }
        }

        onDragStart(source, piece) {
            if (this.chess.game_over() || this.isEngineThinking) return false;

            // Ensure player is at latest ply before making new move
            if (this.currentPly < this.historyFen.length - 1) {
                this.jumpToPly(this.historyFen.length - 1);
            }

            // Only allow dragging pieces that belong to the user's chosen side
            if (this.options.mode === 'engine') {
                if (this.userSide === 'white' && piece.search(/^b/) !== -1) return false;
                if (this.userSide === 'black' && piece.search(/^w/) !== -1) return false;
            }

            // Turn check
            if ((this.chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (this.chess.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
        }

        onDrop(source, target) {
            const move = this.chess.move({
                from: source,
                to: target,
                promotion: 'q'
            });

            if (move === null) return 'snapback';

            // Start game clock on first move
            this.startClockTimer();

            // Record FEN step for move navigation
            this.historyFen.push({
                fen: this.chess.fen(),
                san: move.san,
                ply: this.historyFen.length
            });
            this.currentPly = this.historyFen.length - 1;

            if (this.options.mode === 'daily' || this.options.mode === 'puzzle') {
                const playedMoveUci = `${source}${target}`;
                const expectedMove = this.solutionMoves[this.solutionIndex];

                if (expectedMove && (playedMoveUci === expectedMove || move.san === expectedMove)) {
                    this.solutionIndex++;
                    this.updateStatusBanner(`<i class="fas fa-check" style="color:#16a34a;"></i> Correct move!`);

                    if (this.solutionIndex < this.solutionMoves.length) {
                        const counterUci = this.solutionMoves[this.solutionIndex];
                        this.solutionIndex++;
                        const self = this;
                        setTimeout(() => {
                            self.playUciMove(counterUci);
                            self.updateStatusBanner(`<i class="fas fa-puzzle-piece" style="color:#d4af37;"></i> Continue calculation...`);
                        }, 400);
                    } else {
                        this.scoreStreak++;
                        this.$container.find('#puzzleStreakBadge').text(this.scoreStreak);
                        this.updateStatusBanner(`<i class="fas fa-trophy" style="color:#d4af37;"></i> 🎉 <strong>Puzzle Solved! Great Job!</strong>`);
                    }
                } else if (this.solutionMoves.length > 0) {
                    this.updateStatusBanner(`<i class="fas fa-times-circle" style="color:#dc2626;"></i> Incorrect move, try again!`);
                    this.chess.undo();
                    this.historyFen.pop();
                    this.currentPly = this.historyFen.length - 1;
                    return 'snapback';
                }
            } else {
                if (!this.chess.game_over()) {
                    this.requestEngineMove();
                }
            }

            this.renderMovesList();
            this.checkGameOver();
        }

        onSnapEnd() {
            this.board.position(this.chess.fen());
        }

        playUciMove(uciString) {
            if (!uciString) return;
            const from = uciString.substring(0, 2);
            const to = uciString.substring(2, 4);
            const promotion = uciString.length > 4 ? uciString.substring(4, 5) : 'q';

            const move = this.chess.move({ from: from, to: to, promotion: promotion });
            if (move) {
                this.historyFen.push({
                    fen: this.chess.fen(),
                    san: move.san,
                    ply: this.historyFen.length
                });
                this.currentPly = this.historyFen.length - 1;

                this.board.position(this.chess.fen(), true);
                this.renderMovesList();
                this.checkGameOver();
            }
        }

        requestEngineMove() {
            if (!this.stockfishWorker || this.chess.game_over()) return;

            this.isEngineThinking = true;
            this.updateStatusBanner(`<i class="fas fa-cog fa-spin"></i> Stockfish is thinking...`);
            this.stockfishWorker.postMessage(`position fen ${this.chess.fen()}`);
            this.stockfishWorker.postMessage('go movetime 400');
        }

        onEngineMoveFound(uciMove) {
            this.isEngineThinking = false;
            this.playUciMove(uciMove);
            this.startClockTimer();
            this.updateStatusBanner(`<i class="fas fa-robot"></i> Stockfish played ${uciMove}. Your turn!`);
        }

        /**
         * Request Move Hint from Stockfish or Puzzle Solution
         */
        triggerHint() {
            if (this.solutionMoves.length > 0 && this.solutionIndex < this.solutionMoves.length) {
                const nextMove = this.solutionMoves[this.solutionIndex];
                const fromSq = nextMove.substring(0, 2);
                const toSq = nextMove.substring(2, 4);
                this.updateStatusBanner(`<i class="far fa-lightbulb" style="color:#d4af37;"></i> Puzzle Hint: Try moving piece from <strong>${fromSq.toUpperCase()}</strong> to <strong>${toSq.toUpperCase()}</strong>.`);
                this.removeHighlights();
                this.highlightSquare(fromSq);
                return;
            }

            if (this.stockfishWorker && !this.chess.game_over()) {
                this.isRequestingHint = true;
                this.updateStatusBanner(`<i class="fas fa-spinner fa-spin"></i> Analyzing best move with Stockfish...`);
                this.stockfishWorker.postMessage(`position fen ${this.chess.fen()}`);
                this.stockfishWorker.postMessage('go movetime 300');
            } else {
                const moves = this.chess.moves({ verbose: true });
                if (moves.length > 0) {
                    const sampleMove = moves[0];
                    this.updateStatusBanner(`<i class="far fa-lightbulb" style="color:#d4af37;"></i> Engine Hint: Consider <strong>${sampleMove.san}</strong> (${sampleMove.from.toUpperCase()} to ${sampleMove.to.toUpperCase()}).`);
                    this.removeHighlights();
                    this.highlightSquare(sampleMove.from);
                }
            }
        }

        showEngineHint(uciMove) {
            if (!uciMove) return;
            const fromSq = uciMove.substring(0, 2);
            const toSq = uciMove.substring(2, 4);
            this.updateStatusBanner(`<i class="far fa-lightbulb" style="color:#d4af37;"></i> Stockfish Hint: Recommended move is <strong>${fromSq.toUpperCase()} -> ${toSq.toUpperCase()}</strong>.`);
            this.removeHighlights();
            this.highlightSquare(fromSq);
        }

        highlightSquare(square) {
            const $squareEl = this.$container.find(`.square-${square}`);
            if ($squareEl.length) {
                $squareEl.css('box-shadow', 'inset 0 0 16px 4px #eab308');
            }
        }

        removeHighlights() {
            this.$container.find('[class*="square-"]').css('box-shadow', '');
        }

        /**
         * Jump board to specific move ply
         */
        jumpToPly(plyIndex) {
            if (plyIndex < 0 || plyIndex >= this.historyFen.length) return;
            this.currentPly = plyIndex;
            const item = this.historyFen[plyIndex];

            if (this.board) {
                this.board.position(item.fen, true);
            }

            this.$container.find('.move-cell').removeClass('active');
            if (plyIndex > 0) {
                this.$container.find(`.move-cell[data-ply="${plyIndex}"]`).addClass('active');
            }
        }

        checkGameOver() {
            let isGameOver = false;
            let resultText = '*';

            if (this.chess.in_checkmate()) {
                isGameOver = true;
                const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
                resultText = winner === 'White' ? '1-0' : '0-1';
                this.updateStatusBanner(`<i class="fas fa-crown" style="color:#d4af37;"></i> <strong>Checkmate! ${winner} wins!</strong> (Saved to History)`);
            } else if (this.chess.in_draw()) {
                isGameOver = true;
                resultText = '1/2-1/2';
                this.updateStatusBanner(`<i class="fas fa-handshake"></i> <strong>Game Draw!</strong> (Saved to History)`);
            }

            if (isGameOver) {
                this.stopClockTimer();
                if (typeof MChessGameHistory !== 'undefined' && !this.gameSaved) {
                    this.gameSaved = true;
                    const whitePlayer = this.$container.find('#engineWhitePlayer').text() || 'White';
                    const blackPlayer = this.$container.find('#engineBlackPlayer').text() || 'Black';
                    MChessGameHistory.saveGame({
                        white: whitePlayer,
                        black: blackPlayer,
                        result: resultText,
                        moveCount: this.chess.history().length,
                        pgn: this.chess.pgn(),
                        mode: `${this.options.mode} (${this.timeControlMinutes}m)`
                    });
                }
            }
        }

        renderMovesList() {
            const history = this.chess.history({ verbose: true });
            const $container = this.$container.find('#engineMovesList');
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

            this.$container.find('#engineMoveCount').text(`${history.length} moves`);
        }

        updateStatusBanner(htmlMessage) {
            this.$container.find('#engineStatusText').html(htmlMessage);
        }

        bindEvents() {
            const self = this;

            // Side selection (Play as White vs Play as Black)
            this.$container.find('#userSideSelect').on('change', function () {
                const side = $(this).val();
                self.userSide = side;
                self.setupPosition(self.options.fen, side);
            });

            // Time control selection (3m, 5m, 10m, 30m, Unlimited)
            this.$container.find('#timeControlSelect').on('change', function () {
                const mins = parseInt($(this).val(), 10);
                self.timeControlMinutes = mins;
                self.setupPosition(self.options.fen, self.userSide);
            });

            // Navigation Controls: First |<, Prev <, Next >, Last >|
            this.$container.find('#btnEngineFirst').on('click', () => self.jumpToPly(0));
            this.$container.find('#btnEnginePrev').on('click', () => self.jumpToPly(self.currentPly - 1));
            this.$container.find('#btnEngineNext').on('click', () => self.jumpToPly(self.currentPly + 1));
            this.$container.find('#btnEngineLast').on('click', () => self.jumpToPly(self.historyFen.length - 1));

            // Hint Buttons
            this.$container.find('#btnEngineHintMain, #btnHint').on('click', () => self.triggerHint());

            // Click move cell to jump
            this.$container.on('click', '.move-cell', function () {
                const ply = parseInt($(this).data('ply'), 10);
                if (!isNaN(ply)) {
                    self.jumpToPly(ply);
                }
            });

            // Keyboard Arrow Shortcuts (Left = Prev, Right = Next)
            $(document).on('keydown', function (e) {
                if ($(e.target).is('input, textarea, select')) return;

                if (e.key === 'ArrowLeft' || e.keyCode === 37) {
                    e.preventDefault();
                    self.jumpToPly(self.currentPly - 1);
                } else if (e.key === 'ArrowRight' || e.keyCode === 39) {
                    e.preventDefault();
                    self.jumpToPly(self.currentPly + 1);
                }
            });

            this.$container.find('#btnEngineReset').on('click', () => {
                if (self.options.mode === 'daily') {
                    self.fetchDailyPuzzle();
                } else {
                    self.setupPosition(self.options.fen, self.userSide);
                }
            });

            this.$container.find('#btnEngineFlip').on('click', () => {
                if (self.board) self.board.flip();
            });

            this.$container.find('#engineLevelSelect').on('change', function () {
                const lvl = parseInt($(this).val(), 10);
                self.options.skillLevel = lvl;
                if (self.stockfishWorker) {
                    self.stockfishWorker.postMessage(`setoption name Skill Level value ${lvl}`);
                }
            });

            this.$container.find('#btnSolve').on('click', () => {
                if (self.solutionMoves.length > 0 && self.solutionIndex < self.solutionMoves.length) {
                    const nextMove = self.solutionMoves[self.solutionIndex];
                    self.playUciMove(nextMove);
                    self.solutionIndex++;
                }
            });

            this.$container.find('#btnNextPuzzle').on('click', () => {
                self.fetchDailyPuzzle();
            });
        }
    }

    // Global Export & Auto-initialize MChessEngineBoard
    window.MChessEngineBoard = MChessEngineBoard;

    $(document).ready(function () {
        // Guarantee documentElement and body scroll container integrity for Chessboard.js dragged piece coordinates
        if (document.documentElement) {
            document.documentElement.style.overflowX = 'hidden';
            document.documentElement.style.overflowY = 'auto';
        }
        if (document.body) {
            document.body.style.overflow = 'visible';
            document.body.style.position = 'static';
        }

        // Prevent native browser image drag on chess pieces so Chessboard.js JS handles 100% of movement
        $(document).on('dragstart', '.board-container img, .square-55d63 img, .piece-417db, body > img.piece-417db, body > img[class*="piece-"], .dragged-piece-4d2e8, [class*="piece-"]', function (e) {
            e.preventDefault();
            return false;
        });

        $('#mchessPuzzleContainer, #mchessEngineBoardContainer, #mchessBlogEngineBoard, [data-mchess-engine]').each(function () {
            if (!$(this).data('mchess-initialized')) {
                $(this).data('mchess-initialized', true);
                new MChessEngineBoard(this);
            }
        });
    });

})(jQuery);
