/**
 * @file mygames.js
 * @description Dashboard controller, accurate player perspective statistics, game history filters, and interactive review launcher for mygames.html.
 * @project MCHESS Interactive Chess Portal
 */

$(document).ready(function () {
    let activeFilter = 'all';
    let searchQuery = '';
    let activePgn = '';
    let reviewBoardInstance = null;

    /**
     * Determine match outcome (Win, Loss, Draw) from the active user's perspective
     */
    function determineGameOutcome(game) {
        const res = (game.result || '').toLowerCase();
        const isDraw = res.includes('1/2') || res.includes('draw');

        if (isDraw) {
            return {
                type: 'draw',
                label: '1/2-1/2 (Draw)',
                badgeStyle: 'background: rgba(234, 179, 8, 0.15); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.4);'
            };
        }

        const localName = (localStorage.getItem('mchess_player_name') || '').toLowerCase().trim();
        const whiteLower = (game.white || '').toLowerCase();
        const blackLower = (game.black || '').toLowerCase();

        // Determine if user played as White or Black
        let isUserWhite = false;
        let isUserBlack = false;

        if (game.userSide === 'white') {
            isUserWhite = true;
        } else if (game.userSide === 'black') {
            isUserBlack = true;
        } else if (whiteLower.includes('(you)') || whiteLower.includes('you')) {
            isUserWhite = true;
        } else if (blackLower.includes('(you)') || blackLower.includes('you')) {
            isUserBlack = true;
        } else if (localName && whiteLower === localName) {
            isUserWhite = true;
        } else if (localName && blackLower === localName) {
            isUserBlack = true;
        } else if (whiteLower.includes('player 1')) {
            isUserWhite = true;
        } else if (blackLower.includes('player 2')) {
            isUserBlack = true;
        } else {
            // Default assumption for single player match
            isUserWhite = true;
        }

        const isWhiteWin = res.includes('1-0');
        const isBlackWin = res.includes('0-1');

        if ((isUserWhite && isWhiteWin) || (isUserBlack && isBlackWin)) {
            const scoreLabel = isWhiteWin ? '1-0' : '0-1';
            return {
                type: 'win',
                label: `${scoreLabel} (Win)`,
                badgeStyle: 'background: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.4);'
            };
        } else if ((isUserWhite && isBlackWin) || (isUserBlack && isWhiteWin)) {
            const scoreLabel = isWhiteWin ? '1-0' : '0-1';
            return {
                type: 'loss',
                label: `${scoreLabel} (Loss)`,
                badgeStyle: 'background: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.4);'
            };
        }

        // Fallback for ongoing or unfinished matches
        return {
            type: 'ongoing',
            label: game.result || '*',
            badgeStyle: 'background: rgba(100, 116, 139, 0.15); color: var(--mg-text-desc); border: 1px solid var(--mg-border);'
        };
    }

    // Load and Render Games and Statistics
    function renderDashboard() {
        const games = MChessGameHistory.getSavedGames() || [];
        
        // Calculate Stats based on user perspective
        let total = games.length;
        let wins = 0;
        let losses = 0;
        let draws = 0;

        games.forEach(g => {
            const outcome = determineGameOutcome(g);
            if (outcome.type === 'win') wins++;
            else if (outcome.type === 'loss') losses++;
            else if (outcome.type === 'draw') draws++;
        });

        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        $('#statTotalGames').text(total);
        $('#statWins').text(wins);
        $('#statLosses').text(losses);
        $('#statDraws').text(draws);
        $('#statWinRate').text(winRate + '%');

        // Filter Games
        const filtered = games.filter(g => {
            const outcome = determineGameOutcome(g);

            if (activeFilter === 'win' && outcome.type !== 'win') return false;
            if (activeFilter === 'loss' && outcome.type !== 'loss') return false;
            if (activeFilter === 'draw' && outcome.type !== 'draw') return false;

            // Search query filter
            if (searchQuery) {
                const matchText = `${g.white} ${g.black} ${g.date} ${g.result} ${g.mode} ${outcome.label}`.toLowerCase();
                if (!matchText.includes(searchQuery.toLowerCase())) return false;
            }

            return true;
        });

        // Render Table
        const $tbody = $('#savedGamesListBody');
        $tbody.empty();

        if (filtered.length === 0) {
            $tbody.append(`
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--mg-text-muted); padding: 35px 20px;">
                        <i class="fas fa-info-circle" style="font-size:20px; margin-bottom:8px; display:block; color:#38bdf8;"></i>
                        ${total === 0 ? 'No played games saved in LocalStorage yet. Play matches in <a href="playcomp.html" style="color:#2563eb; font-weight:600;">Play vs Computer</a> or <a href="playonline.html" style="color:#16a34a; font-weight:600;">Play Online Arena</a> to record history!' : 'No matches found matching the selected filter.'}
                    </td>
                </tr>
            `);
            return;
        }

        filtered.forEach(g => {
            const outcome = determineGameOutcome(g);

            const row = `
                <tr>
                    <td><i class="far fa-clock" style="color:var(--mg-text-muted); margin-right:4px;"></i> ${g.date}</td>
                    <td><strong style="color:var(--mg-text-title);">${g.white}</strong> vs <strong style="color:var(--mg-text-title);">${g.black}</strong></td>
                    <td><span style="font-size:12px; color:var(--mg-text-desc); background:var(--mg-input-bg); border:1px solid var(--mg-border); padding:2px 6px; border-radius:4px;">${g.mode || 'Game'}</span></td>
                    <td><span style="padding: 3px 8px; font-size:11px; border-radius:4px; font-weight:600; white-space:nowrap; ${outcome.badgeStyle}">${outcome.label}</span></td>
                    <td>${g.moveCount || 0} moves</td>
                    <td>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button class="btn-action btn-review-game" data-id="${g.id}" style="background:#2563eb; color:#fff;" title="Review Move-by-Move">
                                <i class="fas fa-eye"></i> Review
                            </button>
                            <button class="btn-action btn-download-game" data-id="${g.id}" style="background:#16a34a; color:#fff;" title="Download PGN">
                                <i class="fas fa-download"></i> PGN
                            </button>
                            <button class="btn-action btn-delete-game" data-id="${g.id}" style="background:rgba(239,68,68,0.15); color:#dc2626; border:1px solid rgba(239,68,68,0.3);" title="Delete Game">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    // Filter button clicks
    $('.filter-btn').on('click', function () {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        activeFilter = $(this).data('filter');
        renderDashboard();
    });

    // Search input
    $('#txtSearchGames').on('input', function () {
        searchQuery = $(this).val();
        renderDashboard();
    });

    // Review Game Handler
    $(document).on('click', '.btn-review-game', function () {
        const gameId = $(this).data('id');
        const games = MChessGameHistory.getSavedGames() || [];
        const game = games.find(g => g.id === gameId);

        if (game && game.pgn) {
            const normalized = MChessGameHistory.normalizeGameRecord(game);
            activePgn = normalized.pgn;

            $('#reviewGameTitle').text(`Review: ${normalized.white} vs ${normalized.black} (${normalized.result})`);
            $('#mchessReviewBoardSlot').empty();

            $('#reviewBoardContainer').slideDown(250, function () {
                reviewBoardInstance = new MChessBoard('#mchessReviewBoardSlot', {
                    pgn: normalized.pgn,
                    showSelect: false,
                    autoPlay: false
                });

                $('html, body').animate({
                    scrollTop: $('#reviewBoardContainer').offset().top - 70
                }, 350);
            });
        }
    });

    // Close Review Handler
    $('#btnCloseReview').on('click', function () {
        $('#reviewBoardContainer').slideUp(200);
        $('#mchessReviewBoardSlot').empty();
        reviewBoardInstance = null;
    });

    // Single Game Download
    $(document).on('click', '.btn-download-game', function () {
        const gameId = $(this).data('id');
        const games = MChessGameHistory.getSavedGames() || [];
        const game = games.find(g => g.id === gameId);
        if (game && game.pgn) {
            const normalized = MChessGameHistory.normalizeGameRecord(game);
            MChessGameHistory.downloadPgn(normalized.pgn, `mchess_${game.white}_vs_${game.black}_${game.id}.pgn`);
        }
    });

    $('#btnDownloadCurrentPgn').on('click', function () {
        if (activePgn) {
            MChessGameHistory.downloadPgn(activePgn, `mchess_review_${Date.now()}.pgn`);
        }
    });

    // Delete Single Game
    $(document).on('click', '.btn-delete-game', function () {
        const gameId = $(this).data('id');
        if (confirm("Are you sure you want to delete this game record?")) {
            MChessGameHistory.deleteGame(gameId);
            renderDashboard();
        }
    });

    // Export All Games as Multi-PGN
    $('#btnExportAllPgn').on('click', function () {
        const games = MChessGameHistory.getSavedGames() || [];
        if (games.length === 0) {
            alert("No saved games found to export.");
            return;
        }
        const multiPgn = games.map(g => (g.pgn || '').trim()).filter(p => p.length > 0).join('\n\n\n');
        MChessGameHistory.downloadPgn(multiPgn, `mchess_all_games_${Date.now()}.pgn`);
    });

    // Clear All History
    $('#btnClearHistory').on('click', function () {
        if (confirm("Are you sure you want to clear your entire game history from LocalStorage? This action cannot be undone.")) {
            MChessGameHistory.clearAllHistory();
            $('#reviewBoardContainer').hide();
            $('#mchessReviewBoardSlot').empty();
            renderDashboard();
        }
    });

    // Initial Render
    renderDashboard();
});
