const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let firstHit = true;
let paddleHeight = 100, paddleWidth = 10;
let paddleY1 = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height / 2;

let gameRunning = false; 
let isRestarting = false; // Flag to track if the game is being restarted
const  restartButton = document.getElementById('start-pong-game-btn');
let lastTime = 0; // Stocke le temps de la dernière frame

let winner = '';
let isAIEnabled = false;
let aiReactionTime = 1000;
let aiLastReactionTime = 0;
let aiTargetY = canvas.height / 2 - paddleHeight / 2; 
const maxErrorOffset = 50; // Décalage maximal en pixels

let aiHits = 0; // Number of times the AI paddle has hit the ball


const maxHitsForMaxMissProbability = 15; // Number of hits at which the miss probability reaches its maximum
const maxMissProbability = 0.3; // Maximum miss probability (30%)

let aiLastScanTime = 0; // Variable to track the last scan time
let aiLastPredictedY = null; // Variable to track the last predicted position
let ballMovingTowardsAI = false; // Variable to track if the ball is moving towards the AI paddle

let difficultySettings = {
    easy: { speedMultiplier: 1.02, aiSpeed: 500, playerSpeed: 500, dx: -200, dy: -200 },
    medium: { speedMultiplier: 1.12, aiSpeed: 1000, playerSpeed: 1000, dx: -200, dy: -200 },
    hard: { speedMultiplier: 1, aiSpeed: 1600, playerSpeed: 1600, dx: -3000, dy: -3000 }
};

let currentDifficulty = 'easy';
let aiSpeed = difficultySettings[currentDifficulty].aiSpeed;
let playerSpeed = difficultySettings[currentDifficulty].playerSpeed;
let dx = difficultySettings[currentDifficulty].dx;
let dy = difficultySettings[currentDifficulty].dy;

let upPressed = false;
let downPressed = false;

const socket = new WebSocket('ws://localhost:8000/ws/pong/');

socket.onopen = function(e) {
    console.log('WebSocket connected.');
};

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);

    // Update game state in the frontend
};

socket.onclose = function(event) {
    console.log('WebSocket closed.');
};

socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};

// Send data to backend
function movePaddle(direction) {
    socket.send(JSON.stringify({ action: 'move_paddle', direction }));
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    }
});


function drawPaddle(x, y, color, shadowColor, opacity = 1) 
{
    context.beginPath();
    context.rect(x, y, paddleWidth, paddleHeight);
    context.fillStyle = color;
    context.globalAlpha = opacity; // Set the opacity
    context.shadowColor = shadowColor;
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.globalAlpha = 1; // Reset the opacity to default
}

function drawBall(posX = x, posY = y, opacity = 1) 
{
    context.beginPath();
    context.arc(posX, posY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#ff9204';
    context.globalAlpha = opacity; // Set the opacity
    context.shadowColor = '#ff9204';
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.globalAlpha = 1; // Reset the opacity to default
}

function gameOverMessage() 
{
    //if its a previous game over message, clear it
    context.clearRect(canvas.width / 2 - 250, canvas.height / 2 - 100, 500, 150);
    isRestarting = false;
    const mainText = winner === 'Player 1' ? 'VICTORY!' : 'GAME OVER';
    const mainColor = winner === 'Player 1' ? '#00FFFF' : '#ff00fb';
    const secondaryText = winner === 'Player 1' ? 'Player 1 Wins' : 'AI Wins';
    const secondaryColor = winner === 'Player 1' ? '#ff00fb' : '#00FFFF'; // Opposite color for secondary text

    let mainFontSize = 1; // Start with a very small font size
    let secondaryFontSize = 1; // Start with a very small font size
    const targetMainFontSize = 50; // Original target font size for main text
    const targetSecondaryFontSize = 30; // Original target font size for secondary text
    const animationDuration = 200; // Duration of the animation in milliseconds
    const secondaryDelay = 1000; // Delay before starting the secondary text animation

    let start = null;

    function animateMainText(timestamp) {
        if (isRestarting) return; // Exit if the game is being restarted
        if (!start) start = timestamp;
        const progress = timestamp - start;
        mainFontSize = Math.min(targetMainFontSize, (progress / animationDuration) * targetMainFontSize);

        // context.clearRect(canvas.width / 2 - 200, canvas.height / 2 - 120, 300, 100);
        // clear a big part of the canvas insdie pong game but not the whole canvas
        context.clearRect(canvas.width / 2 - 250, canvas.height / 2 - 100, 500, 150);


        context.font = `${mainFontSize}px "ka1"`;
        context.fillStyle = mainColor;
        context.textAlign = 'center';
        context.shadowColor = mainColor;
        context.shadowBlur = 20;
        context.fillText(mainText, canvas.width / 2, canvas.height / 2 - 30);

        if (mainFontSize < targetMainFontSize) {
            requestAnimationFrame(animateMainText);
        } else {
            setTimeout(() => {
                start = null; // Reset start time for secondary animation
                requestAnimationFrame(animateSecondaryText);
            }, secondaryDelay);
        }
    }

    function animateSecondaryText(timestamp) {
        if (isRestarting) return; // Exit if the game is being restarted
        if (!start) start = timestamp;
        const progress = timestamp - start;
        secondaryFontSize = Math.min(targetSecondaryFontSize, (progress / animationDuration) * targetSecondaryFontSize);

        context.font = `${secondaryFontSize}px "ka1"`;
        context.textAlign = 'center';

        // Draw the text outline with white glow

        context.shadowColor = 'black'; // White glow for secondary text
        context.shadowBlur = 10; // Reduced shadow blur for secondary text
        // context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.strokeText(secondaryText, canvas.width / 2, canvas.height / 2 + 20);

        // Fill the text with black
        context.fillStyle = 'white'; // Fill the text with white
        context.fillText(secondaryText, canvas.width / 2, canvas.height / 2 + 20);

        if (secondaryFontSize < targetSecondaryFontSize) {
            requestAnimationFrame(animateSecondaryText);
        }
    }

    requestAnimationFrame(animateMainText);
    if (restartButton) {
        restartButton.disabled = false;
    }
}

function calculateMissProbability() 
{
    if (aiHits >= maxHitsForMaxMissProbability) {
        return maxMissProbability;
    }
    return (maxMissProbability / maxHitsForMaxMissProbability) * aiHits;
}

function calculateRandomIncorrectPosition() 
{
    const incorrectY = Math.random() * (canvas.height - paddleHeight);
    return incorrectY;
}

function predictBallPosition() 
{
    let predictedX = x;
    let predictedY = y;
    let predictedDx = dx;
    let predictedDy = dy;

    while (true) 
    {
        // Calculate time to the next vertical wall (paddle level)
        let timeToPaddle = predictedDx > 0
            ? (canvas.width - paddleWidth - ballRadius - predictedX) / predictedDx
            : (paddleWidth + ballRadius - predictedX) / predictedDx;

        // Calculate time to the next horizontal wall
        let timeToHorizontalWall = predictedDy >= 0
            ? (canvas.height - ballRadius - predictedY) / predictedDy
            : (ballRadius - predictedY) / predictedDy;

        // Determine the next event (paddle or wall collision)
        let timeToNextEvent = Math.min(timeToPaddle, timeToHorizontalWall);

        // Move the ball to the next event
        predictedX += predictedDx * timeToNextEvent;
        predictedY += predictedDy * timeToNextEvent;

        // Reflect the ball's direction if it hits a wall
        if (timeToNextEvent === timeToHorizontalWall) {
            predictedDy = -predictedDy;
        } else {
            // Check if the ball is at paddle level
            if ((predictedDx > 0 && predictedX >= canvas.width - paddleWidth - ballRadius) ||
                (predictedDx < 0 && predictedX <= paddleWidth + ballRadius)) {
                // Ball is at paddle level, return the predicted position
                if (predictedDx > 0) {
                            // Add a random offset to the predicted position
                    let offset = (Math.random() - 0.5) * 2 * maxErrorOffset;
                    predictedY += offset;
                    return predictedY; // Ball is moving towards the AI paddle
                } else {
                    // Reflect the ball's direction and continue predicting
                    predictedDx = -predictedDx;
                }
            } else {
                predictedDx = -predictedDx;
            }
        }
    }
}


function predictTimeToPlayerPaddle() 
{
    let predictedX = x;
    let predictedDx = dx;

    // Calculate time to the player paddle
    let timeToPlayerPaddle = (paddleWidth + ballRadius - predictedX) / predictedDx;

    return timeToPlayerPaddle;
}

let aiMoveTimer = null; // Timer for AI to move to the next predicted position

function aiDecision() 
{
    if ((aiLastScanTime >= 1 && ballMovingTowardsAI) || (firstHit && ballMovingTowardsAI)) // Only scan the board every one second
    {
        firstHit = false;
        const predictedY = predictBallPosition(); // Predict the ball's position
        const timeToPlayerPaddle = predictTimeToPlayerPaddle(); // Predict the time to hit the player paddle

        // Calculate the miss probability
        const missProbability = calculateMissProbability();

        // Determine if the AI should miss the ball
        if (Math.random() < missProbability) {
            // AI misses the ball, move to a random incorrect position
            aiTargetY = calculateRandomIncorrectPosition();
        } else {
            // AI hits the ball, move to the predicted position
            if (predictedY !== aiLastPredictedY) {
                aiTargetY = Math.min(Math.max(predictedY - paddleHeight / 2, 0), canvas.height - paddleHeight);
                aiLastPredictedY = predictedY;
            }
        }
        aiLastScanTime = 0; // Reset the scan timer
        // If the ball is moving from the AI to the player, return to the center
    }
}

function moveAI(deltaTime) 
{
    if (aiTargetY !== null) {
        let distanceToTarget = aiTargetY - paddleY2;
        let direction = Math.sign(distanceToTarget);

        let adjustedSpeed = aiSpeed * deltaTime;

        if (Math.abs(distanceToTarget) > adjustedSpeed) 
        {
            paddleY2 += direction * adjustedSpeed;
        } 
        else 
        {
            paddleY2 = aiTargetY; // Set the paddle position directly to the target
        }
    }
}


const angleAdjustmentUp = 0.2; // Adjust this value for a wider angle when moving up
const angleAdjustmentDown = -0.2; // Adjust this value for a sharper angle when moving down

function checkPaddleCollision(deltaTime) 
{
    // Check collision with player paddle
    if (dx < 0 && x + dx * deltaTime < paddleWidth + ballRadius) 
    {
        let futureY = y + dy * deltaTime;

        if (futureY > paddleY1 && futureY < paddleY1 + paddleHeight) 
        {
            // Adjust the ball's angle based on the player's movement
            let angleAdjustment = 0;
            if (upPressed) {
                angleAdjustment = angleAdjustmentUp;
                console.log("Player moving up: dy =", dy);
            } else if (downPressed) {
                angleAdjustment = angleAdjustmentDown;
                console.log("Player moving down: dy =", dy);
            } else {
                console.log("Player not moving: dy =", dy);
            }

            // Calculate the new angle and adjust dx and dy
            let speed = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx) + angleAdjustment;
            dx = Math.abs(speed * Math.cos(angle)); // Ensure the ball moves towards the AI
            dy = speed * Math.sin(angle);

            console.log("New dx:", dx, "New dy:", dy);

            x = paddleWidth + ballRadius;
            ballMovingTowardsAI = true; // Ball is now moving towards the AI paddle
            aiHits++; // Increment the number of times the AI paddle has hit the ball
        }
    }

    // Check collision with AI paddle or Player 2 paddle
    if (dx > 0 && x + dx * deltaTime > canvas.width - paddleWidth - ballRadius) 
    {
        let futureY = y + dy * deltaTime;

        if (futureY > paddleY2 && futureY < paddleY2 + paddleHeight) 
        {
            dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
            x = canvas.width - paddleWidth - ballRadius;
            ballMovingTowardsAI = false; // Ball is no longer moving towards the AI paddle
        }
    }
}

let previousPaddleY1 = [];
let previousPaddleY2 = [];
let previousBallPositions = [];

const maxAfterImages = 20; // Increase the number of afterimages to draw


function draw(currentTime) 
{
    if (!lastTime) lastTime = currentTime;
    
    let deltaTime = Math.max((currentTime - lastTime) / 1000, 0.001);
    lastTime = currentTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw afterimages for player paddle
    for (let i = 0; i < previousPaddleY1.length; i++) {
        drawPaddle(0, previousPaddleY1[i], '#00FFFF', '#00FFFF', 0.1 * (1 - i / maxAfterImages));
    }

    // Draw afterimages for AI paddle
    for (let i = 0; i < previousPaddleY2.length; i++) {
        drawPaddle(canvas.width - paddleWidth, previousPaddleY2[i], '#ff00fb', '#ff00fb', 0.1 * (1 - i / maxAfterImages));
    }

    // Draw afterimages for the ball
    for (let i = 0; i < previousBallPositions.length; i++) {
        const pos = previousBallPositions[i];
        drawBall(pos.x, pos.y, 0.1 * (1 - i / maxAfterImages));
    }

    drawPaddle(0, paddleY1, '#00FFFF',  '#00FFFF'); // Player paddle color
    drawPaddle(canvas.width - paddleWidth, paddleY2, '#ff00fb', '#ff00fb'); // AI paddle color\
    drawBall(x, y); // Draw the current ball position
    // Update paddle position based on key presses
    if (upPressed) {
        paddleY1 -= playerSpeed * deltaTime;
    }
    if (downPressed) {
        paddleY1 += playerSpeed * deltaTime;
    }

    // Constrain paddle position within canvas bounds
    if (paddleY1 < 0) {
        paddleY1 = 0;
    }
    if (paddleY1 > canvas.height - paddleHeight) {
        paddleY1 = canvas.height - paddleHeight;
    }

    const maxSpeed = 700;
    dx = Math.min(Math.max(dx, -maxSpeed), maxSpeed);
    dy = Math.min(Math.max(dy, -maxSpeed), maxSpeed);

    if (isAIEnabled) 
    {
        if (!firstHit)
            aiLastScanTime += deltaTime; // Increment the scan timer
        aiDecision(aiLastScanTime);
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

    // Store the current paddle positions for afterimages
    previousPaddleY1.unshift(paddleY1);
    previousPaddleY2.unshift(paddleY2);

    // Store the current ball position for afterimages
    previousBallPositions.unshift({ x: x, y: y });

    // Limit the number of afterimages
    if (previousPaddleY1.length > maxAfterImages) {
        previousPaddleY1.pop();
    }
    if (previousPaddleY2.length > maxAfterImages) {
        previousPaddleY2.pop();
    }
    if (previousBallPositions.length > maxAfterImages) {
        previousBallPositions.pop();
    }

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

// let timestamp = 0;

let animationFrameId; // Global variable to store the animation frame ID
let cancelAnimation = false; // Flag to track if the animation should be canceled

function showReadyAnimation(callback) {
    let fontSize = 1; // Start with a very small font size
    const targetFontSize = 50; // Target font size for the "Ready?" text
    const animationDuration = 200; // Duration of the animation in milliseconds
    const displayDuration = 1000; // Duration to display the "Ready?" text before starting the game
    let start = null;

        // Disable the restart button
        if (restartButton) {
            restartButton.disabled = true;
        }

    function animateReadyText(timestamp) {
        if (cancelAnimation) return; // Exit if the animation is canceled
        if (!start) start = timestamp;
        const progress = timestamp - start;
        fontSize = Math.min(targetFontSize, (progress / animationDuration) * targetFontSize);

        // Clear the area where the "Ready?" text will be drawn
        context.clearRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 120);

        // Set the font and measure the width of the text parts
        context.font = `${fontSize}px "ka1"`;
        const reaWidth = context.measureText('REA').width;
        const dyWidth = context.measureText('DY?').width;

        // Calculate the total width and starting positions
        const totalWidth = reaWidth + dyWidth;
        const startX = (canvas.width - totalWidth) / 2;

        // Draw "REA" in cyan with cyan glow
        context.fillStyle = '#00FFFF';
        context.textAlign = 'left';
        context.shadowColor = '#00FFFF';
        context.shadowBlur = 20;
        context.fillText('REA', startX, canvas.height / 2 - 60);

        // Draw "DY?" in pink with pink glow
        context.fillStyle = '#ff00fb';
        context.shadowColor = '#ff00fb';
        context.shadowBlur = 20;
        context.fillText('DY?', startX + reaWidth, canvas.height / 2 - 60);

        if (fontSize < targetFontSize) {
            requestAnimationFrame(animateReadyText);
        } else {
            setTimeout(() => {
                if (cancelAnimation) return; // Exit if the animation is canceled
                // Clear the "Ready?" text
                context.clearRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 100);
                callback(); // Start the game
            }, displayDuration);
        }
    }

    // Deactivate ball glow
    const originalBallGlow = drawBall;
    drawBall = function(posX = x, posY = y, opacity = 1) {
        context.beginPath();
        context.arc(posX, posY, ballRadius, 0, Math.PI * 2);
        context.fillStyle = '#ff9204';
        context.shadowColor = '#ff9204';
        context.globalAlpha = opacity; // Set the opacity
        context.fill();
        context.closePath();
        context.globalAlpha = 1; // Reset the opacity to default
    };

    animationFrameId = requestAnimationFrame(animateReadyText);

    // Restore ball glow after animation
    setTimeout(() => {
        drawBall = originalBallGlow;
    }, animationDuration + displayDuration);
}

function drawInitialGameState() {
    //clear any existing afterimages or ongoing animations
    previousPaddleY1 = [];
    previousPaddleY2 = [];
    previousBallPositions = [];
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw player paddle with cyan glow
    context.fillStyle = '#00FFFF'; // Player paddle color
    context.shadowColor = '#00FFFF'; // Cyan glow
    context.shadowBlur = 20;
    context.fillRect(0, paddleY1, paddleWidth, paddleHeight);

    // Draw AI paddle with pink glow
    context.fillStyle = '#ff00fb'; // AI paddle color
    context.shadowColor = '#ff00fb'; // Pink glow
    context.shadowBlur = 20;
    context.fillRect(canvas.width - paddleWidth, paddleY2, paddleWidth, paddleHeight);

    // Reset shadow settings to default
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;

    // Draw ball
    drawBall(x, y);
}

function startGame() 
{
    isAIEnabled = true;
    playerSpeed = difficultySettings[currentDifficulty].playerSpeed; // Update player speed based on difficulty
    aiSpeed = difficultySettings[currentDifficulty].aiSpeed; // Update AI speed based on difficulty

    // Set the ball's initial velocity with a random angle
    const angle = Math.random() * Math.PI / 4 - Math.PI / 8; // Random angle between -22.5 and 22.5 degrees
    const speed = Math.sqrt(difficultySettings[currentDifficulty].dx * difficultySettings[currentDifficulty].dx + difficultySettings[currentDifficulty].dy * difficultySettings[currentDifficulty].dy); // Keep the same speed
    dx = -Math.abs(speed * Math.cos(angle)); // Ensure the ball starts moving towards the player
    dy = speed * Math.sin(angle);

    // TODO REMOVE YOU COWARD DIPSHIT THAT CANNOT CODE BECAUSE YOU SUCK TOO MUCH AT EVERYTHING YOU HAVE EVER TRIED AND YOU'RE JUST SO BAD AT FUCKING LIVING AND ALL YOU SHOULD DIE
    dx = 0;
    dy = 0;
    
    document.getElementById('pongCanvas').style.display = 'block';
    gameRunning = true;
    x = canvas.width / 2;
    y = canvas.height / 2;
    lastTime = 0;

    // Draw the initial game state
    drawInitialGameState();

    // Show "Ready?" animation before starting the game
    showReadyAnimation(() => {
        requestAnimationFrame(draw);
    });
}

function restartPong() 
{
    if (restartButton) {
        restartButton.disabled = false;
    }
    isRestarting = true;

    firstHit = true;
    aiHits = 0;
    paddleY1 = (canvas.height - paddleHeight) / 2;
    paddleY2 = (canvas.height - paddleHeight) / 2;
    x = canvas.width / 2;
    y = canvas.height / 2;

    // Set the ball's initial velocity with a random angle
    const angle = Math.random() * Math.PI / 4 - Math.PI / 8; // Random angle between -22.5 and 22.5 degrees
    const speed = Math.sqrt(difficultySettings[currentDifficulty].dx * difficultySettings[currentDifficulty].dx + difficultySettings[currentDifficulty].dy * difficultySettings[currentDifficulty].dy); // Keep the same speed
    dx = -Math.abs(speed * Math.cos(angle)); // Ensure the ball starts moving towards the player
    dy = speed * Math.sin(angle);

    gameRunning = false;
    winner = '';
    aiTargetY = canvas.height / 2 - paddleHeight / 2;

    aiLastScanTime = 0;
    aiLastPredictedY = null;
    ballMovingTowardsAI = false;
    lastTime = 0;

    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';

    const startButton = document.getElementById('start-pong-game-btn');
    startButton.textContent = 'Start Game';

    startButton.removeEventListener('click', restartPong);
    startButton.addEventListener('click', function() {
        const selectedDifficulty = document.getElementById('difficultySelect').value;
        currentDifficulty = selectedDifficulty;
        playerSpeed = difficultySettings[currentDifficulty].playerSpeed; // Update player speed based on difficulty
        aiSpeed = difficultySettings[currentDifficulty].aiSpeed; // Update AI speed based on difficulty
        document.getElementById('difficulty-menu').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'block';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Cancel any existing animation frames
        }
        cancelAnimation = false;
        startGame();
    });
}

document.getElementById('pongCanvas').style.display = 'none'; 

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
