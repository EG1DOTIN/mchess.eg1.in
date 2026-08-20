/**
 * @file mchess-game-history.js
 * @description LocalStorage Game History Manager & PGN Exporter for MCHESS.
 * Saves played games locally, manages saved games list, powers move review, and enables PGN export.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    const STORAGE_KEY = 'mchess_saved_games_v1';

    class MChessGameHistory {
        static getSavedGames() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.warn('[MChessGameHistory] LocalStorage read error:', e);
                return [];
            }
        }

        static saveGame(gameRecord) {
            if (!gameRecord || !gameRecord.pgn) return false;

            try {
                const games = MChessGameHistory.getSavedGames();
                const record = {
                    id: 'game_' + Date.now(),
                    date: gameRecord.date || new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    white: gameRecord.white || 'Player 1',
                    black: gameRecord.black || 'Player 2',
                    result: gameRecord.result || '*',
                    moveCount: gameRecord.moveCount || 0,
                    pgn: gameRecord.pgn,
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
