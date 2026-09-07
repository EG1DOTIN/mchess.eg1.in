/**
 * @file chessrules.js
 * @description Interactive Chess Rules Engine & Academy Controller for Marwadi Chess.
 * Powers the interactive Piece Movement Explorer, Special Moves Demonstrators (Castling & En Passant),
 * Quiz validation, and Table of Contents scroll-spy navigation.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    // ──────────────────────────────────────────────────────────
    // 1. DATA: PIECE MOVEMENT DEFINITIONS
    // ──────────────────────────────────────────────────────────
    const PIECES_DATA = {
        pawn: {
            name: 'The Pawn',
            points: '1 Point',
            symbol: '♟',
            fen: '8/8/8/8/8/2p1p3/3P4/8 w - - 0 1',
            pieceSquare: 'd2',
            targets: ['d3', 'd4', 'c3', 'e3'],
            summary: 'Pawns move 1 square straight forward. On their very first move, they have the option to advance 2 squares. Unlike other pieces, pawns capture 1 square diagonally ahead.',
            tips: [
                'Advances straight, captures diagonally.',
                'Can move 2 squares forward only from its starting rank.',
                'Transforms into a Queen, Rook, Bishop, or Knight upon reaching the 8th rank (Promotion).',
                'Can execute the special diagonal "En Passant" capture against adjacent pawns.'
            ]
        },
        knight: {
            name: 'The Knight',
            points: '3 Points',
            symbol: '♞',
            fen: '8/8/8/3N4/8/8/8/8 w - - 0 1',
            pieceSquare: 'd5',
            targets: ['c7', 'e7', 'f6', 'f4', 'e3', 'c3', 'b4', 'b6'],
            summary: 'The Knight moves in a distinct "L-shape": two squares in one direction, then one square perpendicular. It is the ONLY piece on the chessboard that can jump over other pieces!',
            tips: [
                'Always lands on a square of the opposite color from where it started.',
                'Cannot be blocked by intervening friendly or enemy pieces.',
                'Controls up to 8 squares from the center of the board.'
            ]
        },
        bishop: {
            name: 'The Bishop',
            points: '3 Points',
            symbol: '♝',
            fen: '8/8/8/3B4/8/8/8/8 w - - 0 1',
            pieceSquare: 'd5',
            targets: ['c6', 'b7', 'a8', 'e6', 'f7', 'g8', 'c4', 'b3', 'a2', 'e4', 'f3', 'g2', 'h1'],
            summary: 'Bishops move diagonally as many unobstructed squares as desired. Each player starts with one Light-squared Bishop and one Dark-squared Bishop.',
            tips: [
                'Bound forever to its starting square color (cannot switch colors).',
                'Excels on open boards with long diagonals.',
                'Works harmoniously in tandem with the other bishop ("Bishop Pair").'
            ]
        },
        rook: {
            name: 'The Rook',
            points: '5 Points',
            symbol: '♜',
            fen: '8/8/8/3R4/8/8/8/8 w - - 0 1',
            pieceSquare: 'd5',
            targets: ['d8', 'd7', 'd6', 'd4', 'd3', 'd2', 'd1', 'a5', 'b5', 'c5', 'e5', 'f5', 'g5', 'h5'],
            summary: 'Rooks move in straight lines along ranks (horizontal) and files (vertical) as far as they want. Considered a "Major" or "Heavy" piece alongside the Queen.',
            tips: [
                'Controls up to 14 squares from anywhere on an unobstructed board.',
                'Powers the special Castling move alongside the King.',
                'Devastating when placed on the 7th rank (opponent\'s pawn rank).'
            ]
        },
        queen: {
            name: 'The Queen',
            points: '9 Points',
            symbol: '♛',
            fen: '8/8/8/3Q4/8/8/8/8 w - - 0 1',
            pieceSquare: 'd5',
            targets: [
                'd8', 'd7', 'd6', 'd4', 'd3', 'd2', 'd1',
                'a5', 'b5', 'c5', 'e5', 'f5', 'g5', 'h5',
                'c6', 'b7', 'a8', 'e6', 'f7', 'g8',
                'c4', 'b3', 'a2', 'e4', 'f3', 'g2', 'h1'
            ],
            summary: 'The Queen is the most powerful piece in chess. She combines the movement powers of the Rook and Bishop, moving in any straight line (horizontal, vertical, diagonal) any distance.',
            tips: [
                'Controls up to 27 squares simultaneously from the center.',
                'Worth 9 points — protect her from early traps and attacks.',
                'Almost always the piece chosen during pawn promotion.'
            ]
        },
        king: {
            name: 'The King',
            points: 'Infinite (Objective)',
            symbol: '♚',
            fen: '8/8/8/3K4/8/8/8/8 w - - 0 1',
            pieceSquare: 'd5',
            targets: ['c6', 'd6', 'e6', 'c5', 'e5', 'c4', 'd4', 'e4'],
            summary: 'The King is the most important piece. It moves one square in any direction. The entire game revolves around protecting your King and checkmating the opponent\'s King.',
            tips: [
                'Can never move into Check or remain in Check.',
                'The two Kings can never stand next to each other on adjacent squares.',
                'Becomes an active, valuable attacker in the endgame once queens are traded.'
            ]
        }
    };

    // ──────────────────────────────────────────────────────────
    // 2. PIECE MOVEMENT EXPLORER CONTROLLER
    // ──────────────────────────────────────────────────────────
    class PieceExplorer {
        constructor() {
            this.board = null;
            this.currentPiece = 'pawn';
            this.$container = $('#explorerBoard');
            this.pieceThemeUrl = 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';
            this.init();
        }

        init() {
            if (!this.$container.length || typeof Chessboard === 'undefined') return;

            this.board = Chessboard('explorerBoard', {
                position: PIECES_DATA.pawn.fen,
                showNotation: true,
                draggable: true,
                pieceTheme: this.pieceThemeUrl,
                onDrop: (source, target, piece) => this.handlePieceDrop(source, target, piece)
            });

            this.renderHighlights('pawn');
            this.bindEvents();
        }

        bindEvents() {
            $('.rules-piece-tab').on('click', (e) => {
                const $tab = $(e.currentTarget);
                const pieceKey = $tab.data('piece');
                if (!PIECES_DATA[pieceKey]) return;

                $('.rules-piece-tab').removeClass('active');
                $tab.addClass('active');
                this.selectPiece(pieceKey);
            });

            $(window).on('resize', () => {
                if (this.board) {
                    this.board.resize();
                    this.renderHighlights(this.currentPiece);
                }
            });
        }

        selectPiece(pieceKey) {
            this.currentPiece = pieceKey;
            const data = PIECES_DATA[pieceKey];

            // Update info text
            $('#explorerPieceName').text(data.name);
            $('#explorerPiecePoints').text(data.points);
            $('#explorerPieceDesc').text(data.summary);

            const $tipsList = $('#explorerTipsList').empty();
            data.tips.forEach(tip => {
                $tipsList.append(`<li><i class="fas fa-check-circle"></i> <span>${tip}</span></li>`);
            });

            // Update board position
            this.board.position(data.fen, false);
            setTimeout(() => {
                this.renderHighlights(pieceKey);
            }, 50);
        }

        renderHighlights(pieceKey) {
            // Clear existing highlight markers
            this.$container.find('.rules-legal-dot, .rules-capture-ring').remove();

            const data = PIECES_DATA[pieceKey];
            if (!data || !data.targets) return;

            data.targets.forEach(sq => {
                const $sq = this.$container.find(`.square-${sq}`);
                if ($sq.length) {
                    // If target square has an enemy piece, render capture ring, otherwise green dot
                    if ($sq.find('img').length > 0) {
                        $sq.append('<div class="rules-capture-ring"></div>');
                    } else {
                        $sq.append('<div class="rules-legal-dot"></div>');
                    }
                }
            });
        }

        handlePieceDrop(source, target, piece) {
            // Check if drop square is in legal targets
            const data = PIECES_DATA[this.currentPiece];
            if (!data.targets.includes(target)) {
                return 'snapback';
            }

            // Move succeeded - reset highlights after snap
            setTimeout(() => {
                this.renderHighlights(this.currentPiece);
            }, 100);
        }
    }

    // ──────────────────────────────────────────────────────────
    // 3. SPECIAL MOVES DEMONSTRATORS
    // ──────────────────────────────────────────────────────────
    class SpecialMovesDemo {
        constructor() {
            this.initialBoard = null;
            this.castleBoard = null;
            this.enPassantBoard = null;
            this.pieceThemeUrl = 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';
            this.init();
        }

        init() {
            if (typeof Chessboard === 'undefined') return;

            // 0. Initial Game Setup Board (Section 1)
            if ($('#initialSetupBoard').length) {
                this.initialBoard = Chessboard('initialSetupBoard', {
                    position: 'start',
                    showNotation: true,
                    draggable: false,
                    pieceTheme: this.pieceThemeUrl
                });
            }

            // 1. Castling Demo Board
            if ($('#castleDemoBoard').length) {
                this.castleStartFen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
                this.castleBoard = Chessboard('castleDemoBoard', {
                    position: this.castleStartFen,
                    showNotation: true,
                    draggable: false,
                    pieceTheme: this.pieceThemeUrl
                });

                $('#btnCastleKingside').on('click', () => {
                    // White castles 0-0: King to g1, Rook to f1
                    this.castleBoard.position('r3k2r/8/8/8/8/8/8/R4RK1 b kq - 1 1', true);
                    $('#castleStatusText').html('<i class="fas fa-shield-alt" style="color:#22c55e;"></i> <strong>Kingside Castling (0-0)</strong> executed! King is tucked safely on g1.');
                });

                $('#btnCastleQueenside').on('click', () => {
                    // White castles 0-0-0: King to c1, Rook to d1
                    this.castleBoard.position('r3k2r/8/8/8/8/8/8/2KR3R b kq - 1 1', true);
                    $('#castleStatusText').html('<i class="fas fa-shield-alt" style="color:#22c55e;"></i> <strong>Queenside Castling (0-0-0)</strong> executed! King is protected on c1.');
                });

                $('#btnResetCastle').on('click', () => {
                    this.castleBoard.position(this.castleStartFen, true);
                    $('#castleStatusText').text('Click a button below to see the King & Rook move simultaneously!');
                });
            }

            // 2. En Passant Demo Board
            if ($('#enPassantDemoBoard').length) {
                this.epStartFen = '8/3p4/8/4P3/8/8/8/8 b - - 0 1';
                this.enPassantBoard = Chessboard('enPassantDemoBoard', {
                    position: this.epStartFen,
                    showNotation: true,
                    draggable: false,
                    pieceTheme: this.pieceThemeUrl
                });

                $('#btnEpStep1').on('click', () => {
                    // Black plays d7-d5 (advancing 2 squares)
                    this.enPassantBoard.position('8/8/8/3pP3/8/8/8/8 w - d6 0 2', true);
                    $('#epStatusText').html('<i class="fas fa-arrow-down" style="color:#38bdf8;"></i> <strong>Step 1:</strong> Black moves d7 to d5, landing directly adjacent to White\'s e5 pawn.');
                    $('#btnEpStep2').prop('disabled', false).css('opacity', 1);
                });

                $('#btnEpStep2').on('click', () => {
                    // White captures En Passant to d6
                    this.enPassantBoard.position('8/8/3P4/8/8/8/8/8 b - - 0 2', true);
                    $('#epStatusText').html('<i class="fas fa-bolt" style="color:#f59e0b;"></i> <strong>Step 2 (En Passant):</strong> White captures diagonally to d6! Black\'s d5 pawn is eliminated.');
                });

                $('#btnResetEp').on('click', () => {
                    this.enPassantBoard.position(this.epStartFen, true);
                    $('#epStatusText').text('Click "Step 1" to start the En Passant demonstration.');
                    $('#btnEpStep2').prop('disabled', true).css('opacity', 0.6);
                });
            }

            // Window resize handler for all boards in this section
            $(window).on('resize', () => {
                if (this.initialBoard) this.initialBoard.resize();
                if (this.castleBoard) this.castleBoard.resize();
                if (this.enPassantBoard) this.enPassantBoard.resize();
            });
        }
    }

    // ──────────────────────────────────────────────────────────
    // 4. INTERACTIVE QUIZ CONTROLLER
    // ──────────────────────────────────────────────────────────
    class RulesQuiz {
        constructor() {
            this.bindEvents();
        }

        bindEvents() {
            $('.rules-quiz-opt').on('click', function () {
                const $opt = $(this);
                const $box = $opt.closest('.rules-quiz-box');
                const isCorrect = $opt.data('correct') === true;
                const feedbackText = $opt.data('feedback') || '';

                // Disable sister options in this question
                $box.find('.rules-quiz-opt').removeClass('correct incorrect');
                if (isCorrect) {
                    $opt.addClass('correct');
                    $box.find('.rules-quiz-feedback')
                        .removeClass('error')
                        .addClass('show success')
                        .html(`<i class="fas fa-check-circle"></i> <strong>Correct!</strong> ${feedbackText}`);
                } else {
                    $opt.addClass('incorrect');
                    $box.find('.rules-quiz-feedback')
                        .removeClass('success')
                        .addClass('show error')
                        .html(`<i class="fas fa-times-circle"></i> <strong>Incorrect.</strong> ${feedbackText}`);
                }
            });
        }
    }

    // ──────────────────────────────────────────────────────────
    // 5. TABLE OF CONTENTS SCROLL-SPY & SMOOTH SCROLL
    // ──────────────────────────────────────────────────────────
    function initScrollSpy() {
        // Smooth scrolling for TOC links
        $('.rules-toc-link').on('click', function (e) {
            e.preventDefault();
            const targetId = $(this).attr('href');
            const $target = $(targetId);
            if ($target.length) {
                $('html, body').animate({
                    scrollTop: $target.offset().top - 90
                }, 300);
            }
        });

        // Scroll spy highlight active link
        const $sections = $('.rules-section-anchor');
        const $tocLinks = $('.rules-toc-link');

        $(window).on('scroll', function () {
            const scrollPos = $(window).scrollTop() + 120;
            let currentId = '';

            $sections.each(function () {
                const top = $(this).offset().top;
                if (scrollPos >= top) {
                    currentId = '#' + $(this).attr('id');
                }
            });

            if (currentId) {
                $tocLinks.removeClass('active');
                $tocLinks.filter(`[href="${currentId}"]`).addClass('active');
            }
        });
    }

    // ──────────────────────────────────────────────────────────
    // 6. INITIALIZATION
    // ──────────────────────────────────────────────────────────
    $(document).ready(function () {
        new PieceExplorer();
        new SpecialMovesDemo();
        new RulesQuiz();
        initScrollSpy();
    });

})(jQuery);
