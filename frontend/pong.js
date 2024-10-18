const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let paddleHeight = 100, paddleWidth = 10;
let paddleY1 = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = -200; // Vitesse de la balle en pixels par seconde
let dy = -200; // Vitesse de la balle en pixels par seconde

let mouseY = canvas.height / 2; 
let gameRunning = false; 
let lastTime = 0; // Stocke le temps de la dernière frame

let winner = '';
let isAIEnabled = false;
let aiReactionTime = 1000;
let aiLastReactionTime = 0;
let aiTargetY = canvas.height / 2; 
const errorProbabilityBase = 0.01; // Probabilité de base plus réaliste pour tester
const maxErrorOffset = 50; // Décalage maximal en pixels
let aiErrorCooldown = 0; // Temps avant que l'IA puisse faire une nouvelle prédiction
const aiCooldownTime = 1.0; // Délai en secondes entre chaque nouvelle décision
let aiMistake = false; // Indique si l'IA a fait une erreur

let aiDecisionTime = 0;
const aiDecisionInterval = 1.0;

let difficultySettings = {
    easy: { speedMultiplier: 1.02, aiSpeed: 300 },
    medium: { speedMultiplier: 1.08, aiSpeed: 500 },
    hard: { speedMultiplier: 1.20, aiSpeed: 600 }
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
}

function calculateErrorProbability() 
{
    const scaledProbability = Math.pow(errorProbabilityBase, 2);
    return Math.random() < scaledProbability;
}

function predictBallPosition() 
{
    let predictedX = x;
    let predictedY = y;
    let predictedDx = dx;
    let predictedDy = dy;

    while (predictedX > paddleWidth + ballRadius && predictedX < canvas.width - paddleWidth - ballRadius) 
    {
        let timeToVerticalWall = predictedDx > 0
            ? (canvas.width - paddleWidth - ballRadius - predictedX) / predictedDx
            : (paddleWidth + ballRadius - predictedX) / predictedDx;
        
        let timeToHorizontalWall = predictedDy > 0
            ? (canvas.height - ballRadius - predictedY) / predictedDy
            : (ballRadius - predictedY) / predictedDy;

        let timeToNextEvent = Math.min(timeToVerticalWall, timeToHorizontalWall);

        predictedX += predictedDx * timeToNextEvent;
        predictedY += predictedDy * timeToNextEvent;

        if (predictedY + predictedDy > canvas.height - ballRadius || predictedY + predictedDy < ballRadius) 
            predictedDy = -predictedDy;
    }

    return predictedY;
}

function aiDecision(deltaTime) 
{
    aiDecisionTime += deltaTime;

    if (aiDecisionTime >= aiDecisionInterval) 
    {
        let predictedY = predictBallPosition();

        if (calculateErrorProbability()) 
        {
            let errorOffset = (Math.random() * maxErrorOffset * 2) - maxErrorOffset;
            predictedY += errorOffset; 
            console.log("Error");
        }

        aiTargetY = Math.min(Math.max(predictedY - paddleHeight / 2, 0), canvas.height - paddleHeight);
        aiDecisionTime = 0; 
    }
}

function moveAI(deltaTime) 
{
    let distanceToTarget = aiTargetY - paddleY2;
    let direction = Math.sign(distanceToTarget);

    let adjustedSpeed = aiSpeed * deltaTime;

    if (Math.abs(distanceToTarget) > 1) 
    {
        paddleY2 += direction * Math.min(Math.abs(distanceToTarget), adjustedSpeed);
    }
}

function checkPaddleCollision(deltaTime) 
{
    if (dx < 0 && x + dx * deltaTime < paddleWidth + ballRadius) 
    {
        let futureY = y + dy * deltaTime;

        if (futureY > paddleY1 && futureY < paddleY1 + paddleHeight) 
        {
            dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
            x = paddleWidth + ballRadius;
        }
    }

    if (dx > 0 && x + dx * deltaTime > canvas.width - paddleWidth - ballRadius) 
    {
        let futureY = y + dy * deltaTime;

        if (futureY > paddleY2 && futureY < paddleY2 + paddleHeight) 
        {
            dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
            x = canvas.width - paddleWidth - ballRadius;
        }
    }
}

function draw(currentTime) 
{
    if (!lastTime) lastTime = currentTime;
    
    let deltaTime = Math.max((currentTime - lastTime) / 1000, 0.001);
    lastTime = currentTime;

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(0, paddleY1); 
    drawPaddle(canvas.width - paddleWidth, paddleY2); 
    drawBall();

    paddleY1 = mouseY - paddleHeight / 2;

    const maxSpeed = 700;
    dx = Math.min(Math.max(dx, -maxSpeed), maxSpeed);
    dy = Math.min(Math.max(dy, -maxSpeed), maxSpeed);

    if (isAIEnabled) 
    {
        aiDecision(deltaTime); 
        moveAI(deltaTime);
    }

    checkPaddleCollision(deltaTime);

    if (x + dx * deltaTime < ballRadius) 
    {
        winner = isAIEnabled ? 'AI' : 'Player 2';
        gameRunning = false;
        gameOverMessage();
        return;
    } 
    else if (x + dx * deltaTime > canvas.width - ballRadius) 
    {
        winner = 'Player 1';
        gameRunning = false;
        gameOverMessage();
        return;
    }

    if (y + dy * deltaTime > canvas.height - ballRadius || y + dy * deltaTime < ballRadius)
        dy = -dy;

    x += dx * difficultySettings[currentDifficulty].speedMultiplier * deltaTime;
    y += dy * difficultySettings[currentDifficulty].speedMultiplier * deltaTime;

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
        return isRegistered;
    }).catch(error => {
        console.error('Error checking if Player 2 exists:', error);
        return false;
    });
}

function startGame() 
{
    isAIEnabled = true;
    document.getElementById('pongCanvas').style.display = 'block';
    gameRunning = true;
    x = canvas.width / 2;
    y = canvas.height / 2;
    lastTime = 0;
    requestAnimationFrame(draw);
}

function restartPong() 
{
    paddleY1 = (canvas.height - paddleHeight) / 2;
    paddleY2 = (canvas.height - paddleHeight) / 2;
    x = canvas.width / 2;
    y = canvas.height / 2;
    
    dx = -200;
    dy = -200;

    gameRunning = false;
    winner = '';
    aiTargetY = canvas.height / 2;

    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';

    const startButton = document.getElementById('start-pong-game-btn');
    startButton.textContent = 'Start Game';

    startButton.removeEventListener('click', restartPong);
    startButton.addEventListener('click', function() {
        const selectedDifficulty = document.getElementById('difficultySelect').value;
        currentDifficulty = selectedDifficulty;

        document.getElementById('difficulty-menu').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'block';

        startGame();
    });
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


/* 
Note pour la prochaine fois (de rien tkt pour ue fois que j'y pense) :
La le ot se trompesouvent a cause du temp de reactiion d'une seconde, revoir gepeto pour la prediction avec coup e avance sur plusieur seconde en avance

*/