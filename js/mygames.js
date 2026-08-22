/**
 * @file mygames.js
 * @description Dashboard controller, statistics calculation, game history filters, and interactive review launcher for mygames.html.
 */

$(document).ready(function () {
    let activeFilter = 'all';
    let searchQuery = '';
    let activePgn = '';

    // Load and Render Games and Statistics
    function renderDashboard() {
        const games = MChessGameHistory.getSavedGames() || [];
        
        // Calculate Stats
        let total = games.length;
        let wins = 0;
        let losses = 0;
        let draws = 0;

        games.forEach(g => {
            const res = (g.result || '').toLowerCase();
            if (res.includes('1-0') && (g.white.toLowerCase().includes('you') || g.white.toLowerCase().includes('player'))) {
                wins++;
            } else if (res.includes('0-1') && (g.black.toLowerCase().includes('you') || g.black.toLowerCase().includes('player'))) {
                wins++;
            } else if (res.includes('1/2') || res.includes('draw')) {
                draws++;
            } else if (res.includes('1-0') || res.includes('0-1')) {
                losses++;
            }
        });

        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        $('#statTotalGames').text(total);
        $('#statWins').text(wins);
        $('#statLosses').text(losses);
        $('#statDraws').text(draws);
        $('#statWinRate').text(winRate + '%');

        // Filter Games
        const filtered = games.filter(g => {
            // Category filter
            const res = (g.result || '').toLowerCase();
            const isWin = (res.includes('1-0') && (g.white.toLowerCase().includes('you') || g.white.toLowerCase().includes('player'))) ||
                          (res.includes('0-1') && (g.black.toLowerCase().includes('you') || g.black.toLowerCase().includes('player')));
            const isDraw = res.includes('1/2') || res.includes('draw');
            const isLoss = !isWin && !isDraw && (res.includes('1-0') || res.includes('0-1') || res.includes('resignation') || res.includes('time out'));

            if (activeFilter === 'win' && !isWin) return false;
            if (activeFilter === 'loss' && !isLoss) return false;
            if (activeFilter === 'draw' && !isDraw) return false;

            // Search filter
            if (searchQuery) {
                const matchText = `${g.white} ${g.black} ${g.date} ${g.result} ${g.mode}`.toLowerCase();
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
            let resultBadgeClass = 'background: rgba(100, 116, 139, 0.15); color: var(--mg-text-desc); border: 1px solid var(--mg-border);';
            if (g.result.includes('1-0')) resultBadgeClass = 'background: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.4);';
            else if (g.result.includes('0-1')) resultBadgeClass = 'background: rgba(239, 68, 68, 0.15); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.4);';
            else if (g.result.includes('1/2')) resultBadgeClass = 'background: rgba(234, 179, 8, 0.15); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.4);';

            const row = `
                <tr>
                    <td><i class="far fa-clock" style="color:var(--mg-text-muted); margin-right:4px;"></i> ${g.date}</td>
                    <td><strong style="color:var(--mg-text-title);">${g.white}</strong> vs <strong style="color:var(--mg-text-title);">${g.black}</strong></td>
                    <td><span style="font-size:12px; color:var(--mg-text-desc); background:var(--mg-input-bg); border:1px solid var(--mg-border); padding:2px 6px; border-radius:4px;">${g.mode || 'Game'}</span></td>
                    <td><span style="padding: 2px 8px; font-size:11px; border-radius:4px; font-weight:600; ${resultBadgeClass}">${g.result}</span></td>
                    <td>${g.moveCount || 0} moves</td>
                    <td>
                        <button class="btn-action btn-review-game" data-id="${g.id}" style="background:#2563eb; color:#fff;" title="Review Move-by-Move">
                            <i class="fas fa-eye"></i> Review
                        </button>
                        <button class="btn-action btn-download-game" data-id="${g.id}" style="background:#16a34a; color:#fff;" title="Download PGN">
                            <i class="fas fa-download"></i> PGN
                        </button>
                        <button class="btn-action btn-delete-game" data-id="${g.id}" style="background:rgba(239,68,68,0.15); color:#dc2626; border:1px solid rgba(239,68,68,0.3);" title="Delete Game">
                            <i class="fas fa-trash"></i>
                        </button>
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
            $('#reviewGameTitle').text(`${normalized.white} vs ${normalized.black} (${normalized.date})`);
            $('#reviewBoardContainer').slideDown(250);

            $('#mchessReviewBoardSlot').empty();
            new MChessBoard('#mchessReviewBoardSlot', {
                pgn: normalized.pgn,
                showSelect: false,
                autoPlay: false
            });

            $('html, body').animate({
                scrollTop: $('#reviewBoardContainer').offset().top - 80
            }, 350);
        }
    });

    // Close Review Handler
    $('#btnCloseReview').on('click', function () {
        $('#reviewBoardContainer').slideUp(200);
    });

    // Single Game Download
    $(document).on('click', '.btn-download-game', function () {
        const gameId = $(this).data('id');
        const games = MChessGameHistory.getSavedGames() || [];
        const game = games.find(g => g.id === gameId);
        if (game && game.pgn) {
            MChessGameHistory.downloadPgn(game.pgn, `mchess_game_${game.id}.pgn`);
        }
    });

    $('#btnDownloadCurrentPgn').on('click', function () {
        if (activePgn) {
            MChessGameHistory.downloadPgn(activePgn, 'mchess_reviewed_game.pgn');
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
        const multiPgn = games.map(g => g.pgn || '').filter(p => p.length > 0).join('\n\n\n');
        MChessGameHistory.downloadPgn(multiPgn, `mchess_all_games_${Date.now()}.pgn`);
    });

    // Clear All History
    $('#btnClearHistory').on('click', function () {
        if (confirm("Are you sure you want to clear your entire game history from LocalStorage? This action cannot be undone.")) {
            MChessGameHistory.clearAllHistory();
            $('#reviewBoardContainer').hide();
            renderDashboard();
        }
    });

    // Initial Render
    renderDashboard();
});
