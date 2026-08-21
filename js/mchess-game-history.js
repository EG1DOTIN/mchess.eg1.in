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
        static getSavedGames() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                const games = data ? JSON.parse(data) : [];
                // Ensure all loaded games have normalized standard PGN format
                return games.map(g => MChessGameHistory.normalizeGameRecord(g));
            } catch (e) {
                console.warn('[MChessGameHistory] LocalStorage read error:', e);
                return [];
            }
        }

        /**
         * Normalize a game record to guarantee compliant 7-Tag PGN headers
         */
        static normalizeGameRecord(gameRecord) {
            if (!gameRecord) return gameRecord;

            let pgnText = (gameRecord.pgn || '').trim();
            const cleanDate = (gameRecord.date || '').split(' ')[0] || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
            
            let cleanResult = '*';
            const resLower = (gameRecord.result || '').toLowerCase();
            if (resLower.includes('1-0')) cleanResult = '1-0';
            else if (resLower.includes('0-1')) cleanResult = '0-1';
            else if (resLower.includes('1/2') || resLower.includes('draw')) cleanResult = '1/2-1/2';

            // Prepend 7-Tag headers if missing
            if (pgnText && !pgnText.includes('[Event ')) {
                const headerBlock = `[Event "${gameRecord.mode || 'MChess Match'}"]\n` +
                                    `[Site "mchess.eg1.in"]\n` +
                                    `[Date "${cleanDate}"]\n` +
                                    `[Round "1"]\n` +
                                    `[White "${gameRecord.white || 'Player 1'}"]\n` +
                                    `[Black "${gameRecord.black || 'Player 2'}"]\n` +
                                    `[Result "${cleanResult}"]\n` +
                                    `[Mode "${gameRecord.mode || 'Game'}"]\n\n`;
                pgnText = headerBlock + pgnText;
                if (!pgnText.endsWith(cleanResult) && cleanResult !== '*') {
                    pgnText += ` ${cleanResult}`;
                }
            }

            return Object.assign({}, gameRecord, {
                result: gameRecord.result || cleanResult,
                pgn: pgnText
            });
        }

        static saveGame(gameRecord) {
            if (!gameRecord || !gameRecord.pgn) return false;

            try {
                const games = MChessGameHistory.getSavedGames();
                const normalized = MChessGameHistory.normalizeGameRecord(gameRecord);

                const record = {
                    id: 'game_' + Date.now(),
                    date: gameRecord.date || new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    white: gameRecord.white || 'Player 1',
                    black: gameRecord.black || 'Player 2',
                    result: normalized.result || '*',
                    moveCount: gameRecord.moveCount || 0,
                    pgn: normalized.pgn,
                    mode: gameRecord.mode || 'game'
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
            const blob = new Blob([pgnText], { type: 'application/x-chess-pgn' });
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
