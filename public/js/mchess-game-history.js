/**
 * @file mchess-game-history.js
 * @description LocalStorage Game History Manager & Standardized 7-Tag PGN Exporter for MCHESS.
 * Saves played games locally, formats compliant PGN headers, powers move review, and enables PGN export.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    const STORAGE_KEY = 'mchess_saved_games_v1';

    class MChessGameHistory {
        /**
         * Retrieve all saved games from LocalStorage with normalized PGN and perspective metadata.
         */
        static getSavedGames() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                const games = data ? JSON.parse(data) : [];
                // Ensure all loaded games have normalized standard PGN format and accurate fields
                return games.map(g => MChessGameHistory.normalizeGameRecord(g));
            } catch (e) {
                console.warn('[MChessGameHistory] LocalStorage read error:', e);
                return [];
            }
        }

        /**
         * Construct a standard 7-Tag PGN string from an array of SAN move strings
         */
        static buildPgnFromMoves(params) {
            const white = params.white || 'Player 1';
            const black = params.black || 'Player 2';
            const date = params.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
            const cleanDate = date.split(' ')[0].replace(/\//g, '.');
            const result = params.result || '*';
            const termination = params.termination || 'Normal';
            const mode = params.mode || 'MChess Match';
            const moves = params.moves || [];

            let movesText = '';
            for (let i = 0; i < moves.length; i++) {
                const san = typeof moves[i] === 'string' ? moves[i] : (moves[i].san || '');
                if (!san) continue;

                if (i % 2 === 0) {
                    const moveNumber = Math.floor(i / 2) + 1;
                    movesText += `${moveNumber}. ${san} `;
                } else {
                    movesText += `${san} `;
                }
            }

            movesText = movesText.trim();
            if (result && result !== '*') {
                movesText += ` ${result}`;
            }

            const headerBlock = `[Event "${mode}"]\n` +
                                `[Site "mchess.eg1.in"]\n` +
                                `[Date "${cleanDate}"]\n` +
                                `[Round "1"]\n` +
                                `[White "${white}"]\n` +
                                `[Black "${black}"]\n` +
                                `[Result "${result}"]\n` +
                                `[Termination "${termination}"]\n` +
                                `[Mode "${mode}"]\n\n`;

            return headerBlock + (movesText || '*');
        }

        /**
         * Normalize a game record to guarantee compliant 7-Tag PGN headers and sanitize move text
         */
        static normalizeGameRecord(gameRecord) {
            if (!gameRecord) return gameRecord;

            let pgnText = (gameRecord.pgn || '').trim();
            const cleanDate = (gameRecord.date || '').split(' ')[0].replace(/\//g, '.') || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
            
            // Extract standard PGN result code
            let cleanResult = '*';
            const rawResult = (gameRecord.result || '').trim();
            const resLower = rawResult.toLowerCase();
            if (resLower.includes('1-0')) cleanResult = '1-0';
            else if (resLower.includes('0-1')) cleanResult = '0-1';
            else if (resLower.includes('1/2') || resLower.includes('draw')) cleanResult = '1/2-1/2';

            // Extract termination reason if available
            let termination = 'Normal';
            if (resLower.includes('resignation') || resLower.includes('resigned')) termination = 'Resignation';
            else if (resLower.includes('time out') || resLower.includes('flagged')) termination = 'Time forfeit';
            else if (resLower.includes('abandon') || resLower.includes('disconnected')) termination = 'Abandonment';
            else if (resLower.includes('agreement') || resLower.includes('mutual')) termination = 'Mutual Agreement';
            else if (resLower.includes('stalemate')) termination = 'Stalemate';
            else if (resLower.includes('checkmate')) termination = 'Checkmate';

            // Sanitize move text: Strip invalid parenthesized variations like "(Resignation)" from the PGN body
            if (pgnText) {
                pgnText = pgnText.replace(/\((?:Resignation|Time Out|Abandonment|Agreement|Normal)[^\)]*\)/gi, '').trim();
            }

            // If PGN is missing 7-Tag headers, construct them cleanly
            if (pgnText && !pgnText.includes('[Event ')) {
                const headerBlock = `[Event "${gameRecord.mode || 'MChess Match'}"]\n` +
                                    `[Site "mchess.eg1.in"]\n` +
                                    `[Date "${cleanDate}"]\n` +
                                    `[Round "1"]\n` +
                                    `[White "${gameRecord.white || 'Player 1'}"]\n` +
                                    `[Black "${gameRecord.black || 'Player 2'}"]\n` +
                                    `[Result "${cleanResult}"]\n` +
                                    `[Termination "${termination}"]\n` +
                                    `[Mode "${gameRecord.mode || 'Game'}"]\n\n`;
                pgnText = headerBlock + pgnText;
            }

            // Ensure PGN ends with valid result token
            if (pgnText && cleanResult !== '*' && !pgnText.endsWith(cleanResult)) {
                // If it ends with * or improper string, fix it
                if (pgnText.endsWith('*')) {
                    pgnText = pgnText.slice(0, -1).trim() + ` ${cleanResult}`;
                } else if (!pgnText.includes(cleanResult)) {
                    pgnText += ` ${cleanResult}`;
                }
            }

            // Calculate reliable move count if missing or 0
            let moveCount = gameRecord.moveCount;
            if (!moveCount || moveCount === 0) {
                // Count move tokens in PGN text
                const moveTokens = pgnText.replace(/\[[\s\S]*?\]/g, '').replace(/\b(?:1-0|0-1|1\/2-1\/2|\*)\b/g, '').trim().split(/\s+/).filter(t => t && !t.includes('.'));
                moveCount = moveTokens.length;
            }

            return Object.assign({}, gameRecord, {
                result: gameRecord.result || cleanResult,
                termination: termination,
                moveCount: moveCount || 0,
                userSide: gameRecord.userSide || 'white',
                playerName: gameRecord.playerName || localStorage.getItem('mchess_player_name') || '',
                pgn: pgnText
            });
        }

        /**
         * Save a finished game record to LocalStorage
         */
        static saveGame(gameRecord) {
            if (!gameRecord) return false;

            try {
                // If move list provided, generate robust PGN text
                if ((!gameRecord.pgn || gameRecord.pgn.trim().length === 0) && Array.isArray(gameRecord.moves) && gameRecord.moves.length > 0) {
                    gameRecord.pgn = MChessGameHistory.buildPgnFromMoves({
                        white: gameRecord.white,
                        black: gameRecord.black,
                        date: gameRecord.date,
                        result: gameRecord.result,
                        termination: gameRecord.termination,
                        mode: gameRecord.mode,
                        moves: gameRecord.moves
                    });
                }

                if (!gameRecord.pgn) return false;

                const games = MChessGameHistory.getSavedGames();
                const normalized = MChessGameHistory.normalizeGameRecord(gameRecord);

                const record = {
                    id: 'game_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    date: gameRecord.date || new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    white: gameRecord.white || 'Player 1',
                    black: gameRecord.black || 'Player 2',
                    userSide: gameRecord.userSide || 'white',
                    playerName: gameRecord.playerName || localStorage.getItem('mchess_player_name') || 'Guest Player',
                    result: normalized.result || '*',
                    termination: normalized.termination || 'Normal',
                    moveCount: normalized.moveCount || (Array.isArray(gameRecord.moves) ? gameRecord.moves.length : 0),
                    pgn: normalized.pgn,
                    mode: gameRecord.mode || 'Game'
                };

                // Add to start of array (newest first)
                games.unshift(record);

                // Keep up to 50 most recent games in LocalStorage
                if (games.length > 50) games.pop();

                localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
                return record;
            } catch (e) {
                console.error('[MChessGameHistory] LocalStorage save error:', e);
                return false;
            }
        }

        static deleteGame(gameId) {
            try {
                let games = MChessGameHistory.getSavedGames();
                games = games.filter(g => g.id !== gameId);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
                return true;
            } catch (e) {
                console.error('[MChessGameHistory] LocalStorage delete error:', e);
                return false;
            }
        }

        static clearAllHistory() {
            try {
                localStorage.removeItem(STORAGE_KEY);
                return true;
            } catch (e) {
                return false;
            }
        }

        static downloadPgn(pgnText, filename) {
            if (!pgnText) return;
            const blob = new Blob([pgnText], { type: 'application/x-chess-pgn;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename || 'mchess_game_' + Date.now() + '.pgn';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Export globally
    window.MChessGameHistory = MChessGameHistory;

})(jQuery);
