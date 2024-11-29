const gameContainers = document.getElementById("doom-game-container");
const carousel = document.getElementById("carouselIndicators");
const startDoomBtn = document.getElementById("start-doom-game-btn");

function startdoomGame() {
    carousel.style.display = "none";
    gameContainers.style.display = "block";

    gameContainers.innerHTML = ""; 
    const doomIframe = document.createElement("iframe");
    doomIframe.src = "./static/doom/index.html"; 
    doomIframe.style.width = "100%";
    doomIframe.style.height = "100%";
    doomIframe.style.border = "none";

    const quitButton = document.createElement("button");
    quitButton.textContent = "X";
    quitButton.style.position = "absolute";
    quitButton.style.top = "10px";
    quitButton.style.right = "10px";
    quitButton.style.zIndex = "1000";
    quitButton.addEventListener("click", quitdoomGame);

    gameContainers.appendChild(doomIframe);
}

function quitdoomGame() {
    gameContainers.innerHTML = "<p>Retour à la sélection des jeux.</p>";

    gameContainers.style.display = "none";
    carousel.style.display = "block";

    carousel.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("start-doom-game-btn").addEventListener("click", function() {
    document.getElementById("start-doom-game-btn").style.display = "none";
    startdoomGame();
});
document.addEventListener("DOMContentLoaded", function () {
    const doomModal = document.getElementById("doomModal");
    if (doomModal) {
        doomModal.addEventListener("hidden.bs.modal", quitdoomGame);
    }
});

if (doomModal) {
    // Démarre le jeu lorsque le modal est affiché
    doomModal.addEventListener("shown.bs.modal", function () {
        startdoomGame();
    });

    // Nettoie et réinitialise lorsque le modal est fermé
    doomModal.addEventListener("hidden.bs.modal", function () {
        quitdoomGame();
    });
}