/**
 * @file mchess-board.js
 * @description Centralized controller for MCHESS Interactive PGN Viewer & Analysis Board.
 * Automatically injects responsive board UI, parses PGN files, handles move stepping, and enables drag & drop analysis mode.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    class MChessBoard {
        constructor(containerEl) {
            this.$container = $(containerEl);
            this.pgnUrl = this.$container.data('pgn') || './pgn/pgn_games.pgn';
            
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

            this.initLayout();
            this.initBoard();
            this.loadPgnFile();
            this.bindEvents();
        }

        /**
         * Inject the complete PGN Viewer HTML layout into container if empty
         */
        initLayout() {
            if (this.$container.children().length > 0) return;

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

                    <div class="game-select-wrapper">
                        <label for="gameSelect"><i class="fas fa-trophy"></i> Select Game from Database:</label>
                        <select id="gameSelect" class="game-select">
                            <option value="">Loading games from database...</option>
                        </select>
                    </div>

                    <div class="viewer-grid">
                        <div class="board-column">
                            <div class="board-wrapper">
                                <div id="board" class="board-container"></div>
                            </div>

                            <div class="controls-bar">
                                <button id="btnStart" class="btn-ctrl" title="First Move (Home)">
                                    <i class="fas fa-fast-backward"></i>
                                </button>
                                <button id="btnPrev" class="btn-ctrl" title="Previous Move (Left Arrow)">
                                    <i class="fas fa-step-backward"></i>
                                </button>
                                <button id="btnPlay" class="btn-ctrl" title="Play / Pause (Spacebar)">
                                    <i class="fas fa-play" id="playIcon"></i>
                                </button>
                                <button id="btnNext" class="btn-ctrl" title="Next Move (Right Arrow)">
                                    <i class="fas fa-step-forward"></i>
                                </button>
                                <button id="btnEnd" class="btn-ctrl" title="Last Move (End)">
                                    <i class="fas fa-fast-forward"></i>
                                </button>
                                <button id="btnFlip" class="btn-ctrl" title="Flip Board">
                                    <i class="fas fa-sync-alt"></i> Flip
                                </button>
                                <select id="autoplaySpeed" class="speed-select" title="Autoplay Speed">
                                    <option value="2000">2s / move</option>
                                    <option value="1000" selected>1s / move</option>
                                    <option value="500">0.5s / move</option>
                                </select>
                            </div>
                            <div class="kb-hint">
                                <i class="far fa-keyboard"></i> <strong>Drag pieces to analyze custom moves anytime!</strong><br />
                                Shortcuts: <strong>&larr; &rarr;</strong> step, <strong>Space</strong> play/pause, <strong>Home/End</strong> jump.
                            </div>
                        </div>

                        <div class="info-column">
                            <div class="game-meta-card">
                                <div class="players-header">
                                    <div class="player-box">
                                        <span class="player-badge white"></span>
                                        <span id="whitePlayer">White Player</span>
                                    </div>
                                    <span class="result-badge" id="gameResult">1-0</span>
                                    <div class="player-box">
                                        <span class="player-badge black"></span>
                                        <span id="blackPlayer">Black Player</span>
                                    </div>
                                </div>
                                <div class="meta-details">
                                    <span><i class="far fa-calendar-alt"></i> <strong id="gameDate">N/A</strong></span>
                                    <span><i class="fas fa-map-marker-alt"></i> <strong id="gameSite">N/A</strong></span>
                                    <span><i class="fas fa-bookmark"></i> ECO: <strong id="gameECO">N/A</strong></span>
                                </div>
                            </div>

                            <div id="modeBanner" class="mode-banner game-line">
                                <span id="modeText"><i class="fas fa-book-open"></i> Watching Main Game Line</span>
                                <button id="btnResetAnalysis" class="btn-reset-analysis" style="display: none;">
                                    <i class="fas fa-undo"></i> Back to Game
                                </button>
                            </div>

                            <div class="moves-panel">
                                <div class="moves-panel-header">
                                    <span><i class="fas fa-list-ol"></i> Game Move List</span>
                                    <span id="moveCountBadge" style="font-weight:normal; font-size:12px; color:#64748b;">0 moves</span>
                                </div>
                                <div id="movesList" class="moves-list"></div>
                            </div>

                            <div id="analysisBox" class="analysis-moves-box" style="display: none;">
                                <strong><i class="fas fa-vial"></i> Trial Variation:</strong>
                                <span id="analysisMovesText"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.$container.html(html);
        }

        /**
         * Initialize Chessboard.js with Drag & Drop handlers
         */
        initBoard() {
            const self = this;
            this.board = Chessboard('board', {
                position: 'start',
                draggable: true,
                pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
                onDragStart: (source, piece) => self.onDragStart(source, piece),
                onDrop: (source, target) => self.onDrop(source, target),
                onSnapEnd: () => self.onSnapEnd()
            });

            $(window).on('resize orientationchange', () => {
                if (self.board) self.board.resize();
            });
        }

        onDragStart(source, piece) {
            if (this.activeChess.game_over()) return false;
            this.stopAutoplay();
            if ((this.activeChess.turn() === 'w' && piece.search(/^b/) !== -1) ||
                (this.activeChess.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            }
        }

        onDrop(source, target) {
            const move = this.activeChess.move({
                from: source,
                to: target,
                promotion: 'q'
            });

            if (move === null) return 'snapback';

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
         * Load PGN file specified in data-pgn attribute
         */
        async loadPgnFile() {
            const self = this;
            try {
                const response = await fetch(this.pgnUrl);
                if (!response.ok) throw new Error("Could not load PGN file");
                const pgnText = await response.text();

                this.pgnGames = this.splitPgnFile(pgnText);
                const $select = this.$container.find("#gameSelect");
                $select.empty();

                this.pgnGames.forEach((pgn, idx) => {
                    const tempChess = new Chess();
                    tempChess.load_pgn(pgn);
                    const h = tempChess.header();
                    const title = `${idx + 1}. ${h.White || 'White'} vs ${h.Black || 'Black'} (${h.Event || 'Game'}, ${h.Date || ''}) - ${h.Result || ''}`;

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
                console.error(err);
                this.$container.find("#gameSelect").html("<option>Error loading PGN database.</option>");
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
            const success = this.mainChess.load_pgn(pgnString);
            if (!success) {
                console.error("Failed to load PGN at index", index);
                return;
            }

            const headers = this.mainChess.header();
            this.$container.find("#whitePlayer").text(headers.White || "White");
            this.$container.find("#blackPlayer").text(headers.Black || "Black");
            this.$container.find("#gameResult").text(headers.Result || "*");
            this.$container.find("#gameDate").text(headers.Date || "N/A");
            this.$container.find("#gameSite").text(headers.Site || "N/A");
            this.$container.find("#gameECO").text(headers.ECO ? headers.ECO : "N/A");

            this.mainHistory = this.mainChess.history({ verbose: true });
            const tempChess = new Chess();
            this.mainHistory.forEach(m => {
                tempChess.move(m);
                m.fen = tempChess.fen();
            });
            this.$container.find("#moveCountBadge").text(`${this.mainHistory.length} moves`);

            this.renderMoveList();
            this.currentMoveIndex = -1;
            this.updatePosition(false);
        }

        renderMoveList() {
            const $container = this.$container.find("#movesList");
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
                whiteDiv.id = `move-${i}`;
                whiteDiv.textContent = whiteMove.san;
                $(whiteDiv).on("click", () => self.goToMove(i));
                $container.append(whiteDiv);

                if (i + 1 < this.mainHistory.length) {
                    const blackMove = this.mainHistory[i + 1];
                    const blackDiv = document.createElement("div");
                    blackDiv.className = "move-cell";
                    blackDiv.id = `move-${i + 1}`;
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
            this.board.position(targetFen, animated);

            this.$container.find(".move-cell").removeClass("active");
            if (this.currentMoveIndex >= 0) {
                const $activeCell = this.$container.find(`#move-${this.currentMoveIndex}`);
                if ($activeCell.length) {
                    $activeCell.addClass("active");
                    $activeCell[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
                }
            }

            this.updateButtonStates();
        }

        updateButtonStates() {
            if (this.isAnalysisMode) {
                this.$container.find("#btnStart").prop("disabled", false);
                this.$container.find("#btnPrev").prop("disabled", false);
                this.$container.find("#btnNext").prop("disabled", true);
                this.$container.find("#btnEnd").prop("disabled", true);
            } else {
                this.$container.find("#btnStart").prop("disabled", this.currentMoveIndex === -1);
                this.$container.find("#btnPrev").prop("disabled", this.currentMoveIndex === -1);
                this.$container.find("#btnNext").prop("disabled", this.currentMoveIndex === this.mainHistory.length - 1);
                this.$container.find("#btnEnd").prop("disabled", this.currentMoveIndex === this.mainHistory.length - 1);
            }
        }

        updateModeBanner() {
            const $banner = this.$container.find("#modeBanner");
            const $modeText = this.$container.find("#modeText");
            const $resetBtn = this.$container.find("#btnResetAnalysis");

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
            const $box = this.$container.find("#analysisBox");
            const $textSpan = this.$container.find("#analysisMovesText");

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
            const speed = parseInt(this.$container.find("#autoplaySpeed").val(), 10) || 1000;
            const $playIcon = this.$container.find("#playIcon");
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
            const $playIcon = this.$container.find("#playIcon");
            if ($playIcon.length) $playIcon.attr("class", "fas fa-play");
        }

        flipBoard() {
            this.board.flip();
        }

        bindEvents() {
            const self = this;
            this.$container.find("#btnStart").on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(-1);
            });
            this.$container.find("#btnPrev").on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(self.currentMoveIndex - 1);
            });
            this.$container.find("#btnNext").on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(self.currentMoveIndex + 1);
            });
            this.$container.find("#btnEnd").on("click", () => {
                if (self.isAnalysisMode) self.exitAnalysisMode();
                self.goToMove(self.mainHistory.length - 1);
            });
            this.$container.find("#btnPlay").on("click", () => self.toggleAutoplay());
            this.$container.find("#btnFlip").on("click", () => self.flipBoard());
            this.$container.find("#btnResetAnalysis").on("click", () => self.exitAnalysisMode());

            $(document).on("keydown.mchessBoard", (e) => {
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
        // Prevent native browser image drag on chess pieces so Chessboard.js JS handles 100% of movement
        $(document).on('dragstart', '.board-container img, .square-55d63 img, .dragged-piece-4d2e8, [class*="piece-"]', function (e) {
            e.preventDefault();
            return false;
        });

        $('#mchessBoardContainer, [data-mchess-board]').each(function () {
            new MChessBoard(this);
        });
    });

})(jQuery);
