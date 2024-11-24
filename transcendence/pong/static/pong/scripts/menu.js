document.addEventListener("DOMContentLoaded", function() 
{
    // Récupération des éléments spécifiques au Memory
    const mainMenuCanvas = document.getElementById('mainMenuCanvas-memory');
    const singleplayerButton = document.getElementById('singleplayerButton-memory');
    const multiplayerButton = document.getElementById('multiplayerButton-memory');
    const leftSide = document.getElementById('leftSideM');
    const rightSide = document.getElementById('rightSideM');
	const cross = document.getElementById('closeModalM');

    const difficultyMenu = document.getElementById('difficulty-menu-m');
    const multiplayerMenu = document.getElementById('multiplayer-menu-memory');
    const memoryGameContainer = document.getElementById('memory-game-container');
	const shuffleOption = document.getElementById('gamecustom-shuffle');
	const hintOption = document.getElementById('gamecustom-hint');

    const startSoloGameBtn = document.getElementById('start-solo-game-btn-memo');
    const goBackBtn = document.getElementById('go-back-btn-memo');
    const returnMenuBtn = document.getElementById('return-menu-btn-memo');

    // Masquer les sous-menus au chargement
    difficultyMenu.style.display = 'none';
	shuffleOption.style.display = 'none';
	hintOption.style.display = 'none';
    multiplayerMenu.style.display = 'none';
    returnMenuBtn.style.display = 'none';
    memoryGameContainer.style.display = 'none';

	cross.addEventListener('click', function()
	{ 
		resetToMainMenu();
	});

    // Bouton Solo
    leftSide.addEventListener('click', function() 
	{
        mainMenuCanvas.style.display = 'none';
        singleplayerButton.style.display = 'none';
        multiplayerButton.style.display = 'none';
		leftSide.style.display = 'none';
        rightSide.style.display = 'none';
        difficultyMenu.style.display = 'block';
		shuffleOption.style.display = 'block';
		hintOption.style.display = 'block';
        startSoloGameBtn.style.display = 'block';
        returnMenuBtn.style.display = 'block';
        startSoloGameBtn.textContent = 'Start Game';  // Changer le texte du bouton
    });

    // Bouton Multijoueur
    rightSide.addEventListener('click', function() {
        mainMenuCanvas.style.display = 'none';
        singleplayerButton.style.display = 'none';
        multiplayerButton.style.display = 'none';
        multiplayerMenu.style.display = 'flex';
		leftSide.style.display = 'none';
        rightSide.style.display = 'none';
        difficultyMenu.style.display = 'none';
		shuffleOption.style.display = 'none';
		hintOption.style.display = 'none';
        startSoloGameBtn.style.display = 'none';
        goBackBtn.style.display = 'inline-block';
        goBackBtn.textContent = 'Return to Menu';
    });

    // Gestion du bouton Go Back
    goBackBtn.addEventListener('click', function() {
		goBackBtn.style.display = 'none';
        resetToMainMenu();
    });

    returnMenuBtn.addEventListener('click', function() {

        resetToMainMenu();
    });


    // Fonction pour gérer le retour au menu principal
    function resetToMainMenu() {
        mainMenuCanvas.style.display = 'block';
        singleplayerButton.style.display = 'block';
        multiplayerButton.style.display = 'block';
        difficultyMenu.style.display = 'none';
		shuffleOption.style.display = 'none';
		hintOption.style.display = 'none';
        multiplayerMenu.style.display = 'none';
        returnMenuBtn.style.display = 'none';
        memoryGameContainer.style.display = 'none';
		leftSide.style.display = 'flex';
        rightSide.style.display = 'flex';
		singleplayerButton.style.display = 'block';
        multiplayerButton.style.display = 'block';
    }
	

});

// Affiche le menu de sélection de difficulté pour le jeu de memory
function showMemoryMenu() {
    document.getElementById('memory-menu').style.display = 'block';
    document.getElementById('memoryCanvas').style.display = 'none';
    document.getElementById('start-memory-game-btn').textContent = 'Start Game';
}


// Réinitialise l'interface pour revenir au menu principal
function resetMemoryMainMenu() {
    document.getElementById('mainMemoryMenu').style.display = 'block';
    document.getElementById('leftSide').style.display = 'flex';
    document.getElementById('rightSide').style.display = 'flex';
    document.getElementById('singleplayerButton').style.display = 'block';
    document.getElementById('memory-menu').style.display = 'none';
    document.getElementById('memoryCanvas').style.display = 'none';
    document.getElementById('start-solo-game-btn-memo').style.display = 'none';
}


