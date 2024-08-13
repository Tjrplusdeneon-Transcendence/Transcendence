// /!\ Trop long. A trier dans des fichiers differents

// En vrai c'est pas une "ia" a proprement parlé donc ne compte pas vraiment dans le module ?

const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let paddleHeight = 100, paddleWidth = 10;
let paddleY1 = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = 4;
let dy = -4;

let mouseY = canvas.height / 2; // Position de la souris initiale
let gameRunning = false; 
let winner = ''; // Nom du joueur gagnant

let isAIEnabled = false; // Indique si l'IA est activée
const aiSpeed = 4; // Vitesse de l'IA (pour ajuster sa difficulté)

// Fonction pour dessiner la palette
function drawPaddle(x, y) 
{
    context.beginPath();
    context.rect(x, y, paddleWidth, paddleHeight);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
}

// Fonction pour dessiner la balle
function drawBall() 
{
    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#0095DD';
    context.fill();
    context.closePath();
}

// Fonction pour dessiner le message de perte
function drawLossMessage() 
{
    context.font = '30px Arial';
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.fillText(`Game Over! ${winner} Wins!`, canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block'; // Affiche le bouton de redémarrage
}

// Fonction pour gérer le mouvement de l'IA
function moveAI() 
{
    if (y > paddleY2 + paddleHeight / 2) 
        paddleY2 += aiSpeed;
    else
        paddleY2 -= aiSpeed;

    // L'IA perd volontairement parfois (10% de chances)
    if (Math.random() < 0.1) 
        paddleY2 += aiSpeed * 2; // Déplace l'IA loin de la balle

    // Empêche l'IA de sortir du canvas
    if (paddleY2 < 0)
        paddleY2 = 0;

    if (paddleY2 > canvas.height - paddleHeight) 
        paddleY2 = canvas.height - paddleHeight;

}

// Fonction pour dessiner le jeu
function draw() 
{
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(0, paddleY1); // Palette du joueur 1
    drawPaddle(canvas.width - paddleWidth, paddleY2); // Palette du joueur 2 ou de l'IA
    drawBall();

    // Déplace la palette du joueur 1 en fonction de la souris
    paddleY1 = mouseY - paddleHeight / 2;

    // Gère le mouvement de l'IA si elle est activée
    if (isAIEnabled) 
        moveAI();

    // Vérifie si la balle touche le bord gauche ou droit du canvas (conditions de perte)
    if (x + dx < ballRadius) 
    {
        winner = isAIEnabled ? 'AI' : 'Player 2';
        gameRunning = false;
        drawLossMessage();
        return;
    } 
    else if (x + dx > canvas.width - ballRadius) 
    {
        winner = 'Player 1';
        gameRunning = false;
        drawLossMessage();
        return;
    }

    // Vérifie les collisions avec les palettes
    if (x + dx < paddleWidth + ballRadius && y > paddleY1 && y < paddleY1 + paddleHeight) 
        dx = -dx;
    else if (x + dx > canvas.width - paddleWidth - ballRadius && y > paddleY2 && y < paddleY2 + paddleHeight)
        dx = -dx;
    

    // Vérifie les collisions avec les murs (haut et bas)
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius)
        dy = -dy;

    x += dx;
    y += dy;

    if (gameRunning) 
        requestAnimationFrame(draw);
    
}

//Verifie si joueur 1 est solo
async function isPlayer2Registered() 
{
    try 
    {
        const response = await fetch(`${apiUrl}/tournament`);
        if (!response.ok) 
            throw new Error('Network response was not ok');
        
        const tournaments = await response.json();
        // Vérifier s'il y a un tournoi en cours avec un joueur 2
        for (const tournament of tournaments) 
        {
            const player2 = tournament.players.find(player => player.alias === 'Player2');
            if (player2) 
                return true; // Joueur 2 trouvé
        }
        return false;
    } 
    catch (error) 
    {
        console.error('Error checking Player 2 registration:', error);
        return false;
    }
}

function player2Exists() 
{
    return isPlayer2Registered().then(isRegistered => {
        return isRegistered; // Renvoie true si le joueur 2 est enregistré
    }).catch(error => {
        console.error('Error checking if Player 2 exists:', error);
        return false; // En cas d'erreur, on suppose que le joueur 2 n'est pas présent
    });
}

function startGame() 
{
    player2Exists().then(exists => {
        isAIEnabled = !exists; // Active l'IA si le joueur 2 n'existe pas
        document.getElementById('pongCanvas').style.display = 'block'; // Affiche le canvas
        restartButton.style.display = 'none'; // Cache le bouton de redémarrage
        gameRunning = true; // Démarre le jeu
        x = canvas.width / 2;
        y = canvas.height / 2;
        dx = 4;
        dy = -4;
        draw(); // Démarre l'affichage
    });
}

function restartGame() 
{
    winner = '';
    startGame();
}

// Cache le canvas du jeu au départ
document.getElementById('pongCanvas').style.display = 'none';

// Ajoute un gestionnaire d'événements pour suivre la position de la souris
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = event.clientY - rect.top; // Ajuste la position Y de la souris relative au canvas

    // Empêche la palette de sortir du canvas
    if (mouseY < paddleHeight / 2) 
        mouseY = paddleHeight / 2;

    if (mouseY > canvas.height - paddleHeight / 2) 
        mouseY = canvas.height - paddleHeight / 2;
});

// Ajoute un gestionnaire d'événements pour le bouton de démarrage
document.getElementById('start-game-btn').addEventListener('click', startGame);

// Ajoute un bouton pour redémarrer le jeu
const restartButton = document.createElement('button');
restartButton.textContent = 'Restart Game';
document.body.appendChild(restartButton);
restartButton.style.display = 'none'; // Cache le bouton au départ
restartButton.addEventListener('click', restartGame);
