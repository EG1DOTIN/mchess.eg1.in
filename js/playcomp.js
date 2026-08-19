$(document).ready(function() {
    if (typeof csoPlayVsComputer === 'function') {
        csoPlayVsComputer({
            boardStyle: "default",
            pieceStyle: "alpha",
            showCoordinates: true,
            width: 580,
        });
    }
});

function disableScroll() {
    document.body.classList.add("stop-scrolling");
}

function enableScroll() {
    document.body.classList.remove("stop-scrolling");
}
