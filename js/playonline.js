/**
 * @file playonline.js
 * @description Page-specific lifecycle and player identity controller for playonline.html.
 */

$(document).ready(function () {
    // Load and initialize Player Name
    let p2pEngine = null;
    const savedName = localStorage.getItem('mchess_player_name') || 'Guest Player';
    $('#lblPlayerNameDisplay').text(savedName);
    $('#txtNewPlayerName').val(savedName);

    $('#btnEditPlayerIdentity').on('click', function () {
        $(this).hide();
        $('#lblPlayerNameDisplay').hide();
        $('#pnlPlayerNameEditor').css('display', 'inline-flex');
        $('#txtNewPlayerName').focus();
    });

    $('#btnSaveNewPlayerName').on('click', function () {
        const newName = $('#txtNewPlayerName').val().trim() || 'Guest Player';
        localStorage.setItem('mchess_player_name', newName);
        $('#lblPlayerNameDisplay').text(newName).show();
        $('#btnEditPlayerIdentity').show();
        $('#pnlPlayerNameEditor').hide();

        if (p2pEngine) {
            p2pEngine.playerName = newName;
            p2pEngine.registerLobbyPresence();
        }
    });

    // Initialize MChessP2P Engine
    p2pEngine = new MChessP2P({
        boardContainerId: 'mchessP2pBoard',
        lobbyTableBodyId: 'onlineLobbyTableBody',
        defaultTimeMinutes: 5
    });
});
