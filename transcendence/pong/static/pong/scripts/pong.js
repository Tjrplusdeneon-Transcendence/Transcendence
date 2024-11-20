const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let firstHit = true;
let paddleHeight = 100, paddleWidth = 10;
let paddleY1 = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height / 2;

let start_hits = 0;
let gameRunning = false; 
let isRestarting = false;
const  restartButton = document.getElementById('start-solo-game-btn');
let lastTime = 0;

let winner = '';
let isAIEnabled = false;
let isMatchmaking = false;

let aiReactionTime = 1000;
let aiLastReactionTime = 0;
let aiTargetY = canvas.height / 2 - paddleHeight / 2; 
const maxErrorOffset = 50;

let aiHits = 0;


const maxHitsForMaxMissProbability = 15;
const maxMissProbability = 0.3;

let aiLastScanTime = 0;
let aiLastPredictedY = null;
let ballMovingTowardsAI = false;

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


let playerRole = null;

// const socket = new WebSocket('ws://localhost:8000/ws/pong/');


// socket.onopen = function(e) {
//     console.log('WebSocket connected.');
// };

// socket.onmessage = function(event) {
//     const data = JSON.parse(event.data);
//     console.log('Received:', data);

//     if (data.type === 'match_found') {
//         playerRole = data.player;
//         startGame();
//     } else if (data.type === 'paddle_moved') {
//         if (data.player === 'player1') {
//             paddleY1 = data.position;
//         } else if (data.player === 'player2') {
//             paddleY2 = data.position;
//         }
//     } else if (data.type === 'game_update') {
//         x = data.state.ball_position[0];
//         y = data.state.ball_position[1];
//         // Update other game state variables as needed
//     }
// };

// socket.onclose = function(event) {
//     console.log('WebSocket closed.');
// };

// socket.onerror = function(error) {
//     console.error('WebSocket error:', error);
// };

// function movePaddle(direction) {
//     const position = direction === 'up' ? paddleY1 - playerSpeed : paddleY1 + playerSpeed;
//     socket.send(JSON.stringify({ type: 'move_paddle', player: playerRole, position }));
// }
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseleave', handleMouseLeave);

let mouseY = null;
let mouseInFrame = false;
let mouseBlocked = false;
let keyboardActive = false;
let paddleDirection = 0; // 1 for up, -1 for down, 0 for no movement

function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouseY = event.clientY - rect.top;
    mouseInFrame = true;
    mouseBlocked = false;
    keyboardActive = false; // Re-enable mouse interactions
}

function handleMouseLeave(event) {
    mouseInFrame = false;
}

function updatePaddlePosition(deltaTime) {
    if (mouseY !== null && !mouseBlocked && !keyboardActive) {
        if (playerRole === 'player1') {
            if (mouseY < paddleY1 + paddleHeight / 2) {
                paddleY1 -= playerSpeed * deltaTime;
                paddleDirection = 1; // Moving up
            } else if (mouseY > paddleY1 + paddleHeight / 2) {
                paddleY1 += playerSpeed * deltaTime;
                paddleDirection = -1; // Moving down
            } else {
                paddleDirection = 0; // No movement
            }

            if (paddleY1 < 0) {
                paddleY1 = 0;
            }
            if (paddleY1 > canvas.height - paddleHeight) {
                paddleY1 = canvas.height - paddleHeight;
            }

            if (Math.abs(mouseY - (paddleY1 + paddleHeight / 2)) < 1) {
                mouseBlocked = true;
            }

            console.log(`Player 1 sending paddle position: ${paddleY1}`);
            sendPaddlePosition(paddleY1);
        } else if (playerRole === 'player2') {
            if (mouseY < paddleY2 + paddleHeight / 2) {
                paddleY2 -= playerSpeed * deltaTime;
                paddleDirection = 1; // Moving up
            } else if (mouseY > paddleY2 + paddleHeight / 2) {
                paddleY2 += playerSpeed * deltaTime;
                paddleDirection = -1; // Moving down
            } else {
                paddleDirection = 0; // No movement
            }

            if (paddleY2 < 0) {
                paddleY2 = 0;
            }
            if (paddleY2 > canvas.height - paddleHeight) {
                paddleY2 = canvas.height - paddleHeight;
            }

            if (Math.abs(mouseY - (paddleY2 + paddleHeight / 2)) < 1) {
                mouseBlocked = true;
            }

            console.log(`Player 2 sending paddle position: ${paddleY2}`);
            sendPaddlePosition(paddleY2);
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        upPressed = true;
        mouseBlocked = false; // Unblock mouse movement
        keyboardActive = true; // Disable mouse interactions
        paddleDirection = 1; // Moving up
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
        mouseBlocked = false; // Unblock mouse movement
        keyboardActive = true; // Disable mouse interactions
        paddleDirection = -1; // Moving down
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
        upPressed = false;
        if (!downPressed) {
            paddleDirection = 0; // No movement
        }
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
        if (!upPressed) {
            paddleDirection = 0; // No movement
        }
    }
});

function drawPaddle(x, y, color, shadowColor, opacity = 1) 
{
    context.beginPath();
    context.rect(x, y, paddleWidth, paddleHeight);
    context.fillStyle = color;
    context.globalAlpha = opacity;
    context.shadowColor = shadowColor;
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.globalAlpha = 1;
}

function drawBall(posX = x, posY = y, opacity = 1) 
{
    context.beginPath();
    context.arc(posX, posY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#ff9204';
    context.globalAlpha = opacity;
    context.shadowColor = '#ff9204';
    context.shadowBlur = 20;
    context.fill();
    context.closePath();
    context.globalAlpha = 1;
}

function gameOverMessage() {
    // Clear any previous game over message
    context.clearRect(canvas.width / 2 - 250, canvas.height / 2 - 100, 500, 150);
    isRestarting = false;

    let mainText, mainColor, secondaryText, secondaryColor;

    if (isAIEnabled) {
        if (winner === 'AI') {
            mainText = 'GAME OVER';
            mainColor = '#ff00fb';
            secondaryText = 'AI Wins';
            secondaryColor = '#00FFFF';
        } else {
            mainText = 'VICTORY!';
            mainColor = '#00FFFF';
            secondaryText = 'You Win';
            secondaryColor = '#ff00fb';
        }
    } else {
        if (winner === 'Player 1') {
            if (playerRole === 'player1') {
                mainText = 'VICTORY!';
                mainColor = '#00FFFF';
                secondaryText = 'You Win';
                secondaryColor = '#ff00fb';
            } else {
                mainText = 'GAME OVER';
                mainColor = '#ff00fb';
                secondaryText = 'Opponent Wins';
                secondaryColor = '#00FFFF';
            }
        } else if (winner === 'Player 2') {
            if (playerRole === 'player2') {
                mainText = 'VICTORY!';
                mainColor = '#00FFFF';
                secondaryText = 'You Win';
                secondaryColor = '#ff00fb';
            } else {
                mainText = 'GAME OVER';
                mainColor = '#ff00fb';
                secondaryText = 'Opponent Wins';
                secondaryColor = '#00FFFF';
            }
        }
    }

    let mainFontSize = 1;
    let secondaryFontSize = 1;
    const targetMainFontSize = 50;
    const targetSecondaryFontSize = 30;
    const animationDuration = 200;
    const secondaryDelay = 1000;

    let start = null;

    function animateMainText(timestamp) {
        if (isRestarting) return;
        if (!start) start = timestamp;
        const progress = timestamp - start;
        mainFontSize = Math.min(targetMainFontSize, (progress / animationDuration) * targetMainFontSize);

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
                start = null;
                requestAnimationFrame(animateSecondaryText);
            }, secondaryDelay);
        }
    }

    function animateSecondaryText(timestamp) {
        if (isRestarting) return;
        if (!start) start = timestamp;
        const progress = timestamp - start;
        secondaryFontSize = Math.min(targetSecondaryFontSize, (progress / animationDuration) * targetSecondaryFontSize);

        context.font = `${secondaryFontSize}px "ka1"`;
        context.textAlign = 'center';

        context.shadowColor = 'black';
        context.shadowBlur = 10;

        context.lineWidth = 2;
        context.strokeText(secondaryText, canvas.width / 2, canvas.height / 2 + 20);

        context.fillStyle = 'white';
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
    
        let timeToPaddle = predictedDx > 0
            ? (canvas.width - paddleWidth - ballRadius - predictedX) / predictedDx
            : (paddleWidth + ballRadius - predictedX) / predictedDx;

    
        let timeToHorizontalWall = predictedDy >= 0
            ? (canvas.height - ballRadius - predictedY) / predictedDy
            : (ballRadius - predictedY) / predictedDy;

    
        let timeToNextEvent = Math.min(timeToPaddle, timeToHorizontalWall);

    
        predictedX += predictedDx * timeToNextEvent;
        predictedY += predictedDy * timeToNextEvent;

    
        if (timeToNextEvent === timeToHorizontalWall) {
            predictedDy = -predictedDy;
        } else {
        
            if ((predictedDx > 0 && predictedX >= canvas.width - paddleWidth - ballRadius) ||
                (predictedDx < 0 && predictedX <= paddleWidth + ballRadius)) {
            
                if (predictedDx > 0) {
                        
                    let offset = (Math.random() - 0.5) * 2 * maxErrorOffset;
                    predictedY += offset;
                    return predictedY;
                } else {
                
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


    let timeToPlayerPaddle = (paddleWidth + ballRadius - predictedX) / predictedDx;

    return timeToPlayerPaddle;
}

let aiMoveTimer = null;

function aiDecision() 
{
    if ((aiLastScanTime >= 1 && ballMovingTowardsAI) || (firstHit && ballMovingTowardsAI))
    {
        firstHit = false;
        const predictedY = predictBallPosition();
        const timeToPlayerPaddle = predictTimeToPlayerPaddle();

    
        const missProbability = calculateMissProbability();

    
        if (Math.random() < missProbability) {
        
            aiTargetY = calculateRandomIncorrectPosition();
        } else {
        
            if (predictedY !== aiLastPredictedY) {
                aiTargetY = Math.min(Math.max(predictedY - paddleHeight / 2, 0), canvas.height - paddleHeight);
                aiLastPredictedY = predictedY;
            }
        }
        aiLastScanTime = 0;
    
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
            paddleY2 = aiTargetY;
        }
    }
}


const angleAdjustmentUp = 0.2;
const angleAdjustmentDown = -0.2;

function checkPaddleCollision(deltaTime) {
    if (dx < 0 && x + dx * deltaTime < paddleWidth + ballRadius) {
        let futureY = y + dy * deltaTime;

        if (futureY > paddleY1 && futureY < paddleY1 + paddleHeight) {
            let angleAdjustment = 0;
            if (paddleDirection === 1) {
                angleAdjustment = angleAdjustmentUp;
                console.log("Player moving up: dy =", dy);
            } else if (paddleDirection === -1) {
                angleAdjustment = angleAdjustmentDown;
                console.log("Player moving down: dy =", dy);
            } else {
                console.log("Player not moving: dy =", dy);
            }

            let speed = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx) + angleAdjustment;
            let minAngleCap = (Math.PI * 3) / 11;
            let maxAngleCap = (Math.PI * 8) / 11;

            if (Math.abs(angle) > minAngleCap && Math.abs(angle) < maxAngleCap) {
                angle = Math.atan2(dy, dx);
            }
            dx = Math.abs(speed * Math.cos(angle));
            dy = speed * Math.sin(angle);

            console.log("New dx:", dx, "New dy:", dy);

            x = paddleWidth + ballRadius;
            ballMovingTowardsAI = true;
            if (start_hits++ > 3)
                aiHits++;
        }
    }

    if (dx > 0 && x + dx * deltaTime > canvas.width - paddleWidth - ballRadius) {
        let futureY = y + dy * deltaTime;

        if (futureY > paddleY2 && futureY < paddleY2 + paddleHeight) {
            dx = -dx * difficultySettings[currentDifficulty].speedMultiplier;
            x = canvas.width - paddleWidth - ballRadius;
            ballMovingTowardsAI = false;
        }
    }
}

let previousPaddleY1 = [];
let previousPaddleY2 = [];
let previousBallPositions = [];

const maxAfterImages = 20;


function draw(currentTime) {
    if (!lastTime) lastTime = currentTime;
    
    let deltaTime = Math.max((currentTime - lastTime) / 1000, 0.001);
    lastTime = currentTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw after images for paddles
    if (playerRole === 'player1') {
        for (let i = 0; i < previousPaddleY1.length; i++) {
            drawPaddle(0, previousPaddleY1[i], '#00FFFF', '#00FFFF', 0.1 * (1 - i / maxAfterImages));
        }
        for (let i = 0; i < previousPaddleY2.length; i++) {
            drawPaddle(canvas.width - paddleWidth, previousPaddleY2[i], '#ff00fb', '#ff00fb', 0.1 * (1 - i / maxAfterImages));
        }
    } else if (playerRole === 'player2') {
        for (let i = 0; i < previousPaddleY2.length; i++) {
            drawPaddle(0, previousPaddleY2[i], '#00FFFF', '#00FFFF', 0.1 * (1 - i / maxAfterImages));
        }
        for (let i = 0; i < previousPaddleY1.length; i++) {
            drawPaddle(canvas.width - paddleWidth, previousPaddleY1[i], '#ff00fb', '#ff00fb', 0.1 * (1 - i / maxAfterImages));
        }
    }

    // Draw after images for the ball
    for (let i = 0; i < previousBallPositions.length; i++) {
        const pos = previousBallPositions[i];
        const ballX = playerRole === 'player2' ? canvas.width - pos.x : pos.x;
        drawBall(ballX, pos.y, 0.1 * (1 - i / maxAfterImages));
    }

    // Draw paddles based on player role
    if (playerRole === 'player1') {
        drawPaddle(0, paddleY1, '#00FFFF', '#00FFFF'); // Player 1 sees themselves as blue on the left
        drawPaddle(canvas.width - paddleWidth, paddleY2, '#ff00fb', '#ff00fb'); // Player 1 sees Player 2 as purple on the right
    } else if (playerRole === 'player2') {
        drawPaddle(0, paddleY2, '#00FFFF', '#00FFFF'); // Player 2 sees themselves as blue on the left
        drawPaddle(canvas.width - paddleWidth, paddleY1, '#ff00fb', '#ff00fb'); // Player 2 sees Player 1 as purple on the right
    }

    // Mirror ball position for Player 2
    let ballX = playerRole === 'player2' ? canvas.width - x : x;
    drawBall(ballX, y);

    let paddleMoved = false;

    if (playerRole === 'player1') {
        if (upPressed) {
            paddleY1 -= playerSpeed * deltaTime;
            paddleMoved = true;
        }
        if (downPressed) {
            paddleY1 += playerSpeed * deltaTime;
            paddleMoved = true;
        }

        if (paddleY1 < 0) {
            paddleY1 = 0;
        }
        if (paddleY1 > canvas.height - paddleHeight) {
            paddleY1 = canvas.height - paddleHeight;
        }

        if (paddleMoved) {
            console.log(`Player 1 sending paddle position: ${paddleY1}`);
            sendPaddlePosition(paddleY1);
        }
    } else if (playerRole === 'player2') {
        if (upPressed) {
            paddleY2 -= playerSpeed * deltaTime;
            paddleMoved = true;
        }
        if (downPressed) {
            paddleY2 += playerSpeed * deltaTime;
            paddleMoved = true;
        }

        if (paddleY2 < 0) {
            paddleY2 = 0;
        }
        if (paddleY2 > canvas.height - paddleHeight) {
            paddleY2 = canvas.height - paddleHeight;
        }

        if (paddleMoved) {
            console.log(`Player 2 sending paddle position: ${paddleY2}`);
            sendPaddlePosition(paddleY2);
        }
    }

    // Update paddle position based on mouse movement
    updatePaddlePosition(deltaTime);

    const maxSpeed = 700;
    dx = Math.min(Math.max(dx, -maxSpeed), maxSpeed);
    dy = Math.min(Math.max(dy, -maxSpeed), maxSpeed);

    if (isAIEnabled) {
        if (!firstHit)
            aiLastScanTime += deltaTime;
        aiDecision(aiLastScanTime);
        moveAI(deltaTime);
    }

    checkPaddleCollision(deltaTime);

    if (x + dx * deltaTime < ballRadius) {
        winner = isAIEnabled ? 'AI' : 'Player 2';
        gameRunning = false;
        gameOverMessage();
        return;
    } else if (x + dx * deltaTime > canvas.width - ballRadius) {
        winner = 'Player 1';
        gameRunning = false;
        gameOverMessage();
        return;
    }

    if (y + dy * deltaTime > canvas.height - ballRadius || y + dy * deltaTime < ballRadius)
        dy = -dy;

    x += dx * difficultySettings[currentDifficulty].speedMultiplier * deltaTime;
    y += dy * difficultySettings[currentDifficulty].speedMultiplier * deltaTime;

    previousPaddleY1.unshift(paddleY1);
    previousPaddleY2.unshift(paddleY2);
    previousBallPositions.unshift({ x: x, y: y });

    if (previousPaddleY1.length > maxAfterImages) {
        previousPaddleY1.pop();
    }
    if (previousPaddleY2.length > maxAfterImages) {
        previousPaddleY2.pop();
    }
    if (previousBallPositions.length > maxAfterImages) {
        previousBallPositions.pop();
    }

    // Send game state to the other player
    sendGameState();

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
    
        for (const tournament of tournaments) 
        {
            const player2 = tournament.players.find(player => player.alias === 'Player2');
            if (player2) 
                return true;
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


let animationFrameId;
let cancelAnimation = false;

function showReadyAnimation(callback) {
    let fontSize = 1;
    const targetFontSize = 50;
    const animationDuration = 200;
    const displayDuration = 1000;
    let start = null;

    
        if (restartButton) {
            restartButton.disabled = true;
        }

    function animateReadyText(timestamp) {
        if (cancelAnimation) return;
        if (!start) start = timestamp;
        const progress = timestamp - start;
        fontSize = Math.min(targetFontSize, (progress / animationDuration) * targetFontSize);

    
        context.clearRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 120);

    
        context.font = `${fontSize}px "ka1"`;
        const reaWidth = context.measureText('REA').width;
        const dyWidth = context.measureText('DY?').width;

    
        const totalWidth = reaWidth + dyWidth;
        const startX = (canvas.width - totalWidth) / 2;

    
        context.fillStyle = '#00FFFF';
        context.textAlign = 'left';
        context.shadowColor = '#00FFFF';
        context.shadowBlur = 20;
        context.fillText('REA', startX, canvas.height / 2 - 60);

    
        context.fillStyle = '#ff00fb';
        context.shadowColor = '#ff00fb';
        context.shadowBlur = 20;
        context.fillText('DY?', startX + reaWidth, canvas.height / 2 - 60);

        if (fontSize < targetFontSize) {
            requestAnimationFrame(animateReadyText);
        } else {
            setTimeout(() => {
                if (cancelAnimation) return;
            
                context.clearRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 100);
                callback();
            }, displayDuration);
        }
    }


    const originalBallGlow = drawBall;
    drawBall = function(posX = x, posY = y, opacity = 1) {
        context.beginPath();
        context.arc(posX, posY, ballRadius, 0, Math.PI * 2);
        context.fillStyle = '#ff9204';
        context.shadowColor = '#ff9204';
        context.globalAlpha = opacity;
        context.fill();
        context.closePath();
        context.globalAlpha = 1;
    };

    animationFrameId = requestAnimationFrame(animateReadyText);


    setTimeout(() => {
        drawBall = originalBallGlow;
    }, animationDuration + displayDuration);
}

function drawInitialGameState() {
    //clear any existing afterimages or ongoing animations
    previousPaddleY1 = [];
    previousPaddleY2 = [];
    previousBallPositions = [];
    context.clearRect(0, 0, canvas.width, canvas.height);


    context.fillStyle = '#00FFFF';
    context.shadowColor = '#00FFFF';
    context.shadowBlur = 20;
    context.fillRect(0, paddleY1, paddleWidth, paddleHeight);


    context.fillStyle = '#ff00fb';
    context.shadowColor = '#ff00fb';
    context.shadowBlur = 20;
    context.fillRect(canvas.width - paddleWidth, paddleY2, paddleWidth, paddleHeight);


    context.shadowColor = 'transparent';
    context.shadowBlur = 0;


    drawBall(x, y);
}

function startGame() {
    // Reinitialize game state
    const restartButton = isMatchmaking ? document.getElementById('start-multiplayer-btn') : document.getElementById('start-solo-game-btn');
    
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

    gameRunning = false;
    winner = '';
    aiTargetY = canvas.height / 2 - paddleHeight / 2;

    aiLastScanTime = 0;
    aiLastPredictedY = null;
    ballMovingTowardsAI = false;
    lastTime = 0;

    if (isMatchmaking) {
        // Directly start the game without showing the restart button or difficulty menu
        document.getElementById('difficulty-menu').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'block';

        // Hide the multiplayer menu
        document.getElementById('multiplayer-menu').style.display = 'none';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        cancelAnimation = false;

        // Start the game
        isAIEnabled = false;

        document.getElementById('pongCanvas').style.display = 'block';
        gameRunning = true;
        x = canvas.width / 2;
        y = canvas.height / 2;
        lastTime = 0;

        drawInitialGameState();

        showReadyAnimation(() => {
            requestAnimationFrame(draw);
        });
    } else {
        // Directly start the game with AI enabled
        playerRole = 'player1';
        document.getElementById('difficulty-menu').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'block';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        cancelAnimation = false;

        // Start the game
        isAIEnabled = true;
        const selectedDifficulty = document.getElementById('difficultySelect').value;
        currentDifficulty = selectedDifficulty;
        playerSpeed = difficultySettings[currentDifficulty].playerSpeed;
        aiSpeed = difficultySettings[currentDifficulty].aiSpeed;

        let minAngle = Math.PI / 20;
        let maxAngle = Math.PI / 5;

        const angle = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * (maxAngle - minAngle) + minAngle);
        const speed = Math.sqrt(difficultySettings[currentDifficulty].dx * difficultySettings[currentDifficulty].dx + difficultySettings[currentDifficulty].dy * difficultySettings[currentDifficulty].dy);
        dx = -Math.abs(speed * Math.cos(angle));
        dy = speed * Math.sin(angle);

        document.getElementById('pongCanvas').style.display = 'block';
        gameRunning = true;
        x = canvas.width / 2;
        y = canvas.height / 2;
        lastTime = 0;

        drawInitialGameState();

        showReadyAnimation(() => {
            requestAnimationFrame(draw);
        });
    }
}


function restartPong() {
    startGame();
}

// document.getElementById('start-solo-game-btn').addEventListener('click', function() {
//     isMatchmaking = false;
//     document.getElementById('pongCanvas').style.pointerEvents = 'auto';
//     const selectedDifficulty = document.getElementById('difficultySelect').value;
//     currentDifficulty = selectedDifficulty;
//     document.getElementById('difficulty-menu').style.display = 'none';
//     document.getElementById('pongCanvas').style.display = 'block';

//     const startButton = document.getElementById('start-solo-game-btn');
//     startButton.textContent = 'Restart Game';

//     startButton.removeEventListener('click', startGame);
//     startButton.addEventListener('click', startGame);

//     startGame();
// });

// document.getElementById('start-matchmaking-btn').addEventListener('click', function() {
//     isMatchmaking = true;
//     socket.send(JSON.stringify({ type: 'matchmaking' }));
//     document.getElementById('pongCanvas').style.pointerEvents = 'auto';
//     const selectedDifficulty = document.getElementById('difficultySelect').value;
//     currentDifficulty = selectedDifficulty;
//     document.getElementById('difficulty-menu').style.display = 'none';
//     document.getElementById('pongCanvas').style.display = 'block';

//     const startButton = document.getElementById('start-matchmaking-btn');
//     startButton.textContent = 'Restart Game';

//     startButton.removeEventListener('click', startGame);
//     startButton.addEventListener('click', startGame);

//     startGame();
// });

// document.getElementById('start-solo-game-btn').addEventListener('click', function() {
//     isMatchmaking = false;
//     startGame();
// });

// document.getElementById('start-matchmaking-btn').addEventListener('click', function() {
//     isMatchmaking = true;
//     socket.send(JSON.stringify({ type: 'matchmaking' }));
// });

// function restartPong() 
// {
//     if (restartButton) {
//         restartButton.disabled = false;
//     }
//     isRestarting = true;

//     firstHit = true;
//     aiHits = 0;
//     paddleY1 = (canvas.height - paddleHeight) / 2;
//     paddleY2 = (canvas.height - paddleHeight) / 2;
//     x = canvas.width / 2;
//     y = canvas.height / 2;


//     const angle = Math.random() * Math.PI / 4 - Math.PI / 8;
//     const speed = Math.sqrt(difficultySettings[currentDifficulty].dx * difficultySettings[currentDifficulty].dx + difficultySettings[currentDifficulty].dy * difficultySettings[currentDifficulty].dy);
//     dx = -Math.abs(speed * Math.cos(angle));
//     dy = speed * Math.sin(angle);

//     gameRunning = false;
//     winner = '';
//     aiTargetY = canvas.height / 2 - paddleHeight / 2;

//     aiLastScanTime = 0;
//     aiLastPredictedY = null;
//     ballMovingTowardsAI = false;
//     lastTime = 0;

//     document.getElementById('pongCanvas').style.display = 'none';
//     document.getElementById('difficulty-menu').style.display = 'block';

//     const startButton = document.getElementById('start-pong-game-btn');
//     startButton.textContent = 'Start Game';

//     startButton.removeEventListener('click', restartPong);
//     startButton.addEventListener('click', function() {
//         const selectedDifficulty = document.getElementById('difficultySelect').value;
//         currentDifficulty = selectedDifficulty;
//         playerSpeed = difficultySettings[currentDifficulty].playerSpeed;
//         aiSpeed = difficultySettings[currentDifficulty].aiSpeed;
//         document.getElementById('difficulty-menu').style.display = 'none';
//         document.getElementById('pongCanvas').style.display = 'block';

//         if (animationFrameId) {
//             cancelAnimationFrame(animationFrameId);
//         }
//         cancelAnimation = false;
//         startGame();
//     });
// }

document.getElementById('pongCanvas').style.display = 'none'; 

document.getElementById('start-solo-game-btn').addEventListener('click', function() {
    isMatchmaking = false;
    document.getElementById('pongCanvas').style.pointerEvents = 'auto';
    const selectedDifficulty = document.getElementById('difficultySelect').value;
    currentDifficulty = selectedDifficulty;
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'block';

    const startButton = document.getElementById('start-solo-game-btn');
    startButton.textContent = 'Restart Game';

    startButton.removeEventListener('click', startGame);
    startButton.addEventListener('click', restartPong);

    startGame();
});

let socket;
let bothPlayersReady = false;
let playerReady = false;

document.getElementById('start-multiplayer-btn').addEventListener('click', function() {
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'flex';
    document.getElementById('start-solo-game-btn').style.display = 'none';
    document.getElementById('start-multiplayer-btn').style.display = 'none';
    document.getElementById('go-back-btn').style.display = 'inline-block';
});

document.getElementById('go-back-btn').addEventListener('click', function() {
    if (document.getElementById('searching-menu').style.display === 'flex') {
        document.getElementById('searching-menu').style.display = 'none';
        document.getElementById('multiplayer-menu').style.display = 'flex';
        socket.close(); // Close the socket connection when going back
        resetMatchmakingState(); // Reset matchmaking state
    } else {
        document.getElementById('multiplayer-menu').style.display = 'none';
        document.getElementById('difficulty-menu').style.display = 'block';
        document.getElementById('pongCanvas').style.display = 'none'; // Hide the game canvas
        document.getElementById('start-solo-game-btn').style.display = 'inline-block';
        document.getElementById('start-multiplayer-btn').style.display = 'inline-block';
    }
    document.getElementById('go-back-btn').style.display = 'none';
});

document.getElementById('online-btn').addEventListener('click', function() {
    isMatchmaking = true;

    document.getElementById('multiplayer-menu').style.display = 'none';
    document.getElementById('searching-menu').style.display = 'flex';
    document.getElementById('go-back-btn').style.display = 'inline-block';

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host; // Includes hostname and port (if present)
    const path = '/ws/pong/';

    const socketUrl = `${protocol}://${host}${path}`;
    console.log(`Connecting to WebSocket at: ${socketUrl}`);

    socket = new WebSocket(socketUrl);

    socket.onopen = function(e) {
        console.log('WebSocket connected.');
        socket.send(JSON.stringify({ type: 'matchmaking' }));
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'match_found') {
            playerRole = data.player;
            document.getElementById('searching-btn').textContent = 'Start Match';
            document.getElementById('searching-btn').disabled = false;
            document.getElementById('searching-btn').classList.add('active');
        } else if (data.type === 'player_ready') {
            if (data.player !== playerRole) {
                bothPlayersReady = true;
                document.getElementById('searching-btn').textContent = 'Start Match';
                document.getElementById('searching-btn').disabled = false;
                document.getElementById('searching-btn').classList.add('active');
            }
        } else if (data.type === 'start_game') {
            // Hide the searching menu
            document.getElementById('searching-menu').style.display = 'none';
            initializeGameState(data.initial_state);
            startGame();
            resetMatchmakingState(); // Reset matchmaking state after the game starts
        } else if (data.type === 'game_update') {
            // Update game state with received data
            x = data.state.ball_position[0];
            y = data.state.ball_position[1];
            paddleY1 = data.state.paddle1_position;
            paddleY2 = data.state.paddle2_position;
            dx = data.state.dx;
            dy = data.state.dy;
        } else if (data.type === 'paddle_moved') {
            if (data.player === 'player1') {
                console.log(`Player 1 received paddle position: ${data.position}`);
                paddleY1 = data.position;
            } else if (data.player === 'player2') {
                console.log(`Player 2 received paddle position: ${data.position}`);
                paddleY2 = data.position;
            }
        }
    };

    socket.onclose = function(event) {
        console.log('WebSocket closed.');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
});

document.getElementById('searching-btn').addEventListener('click', function() {
    if (this.textContent === 'Start Match') {
        this.textContent = 'Waiting for opponent...';
        this.disabled = true;
        playerReady = true;
        socket.send(JSON.stringify({ type: 'player_ready', player: playerRole }));
        if (bothPlayersReady) {
            socket.send(JSON.stringify({ type: 'start_game' }));
        }
    }
});

function initializeGameState(initialState) {
    x = initialState.ball_position[0];
    y = initialState.ball_position[1];
    paddleY1 = initialState.paddle1_position;
    paddleY2 = initialState.paddle2_position;
    dx = initialState.dx;
    dy = initialState.dy;
    playerSpeed = initialState.player_speed;
    aiSpeed = initialState.ai_speed;
}

function resetMatchmakingState() {
    bothPlayersReady = false;
    playerReady = false;
    document.getElementById('searching-btn').textContent = 'Searching for opponent...';
    document.getElementById('searching-btn').disabled = true;
    document.getElementById('searching-btn').classList.remove('active');
}

function sendGameState() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'game_update',
            state: {
                ball_position: [x, y],
                paddle1_position: paddleY1,
                paddle2_position: paddleY2,
                dx: dx,
                dy: dy
            }
        }));
    }
}

function sendPaddlePosition(position) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(`Sending paddle position: ${position}`);
        socket.send(JSON.stringify({
            type: 'move_paddle',
            player: playerRole,
            position: position
        }));
    }
}