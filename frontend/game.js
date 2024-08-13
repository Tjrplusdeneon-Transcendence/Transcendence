// /!\ Trop long. A trier dans des fichiers differents

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
let winner = '';

let isAIEnabled = false; 
const aiSpeed = 10; 
let aiReactionTime = 1000; 
let aiInterval; // Gestionnaire d'intervalle pour la prise de décision de l'IA
let aiTargetY = canvas.height / 2; // Position cible pour que l'IA déplace sa palette
const errorProbability = 0.1; // Probabilitee d'erreur de l'ia (20%)
const predictionErrorMargin = 30; // Marge d'ereur en pixel

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
function gameOverMessage() 
{
    context.font = '30px Arial';
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.fillText(`Game Over! ${winner} Wins!`, canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block'; // Affiche le bouton de redémarrage
}

// Fonction pour que l'IA tente de predire la future position de la balle
function predictBallPosition() 
{

    let predictedX = x;
    let predictedY = y;
    let predictedDx = dx;
    let predictedDy = dy;

    while (predictedX > paddleWidth + ballRadius && predictedX < canvas.width - paddleWidth - ballRadius) 
    {
        predictedX += predictedDx;
        predictedY += predictedDy;

        
        if (predictedY + predictedDy > canvas.height - ballRadius || predictedY + predictedDy < ballRadius) 
            predictedDy = -predictedDy;
    }

    if (Math.random() < errorProbability) 
        predictedY += (Math.random() * predictionErrorMargin * 2) - predictionErrorMargin;

    return predictedY;
}

// Fonction de prise de décision de l'IA
function aiDecision() 
{
    const predictedY = predictBallPosition();

    if (predictedY < paddleY2 + paddleHeight / 2)
        aiTargetY = Math.max(predictedY - paddleHeight / 2, 0);
    else if (predictedY > paddleY2 + paddleHeight / 2) 
        aiTargetY = Math.min(predictedY - paddleHeight / 2, canvas.height - paddleHeight);

    if (Math.random() < errorProbability) 
        aiTargetY += (Math.random() * predictionErrorMargin * 2) - predictionErrorMargin;
}

// Fonction pour déplacer la palette de l'IA
function moveAI() 
{
    if (paddleY2 < aiTargetY) 
        paddleY2 = Math.min(paddleY2 + aiSpeed, aiTargetY);
    else if (paddleY2 > aiTargetY)
        paddleY2 = Math.max(paddleY2 - aiSpeed, aiTargetY);
}

// Fonction pour dessiner le jeu
function draw() 
{
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(0, paddleY1); 
    drawPaddle(canvas.width - paddleWidth, paddleY2); 
    drawBall();

    paddleY1 = mouseY - paddleHeight / 2;

    if (isAIEnabled)
        moveAI();

    if (x + dx < ballRadius) 
    {
        winner = isAIEnabled ? 'AI' : 'Player 2';
        gameRunning = false;
        gameOverMessage();
        return;
    } 
    else if (x + dx > canvas.width - ballRadius) 
    {
        winner = 'Player 1';
        gameRunning = false;
        gameOverMessage();
        return;
    }

    if (x + dx < paddleWidth + ballRadius && y > paddleY1 && y < paddleY1 + paddleHeight) 
        dx = -dx;
    else if (x + dx > canvas.width - paddleWidth - ballRadius && y > paddleY2 && y < paddleY2 + paddleHeight)
        dx = -dx;


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
        isAIEnabled = !exists;

        if (isAIEnabled) 
            aiInterval = setInterval(aiDecision, aiReactionTime); // L'IA prend des décisions toutes les secondes

        document.getElementById('pongCanvas').style.display = 'block';
        restartButton.style.display = 'none';
        gameRunning = true;
        x = canvas.width / 2;
        y = canvas.height / 2;
        dx = 2;
        dy = -2;
        draw();
    });
}

function restartGame() 
{
    clearInterval(aiInterval); // Efface l'intervalle de prise de décision de l'IA
    winner = '';
    startGame();
}

// Cache le canvas au départ
document.getElementById('pongCanvas').style.display = 'none';

// Mouvement de la souris
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = event.clientY - rect.top;

    if (mouseY < paddleHeight / 2) {
        mouseY = paddleHeight / 2;
    }
    if (mouseY > canvas.height - paddleHeight / 2) {
        mouseY = canvas.height - paddleHeight / 2;
    }
});

// Bouton de démarrage du jeu
document.getElementById('start-game-btn').addEventListener('click', startGame);

// Bouton de redémarrage
const restartButton = document.createElement('button');
restartButton.textContent = 'Restart Game';
document.body.appendChild(restartButton);
restartButton.style.display = 'none';
restartButton.addEventListener('click', restartGame);
