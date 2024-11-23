
const gameContainers = document.getElementById('doom-game-container');

function startdoomGame() {
    gameContainers.innerHTML = '';

    const doomIframe = document.createElement('iframe');
    doomIframe.src = './static/doom/index.html';
    doomIframe.style.width = '100%';
    doomIframe.style.height = '100%';
    doomIframe.style.border = 'none';

    const quitButton = document.createElement('button');
    quitButton.textContent = 'Quitter doom Game';
    quitButton.style.position = 'absolute';
    quitButton.style.top = '10px';
    quitButton.style.left = '10px';
    quitButton.style.zIndex = '1000';
    quitButton.addEventListener('click', quitdoomGame);

    gameContainers.appendChild(doomIframe);
    gameContainers.appendChild(quitButton);
}

function quitdoomGame() {
    gameContainers.innerHTML = '<p>Retour à la sélection des jeux.</p>';
}

document.getElementById('start-doom-game-btn').addEventListener('click', startdoomGame);

// Bouton pour lancer doom Game (DOOM)
document.getElementById("start-doom-game-btn").addEventListener("click", () => {
    // Cache le carrousel et affiche le container de doom Game (DOOM)
    document.getElementById("carouselIndicators").style.display = "none";
    document.getElementById("doom-game-container").style.display = "block";
});

document.addEventListener("DOMContentLoaded", function () {
    // Sélectionne la modale de DOOM
    const doomModal = document.getElementById("doomModal");
    if (doomModal) {
        // Ajoute un gestionnaire pour l'événement "hidden.bs.modal"
        doomModal.addEventListener("hidden.bs.modal", function () {
            // Fais défiler jusqu'à la section des choix de jeux
            const gameCarousel = document.getElementById("carouselIndicators");
            if (gameCarousel) {
                gameCarousel.scrollIntoView({ behavior: "smooth" });
            } else {
                console.error("carouselIndicators not found!");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const playDoomBtn = document.getElementById("play-doom-btn");
    const doomGameContainer = document.getElementById("doom-game-container");

    if (playDoomBtn && doomGameContainer) {
        playDoomBtn.addEventListener("click", function () {
            // Lancer automatiquement le jeu dans le conteneur
            const dosbox_DOOM = new Dosbox({
                id: "doom-game-container",
                onload: function (dosbox) {
                    dosbox.run("https://thedoggybrad.github.io/doom_on_js-dos/DOOM-@evilution.zip", "./DOOM/DOOM.EXE");
                }
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const doomModal = document.getElementById("doomModal");
    const gameCarousel = document.getElementById("carouselIndicators");
    let dosbox_DOOM = null; // Variable pour stocker l'instance du jeu

    // Démarrer le jeu automatiquement
    const playDoomBtn = document.getElementById("play-doom-btn");
    if (playDoomBtn) {
        playDoomBtn.addEventListener("click", function () {
            const doomGameContainer = document.getElementById("doom-game-container");
            if (doomGameContainer) {
                // Initialiser et démarrer le jeu
                dosbox_DOOM = new Dosbox({
                    id: "doom-game-container",
                    onload: function (dosbox) {
                        dosbox.run("https://thedoggybrad.github.io/doom_on_js-dos/DOOM-@evilution.zip", "./DOOM/DOOM.EXE");
                    }
                });
            }
        });
    }

    // Nettoyer le jeu et revenir au carrousel lorsque le modale est fermé
    if (doomModal) {
        doomModal.addEventListener("hidden.bs.modal", function () {
            if (dosbox_DOOM) {
                dosbox_DOOM.stop(); // Arrêter proprement le jeu
                dosbox_DOOM = null; // Réinitialiser l'instance
            }

            // Faire défiler vers le carrousel
            if (gameCarousel) {
                gameCarousel.scrollIntoView({ behavior: "smooth" });
            } else {
                console.error("carouselIndicators not found!");
            }
        });
    }
});
