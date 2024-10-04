const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let paddleHeight = 100, paddleWidth = 10;
let paddleY1 = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = -4;
let dy = -4;

let mouseY = canvas.height / 2; // Position de la souris initiale
let gameRunning = false; 
let winner = '';

let isAIEnabled = false;
let aiReactionTime = 1000; 
let aiInterval; // Gestionnaire d'intervalle pour la prise de décision de l'IA
let aiTargetY = canvas.height / 2; // Position cible pour que l'IA déplace sa raclette
const errorProbability = 0.1; // Probabilitee d'erreur de l'ia
const predictionErrorMargin = 50; // Marge d'erreur en pixel

let difficultySettings = {
    easy: { speedMultiplier: 1.02, aiSpeed: 6 },
    medium: { speedMultiplier: 1.08, aiSpeed: 13 },
    hard: { speedMultiplier: 1.20, aiSpeed: 15 }
};
let currentDifficulty = 'medium';

const aiSpeed = difficultySettings[currentDifficulty].aiSpeed;

function drawPaddle(x, y) 
{
    context.beginPath();
    context.rect(x, y, paddleWidth, paddleHeight);
    context.fillStyle = '#fff';
    context.shadowColor = '#fff';
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
}

function drawBall() 
{
    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#ff9204';
    context.shadowColor = '#ff9204';
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
}

function gameOverMessage() 
{
    context.font = '30px Arial';
    context.fillStyle = 'red';
    context.textAlign = 'center';
    context.fillText(`Game Over! ${winner} Wins!`, canvas.width / 2, canvas.height / 2);
    restartButton.style.display = 'block'; 
}

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

function moveAI() 
{
    if (paddleY2 < aiTargetY) 
        paddleY2 = Math.min(paddleY2 + aiSpeed, Math.min(aiTargetY, canvas.height - paddleHeight));
    else if (paddleY2 > aiTargetY)
        paddleY2 = Math.max(paddleY2 - aiSpeed, Math.max(aiTargetY, 0));    
}

function checkPaddleCollision() 
{
    if (dx < 0 && x + dx < paddleWidth + ballRadius) 
    {
        let futureY = y + dy;

        if (y > paddleY1 && y < paddleY1 + paddleHeight || futureY > paddleY1 && futureY < paddleY1 + paddleHeight) 
        {
            dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
            x = paddleWidth + ballRadius; 
        }
    }

    if (dx > 0 && x + dx > canvas.width - paddleWidth - ballRadius) 
    {
        let futureY = y + dy;

        if (y > paddleY2 && y < paddleY2 + paddleHeight || futureY > paddleY2 && futureY < paddleY2 + paddleHeight) 
        {
            dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
            x = canvas.width - paddleWidth - ballRadius; 
        }
    }
}

function draw() 
{
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(0, paddleY1); 
    drawPaddle(canvas.width - paddleWidth, paddleY2); 
    drawBall();

    paddleY1 = mouseY - paddleHeight / 2;

    if (isAIEnabled) 
        moveAI();

    checkPaddleCollision();

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

    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius)
        dy = -dy;

    x += dx * difficultySettings[currentDifficulty].speedMultiplier;
    y += dy * difficultySettings[currentDifficulty].speedMultiplier;

    if (gameRunning) 
        requestAnimationFrame(draw);
}

/*function draw() (A GARDER SI JAMAIS)
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
        dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
    else if (x + dx > canvas.width - paddleWidth - ballRadius && y > paddleY2 && y < paddleY2 + paddleHeight)
        dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;

    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius)
        dy = -dy;

    x += dx * difficultySettings[currentDifficulty].speedMultiplier;
    y += dy * difficultySettings[currentDifficulty].speedMultiplier;
    if (gameRunning)
        requestAnimationFrame(draw);
}*/

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
        return isRegistered;
    }).catch(error => {
        console.error('Error checking if Player 2 exists:', error);
        return false;
    });
}

function startGame() 
{
    player2Exists().then(exists => {
        isAIEnabled = !exists;

        if (isAIEnabled) 
            aiInterval = setInterval(aiDecision, aiReactionTime);

        document.getElementById('pongCanvas').style.display = 'block';
        gameRunning = true;
        x = canvas.width / 2;
        y = canvas.height / 2;
        draw();


    });
}

function restartPong() 
{
    clearInterval(aiInterval);

    paddleY1 = (canvas.height - paddleHeight) / 2;
    paddleY2 = (canvas.height - paddleHeight) / 2;
    x = canvas.width / 2;
    y = canvas.height / 2;
    dx = -4;
    dy = -4;

    gameRunning = false;
    winner = '';
    aiTargetY = canvas.height / 2;
    isAIEnabled = false;

    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';

    const startButton = document.getElementById('start-pong-game-btn');
    startButton.textContent = 'Start Game';

    startButton.removeEventListener('click', restartPong);
    startButton.addEventListener('click', startGame);
}

document.getElementById('pongCanvas').style.display = 'none'; 

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = event.clientY - rect.top;

    if (mouseY < paddleHeight / 2) 
        mouseY = paddleHeight / 2;
    if (mouseY > canvas.height - paddleHeight / 2)
        mouseY = canvas.height - paddleHeight / 2;
});

document.getElementById('start-pong-game-btn').addEventListener('click', function() {
    document.getElementById('pongCanvas').style.pointerEvents = 'auto';
    const selectedDifficulty = document.getElementById('difficultySelect').value;
    currentDifficulty = selectedDifficulty;

    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'block';

    const startButton = document.getElementById('start-pong-game-btn');
    startButton.textContent = 'Restart Game';

    startButton.removeEventListener('click', startGame);
    startButton.addEventListener('click', restartPong);

    startGame();
});
