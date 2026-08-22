/**
 * @file mchess-fen-parser.js
 * @description Dynamic FEN & Metadata Extractor for MCHESS.
 * Inspects full_description HTML strings from Firestore mchess_blog collection and extracts FEN strings,
 * side to move, game details, and iframe parameters without breaking live website content.
 * @project MCHESS Interactive Chess Portal
 */

var MChessFenParser = (function () {
    'use strict';

    function escapeAttr(str) {
        return String(str || '').replace(/"/g, '&quot;');
    }

    return {
        /**
         * Normalizes any raw FEN string into a valid 6-part FEN structure
         * @param {string} rawFen - The raw FEN string
         * @returns {string} Normalized 6-part FEN string
         */
        normalizeFen: function (rawFen) {
            if (!rawFen || typeof rawFen !== 'string') {
                return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            }

            var cleanFen = decodeURIComponent(rawFen).replace(/\+/g, ' ').trim();
            var parts = cleanFen.split(/\s+/);
            var boardPart = parts[0];

            // Validate that boardPart has 8 ranks
            if (!boardPart || boardPart.split('/').length !== 8) {
                return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            }

            var turn = (parts[1] && (parts[1].toLowerCase() === 'b' || parts[1].toLowerCase() === 'w')) ? parts[1].toLowerCase() : 'w';
            var castling = parts[2] || '-';
            var enPassant = parts[3] || '-';
            var halfMove = parts[4] || '0';
            var fullMove = parts[5] || '1';

            return boardPart + ' ' + turn + ' ' + castling + ' ' + enPassant + ' ' + halfMove + ' ' + fullMove;
        },

        /**
         * Extracts FEN string from an HTML content string (e.g. from full_description)
         * @param {string} htmlContent - The HTML string from blog description
         * @returns {Object|null} { fen, turn }
         */
        parseDescription: function (htmlContent) {
            if (!htmlContent || typeof htmlContent !== 'string') return null;

            // 1. Try to extract fen parameter from iframe src or URL (allowing spaces/%20/+ inside quotes)
            var fenMatch = htmlContent.match(/[?&]fen=([^"'<>]+)/i);
            var rawFen = null;

            if (fenMatch && fenMatch[1]) {
                // Strip trailing query parameters if any (e.g. &amp;width=...)
                rawFen = fenMatch[1].split('&')[0].split('"')[0].split("'")[0].trim();
            }

            // 2. Fallback: Direct FEN regex search in text
            if (!rawFen) {
                var directMatch = htmlContent.match(/\b([rnbqkbnrpPRNBQKBNR1-8]+\/){7}[rnbqkbnrpPRNBQKBNR1-8]+(?:\s+[wb]\s+[-kKqQA-Ha-h0-9]+\s+[-a-h1-80-9]+\s+\d+\s+\d+)?\b/);
                if (directMatch) {
                    rawFen = directMatch[0].trim();
                }
            }

            if (!rawFen) return null;

            var normalizedFen = this.normalizeFen(rawFen);
            var turn = normalizedFen.includes(' b ') ? 'b' : 'w';

            return {
                fen: normalizedFen,
                turn: turn
            };
        },

        /**
         * Replaces ChessBase iframe elements inside HTML content with a placeholder element for Stockfish engine board
         * @param {string} htmlContent - The raw HTML content from Firestore
         * @returns {string} Processed HTML with iframe replaced by #mchessStockfishContainer
         */
        replaceChessbaseIframe: function (htmlContent) {
            if (!htmlContent || typeof htmlContent !== 'string') return htmlContent;

            var parsed = this.parseDescription(htmlContent);
            if (!parsed || !parsed.fen) return htmlContent;

            var placeholder = '<div id="mchessBlogEngineBoard" data-fen="' + escapeAttr(parsed.fen) + '"></div>';

            // Replace ANY <iframe ... chessbase ...></iframe> OR <iframe ... fen= ...></iframe> with placeholder
            var processed = htmlContent.replace(
                /<iframe[^>]*src=["'][^"']*(?:chessbase\.com|\?fen=)[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi,
                placeholder
            );

            // Handle single / unclosed iframe tags if present
            processed = processed.replace(
                /<iframe[^>]*src=["'][^"']*(?:chessbase\.com|\?fen=)[^"']*["'][^>]*\/?>/gi,
                placeholder
            );

            return processed;
        }
    };
})();
