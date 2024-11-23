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
let wPressed = false;
let sPressed = false;

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
    }
    else if (event.key === 'w' && LocalMultiplayer){
        wPressed = true;
        mouseBlocked = false; // Unblock mouse movement
        keyboardActive = true; // Disable mouse interactions
        paddleDirection = 1; // Moving up
    } 
    else if (event.key === 'ArrowDown') {
        downPressed = true;
        mouseBlocked = false; // Unblock mouse movement
        keyboardActive = true; // Disable mouse interactions
        paddleDirection = -1; // Moving down
    }
    else if (event.key === 's' && LocalMultiplayer){
        sPressed = true;
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
    } else if (event.key === 'w') {
        wPressed = false;
        if (!sPressed) {
            paddleDirection = 0; // No movement
        }
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
        if (!upPressed) {
            paddleDirection = 0; // No movement
        }
    } else if (event.key === 's') {
        sPressed = false;
        if (!wPressed) {
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
    // if in online match, activate rematch and quit buttons'
    if (isMatchmaking) {
        document.getElementById('rematch-btn').disabled = false;
        document.getElementById('quit-btn').disabled = false;
        document.getElementById('return-menu-btn').disabled = false;
    }
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
        document.getElementById('return-menu-btn').style.display = 'inline-block';
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

    // Enable the "Return to Menu" button
    document.getElementById('return-menu-btn').disabled = false;
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

    // Vérifier le mode obscurité
    toggleDarknessMode(currentTime);

    // Si le mode obscurité est actif et que les éléments sont invisibles, afficher un écran noir
    if (darknessModeActive && !elementsVisible) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Afficher les éléments normalement
        context.clearRect(0, 0, canvas.width, canvas.height);

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
        let ballX = playerRole === 'player2' ? canvas.width - x : x;
        drawBall(ballX, y);
    }

    let paddleMoved = false;

    if (LocalMultiplayer) {
        // Local multiplayer controls
        if (wPressed) {
            paddleY1 -= playerSpeed * deltaTime;
            paddleMoved = true;
        }
        if (sPressed) {
            paddleY1 += playerSpeed * deltaTime;
            paddleMoved = true;
        }
        if (upPressed) {
            paddleY2 -= playerSpeed * deltaTime;
            paddleMoved = true;
        }
        if (downPressed) {
            paddleY2 += playerSpeed * deltaTime;
            paddleMoved = true;
        }

        // Ensure paddles stay within the canvas
        paddleY1 = Math.max(0, Math.min(paddleY1, canvas.height - paddleHeight));
        paddleY2 = Math.max(0, Math.min(paddleY2, canvas.height - paddleHeight));
    } else {
        // Online multiplayer controls
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
    }

    // Update paddle position based on mouse movement
    updatePaddlePosition(deltaTime);

    const maxSpeed = 700;
    dx = Math.min(Math.max(dx, -maxSpeed), maxSpeed);
    dy = Math.min(Math.max(dy, -maxSpeed), maxSpeed);

    if (!LocalMultiplayer && isAIEnabled) {
        if (!firstHit)
            aiLastScanTime += deltaTime;
        aiDecision(aiLastScanTime);
        moveAI(deltaTime);
    }

    checkPaddleCollision(deltaTime);

    if (x + dx * deltaTime < ballRadius) {
        winner = LocalMultiplayer ? 'Player 2' : (isAIEnabled ? 'AI' : 'Player 2');
        gameRunning = false;
        if (isTournament) {
            endGameTournament();
        } 
        gameOverMessage();
        return;
    } else if (x + dx * deltaTime > canvas.width - ballRadius) {
        winner = 'Player 1';
        gameRunning = false;
        if (isTournament) {
            endGameTournament();
        }
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

    // Send game state to the other player if not in local multiplayer mode
    if (!LocalMultiplayer) {
        sendGameState();
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
    // Récupérer les options sélectionnées
    const selectedDifficulty = document.getElementById('difficultySelect').value;
    currentDifficulty = selectedDifficulty;
    
    const paddleSizeInput = document.getElementById('paddle-size').value;
    paddleHeight = parseInt(paddleSizeInput, 10);
    
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
    } else if (isTournament) {
        // Set up the game for local multiplayer in tournament mode
        LocalMultiplayer = true;
        playerRole = 'player1';
        paddleY1 = (canvas.height - paddleHeight) / 2;
        paddleY2 = (canvas.height - paddleHeight) / 2;
        x = canvas.width / 2;
        y = canvas.height / 2;

        const angle = Math.random() * Math.PI / 4 - Math.PI / 8;
        const speed = Math.sqrt(difficultySettings[currentDifficulty].dx * difficultySettings[currentDifficulty].dx + difficultySettings[currentDifficulty].dy * difficultySettings[currentDifficulty].dy);
        dx = -Math.abs(speed * Math.cos(angle));
        dy = speed * Math.sin(angle);

        document.getElementById('difficulty-menu').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'block';

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        cancelAnimation = false;

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

    // Disable the "Return to Menu" button
    document.getElementById('return-menu-btn').disabled = true;
}


function restartPong() {
        // Garder les paramètres actuels de taille et de difficulté
        const selectedDifficulty = currentDifficulty;
        const paddleSize = paddleHeight;
    
        // Réinitialiser l'état du jeu
        firstHit = true;
        aiHits = 0;
        paddleY1 = (canvas.height - paddleHeight) / 2;
        paddleY2 = (canvas.height - paddleHeight) / 2;
        x = canvas.width / 2;
        y = canvas.height / 2;
        dx = difficultySettings[selectedDifficulty].dx;
        dy = difficultySettings[selectedDifficulty].dy;
    
        // Réinitialiser l'affichage
        gameRunning = false;
        winner = '';
        aiTargetY = canvas.height / 2 - paddleHeight / 2;
    
        // Démarrer directement la partie avec les paramètres actuels
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

// New Main Menu Buttons
document.getElementById('singleplayerButton').addEventListener('click', function() {
    document.getElementById('mainMenuCanvas').style.display = 'none';
    document.getElementById('singleplayerButton').style.display = 'none';
    document.getElementById('multiplayerButton').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';
    document.getElementById('pongCanvas').style.display = 'none'; // Ensure the game canvas is hidden
    document.getElementById('start-solo-game-btn').style.display = 'block';
    document.getElementById('start-solo-game-btn').textContent = 'Start Game'; // Change button text to "Start Game"
    document.getElementById('return-menu-btn').style.display = 'block';
});

document.getElementById('multiplayerButton').addEventListener('click', function() {
    document.getElementById('mainMenuCanvas').style.display = 'none';
    document.getElementById('singleplayerButton').style.display = 'none';
    document.getElementById('multiplayerButton').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'flex';
    document.getElementById('go-back-btn').style.display = 'inline-block';
    document.getElementById('go-back-btn').textContent = 'Return to Menu'; // Change button text to "Return to Menu"
});

document.getElementById('leftSide').addEventListener('click', function() {
    document.getElementById('mainMenuCanvas').style.display = 'none';
    document.getElementById('leftSide').style.display = 'none';
    document.getElementById('rightSide').style.display = 'none';
    document.getElementById('singleplayerButton').style.display = 'none';
    document.getElementById('multiplayerButton').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';
    document.getElementById('pongCanvas').style.display = 'none'; // Ensure the game canvas is hidden
    document.getElementById('start-solo-game-btn').style.display = 'block';
    document.getElementById('start-solo-game-btn').textContent = 'Start Game'; // Change button text to "Start Game"
    document.getElementById('return-menu-btn').style.display = 'block';
});

document.getElementById('rightSide').addEventListener('click', function() {
    document.getElementById('mainMenuCanvas').style.display = 'none';
    document.getElementById('leftSide').style.display = 'none';
    document.getElementById('rightSide').style.display = 'none';
    document.getElementById('singleplayerButton').style.display = 'none';
    document.getElementById('multiplayerButton').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'flex';
    document.getElementById('go-back-btn').style.display = 'inline-block';
    document.getElementById('go-back-btn').textContent = 'Return to Menu'; // Change button text to "Return to Menu"
});

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


// document.getElementById('start-local-multiplayer-btn').addEventListener('click', function() {
//     isMatchmaking = false;
//     document.getElementById('pongCanvas').style.pointerEvents = 'auto';
//     const selectedDifficulty = document.getElementById('difficultySelect').value;
//     currentDifficulty = selectedDifficulty;
//     document.getElementById('difficulty-menu').style.display = 'none';
//     document.getElementById('pongCanvas').style.display = 'block';

//     const startButton = document.getElementById('start-solo-game-btn');
//     startButton.textContent = 'Restart Game';

//     startButton.removeEventListener('click', startGame);
//     startButton.addEventListener('click', restartPong);
// });

let socket;
let bothPlayersReady = false;
let playerReady = false;
let rematchRequested = false;

document.getElementById('start-multiplayer-btn').addEventListener('click', function() {
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'flex';
    document.getElementById('start-solo-game-btn').style.display = 'none';
    document.getElementById('start-multiplayer-btn').style.display = 'none';
    document.getElementById('go-back-btn').style.display = 'inline-block';
});

let inLocal = false;
let LocalMultiplayer = false;

document.getElementById('local-btn').addEventListener('click', function() 
{
    inLocal = true;
    LocalMultiplayer = true;
    isMatchmaking = false;
    document.getElementById('multiplayer-menu').style.display = 'none';
    document.getElementById('difficulty-menu').style.display = 'block';
    document.getElementById('return-menu-btn').style.display = 'none';
    document.getElementById('go-back-btn').textContent = 'Go Back'; // Reset button text to "Go Back"
    document.getElementById('start-solo-game-btn').style.display = 'block';
    document.getElementById('start-solo-game-btn').textContent = 'Start Game'; // Change button text to "Start Game"
});

document.getElementById('go-back-btn').addEventListener('click', function() {
    if (document.getElementById('searching-menu').style.display === 'flex' || inLocal === true || isTournament === true) {
        document.getElementById('searching-menu').style.display = 'none';
        document.getElementById('multiplayer-menu').style.display = 'flex';
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'quit' })); // Notify the opponent that the player has left
            socket.close(); // Close the socket connection when going back
        }
        document.getElementById('tournamentSetup').style.display = 'none';
        document.getElementById('startTournamentBtn').style.display = 'none';
        document.getElementById('playerInputs').innerHTML = ''; // Clear player inputs
        document.getElementById('playerCount').textContent = 'Select Players Nicknames (0/8)';
        document.getElementById('start-solo-game-btn').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'none'; // Hide the game canvas
        document.getElementById('difficulty-menu').style.display = 'none';
        resetMatchmakingState(); // Reset matchmaking state
        document.getElementById('go-back-btn').style.display = 'inline-block'; // Ensure go-back button is visible
        document.getElementById('go-back-btn').textContent = 'Return to Menu'; // Change button text to "Return to Menu"
        LocalMultiplayer = false;
        inLocal = false;
        isTournament = false;
        // remove tournament buttons
        // document.getElementById('
    } else {
        document.getElementById('multiplayer-menu').style.display = 'none';
        document.getElementById('difficulty-menu').style.display = 'none';
        document.getElementById('pongCanvas').style.display = 'none'; // Hide the game canvas
        document.getElementById('mainMenuCanvas').style.display = 'block';
        document.getElementById('leftSide').style.display = 'flex'; // Show the left side
        document.getElementById('rightSide').style.display = 'flex'; // Show the right side
        document.getElementById('singleplayerButton').style.display = 'none';
        document.getElementById('multiplayerButton').style.display = 'none';
        document.getElementById('go-back-btn').style.display = 'none'; // Hide go-back button when returning to main menu
        document.getElementById('go-back-btn').textContent = 'Go Back'; // Reset button text to "Go Back"
    }
});

document.getElementById('online-btn').addEventListener('click', function() {
    isMatchmaking = true;

    document.getElementById('multiplayer-menu').style.display = 'none';
    document.getElementById('searching-menu').style.display = 'flex';
    document.getElementById('go-back-btn').style.display = 'inline-block';
    document.getElementById('go-back-btn').textContent = 'Go Back'; // Change button text to "Go Back"
    document.getElementById('return-menu-btn').style.display = 'none'; // Hide the "Return to Menu" button on the online menu


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
            // Hide the searching menu and go-back button, show rematch and quit buttons
            document.getElementById('searching-menu').style.display = 'none';
            document.getElementById('go-back-btn').style.display = 'none';
            document.getElementById('rematch-btn').style.display = 'inline-block';
            document.getElementById('quit-btn').style.display = 'inline-block';
            document.getElementById('quit-btn').textContent = 'Quit Match'; // Change button text to "Quit Match"
            document.getElementById('return-menu-btn').style.display = 'inline-block';
            document.getElementById('return-menu-btn').disabled = true; // Disable the "Return to Menu" button during the match
            initializeGameState(data.initial_state);
            startGame();
            resetMatchmakingState(); // Reset matchmaking state after the game starts
            document.getElementById('rematch-btn').disabled = true;
            document.getElementById('quit-btn').disabled = true;
        } else if (data.type === 'opponent_left') {
            document.getElementById('searching-btn').textContent = 'Opponent has left the match';
            document.getElementById('searching-btn').disabled = true;
            document.getElementById('searching-btn').classList.remove('active');
            document.getElementById('rematch-btn').textContent = 'Opponent has left the match';
            document.getElementById('rematch-btn').disabled = true;
            document.getElementById('quit-btn').disabled = false;
        } else if (data.type === 'rematch') {
            if (data.player !== playerRole) {
                bothPlayersReady = true;
                document.getElementById('rematch-btn').textContent = 'Opponent wants a rematch';
                document.getElementById('rematch-btn').disabled = false;
                document.getElementById('quit-btn').disabled = false;
            }
            if (rematchRequested && bothPlayersReady) {
                socket.send(JSON.stringify({ type: 'start_game' }));
            }
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
        } else if (data.type === 'game_over') {
            // Enable rematch and quit buttons at the end of the match
            endGame();
            document.getElementById('return-menu-btn').disabled = false; // Enable the "Return to Menu" button at the end of the match
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

document.getElementById('rematch-btn').addEventListener('click', function() {
    this.textContent = 'Waiting for opponent...';
    this.disabled = true;
    rematchRequested = true;
    socket.send(JSON.stringify({ type: 'rematch', player: playerRole }));
});

document.getElementById('quit-btn').addEventListener('click', function() {
    socket.send(JSON.stringify({ type: 'quit' }));
    resetMatchmakingState();
    document.getElementById('multiplayer-menu').style.display = 'flex';
    document.getElementById('rematch-btn').style.display = 'none';
    document.getElementById('quit-btn').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'none'; // Hide the game canvas
    document.getElementById('go-back-btn').style.display = 'none'; // Hide the "Go Back" button
    document.getElementById('return-menu-btn').style.display = 'inline-block'; // Ensure "Return to Menu" button is visible
    document.getElementById('return-menu-btn').disabled = false; // Enable the "Return to Menu" button
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
    rematchRequested = false;
    document.getElementById('searching-btn').textContent = 'Searching for opponent...';
    document.getElementById('searching-btn').disabled = true;
    document.getElementById('searching-btn').classList.remove('active');
    document.getElementById('rematch-btn').textContent = 'Rematch';
    document.getElementById('rematch-btn').disabled = true;
    document.getElementById('quit-btn').disabled = true;
}

function endGame() {
    // Enable rematch and quit buttons at the end of the match
    document.getElementById('rematch-btn').disabled = false;
    document.getElementById('quit-btn').disabled = false;
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

document.addEventListener("DOMContentLoaded", function () {
    const paddleSizeInput = document.getElementById("paddle-size");
    const paddleSizeDisplay = document.getElementById("paddle-size-display");

    paddleSizeInput.addEventListener("input", function () {
        paddleHeight = parseInt(paddleSizeInput.value, 10); // Met à jour la hauteur globale du paddle
        paddleSizeDisplay.textContent = paddleHeight; // Met à jour l'affichage
    });
});

function showMenu() {
    document.getElementById('difficulty-menu').style.display = 'block';
    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('start-solo-game-btn').textContent = 'Start Game';
}

function hideMenu() {
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'block';
}

document.getElementById('start-solo-game-btn').addEventListener('click', function () {
    if (this.textContent === 'Start Game') {
        hideMenu(); // Masquer le menu pour lancer la partie
        startGame();
    } else if (this.textContent === 'Restart Game') {
        restartPong();
    }
});

function resetMainMenu() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'quit' })); // Notify the opponent that the player has left
        socket.close(); // Close the socket connection when going back
    }
    document.getElementById('mainMenuCanvas').style.display = 'block';
    document.getElementById('leftSide').style.display = 'flex';
    document.getElementById('rightSide').style.display = 'flex';
    document.getElementById('singleplayerButton').style.display = 'block';
    document.getElementById('multiplayerButton').style.display = 'block';
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'none';
    document.getElementById('start-solo-game-btn').style.display = 'none';
    document.getElementById('start-multiplayer-btn').style.display = 'none';
    document.getElementById('return-menu-btn').style.display = 'none';
    document.getElementById('go-back-btn').style.display = 'none';
    document.getElementById('searching-menu').style.display = 'none';
    document.getElementById('rematch-btn').style.display = 'none';
    document.getElementById('quit-btn').style.display = 'none';
}

document.getElementById('return-menu-btn').addEventListener('click', function() {
    resetMainMenu();
});

let darknessModeActive = false;
let darknessModeTimer = 0;
let darknessDuration = 12000; // Durée totale du mode obscurité (en ms)
let visibilityToggleInterval = 500; // Temps avant de changer entre visible/invisible (en ms)
let elementsVisible = true; // Indique si les paddles et la balle sont visibles
let lastVisibilityToggleTime = 0; // Temps du dernier basculement

// Référence à la case à cocher
const darknessToggleCheckbox = document.getElementById('darknessToggle');

// Variable pour suivre si le mode obscurité est activé
let darknessModeEnabled = false;

// Mettre à jour l'état du mode obscurité lorsque la case est cochée/décochée
darknessToggleCheckbox.addEventListener('change', () => {
    darknessModeEnabled = darknessToggleCheckbox.checked;
});

function toggleDarknessMode(currentTime) {
    // Vérifier si la fonctionnalité est activée
    if (!darknessModeEnabled) {
        darknessModeActive = false;
        return;
    }

    if (!darknessModeActive && Math.random() < 0.0006) 
    { 
        // Probabilité faible2 de déclencher
        darknessModeActive = true;
        darknessModeTimer = currentTime;
        elementsVisible = true; // Commencer avec les éléments visibles
        lastVisibilityToggleTime = currentTime;
    }

    if (darknessModeActive) {
        const elapsed = currentTime - darknessModeTimer;

        // Si la durée totale du mode obscurité est écoulée, désactiver
        if (elapsed >= darknessDuration) {
            darknessModeActive = false;
            context.clearRect(0, 0, canvas.width, canvas.height); // Nettoyer la scène
            return;
        }

        // Alterner entre visible et invisible en fonction de l'intervalle
        if (currentTime - lastVisibilityToggleTime >= visibilityToggleInterval) {
            elementsVisible = !elementsVisible; // Bascule l'état
            lastVisibilityToggleTime = currentTime;
        }
    }
}

// Tournament Mode

let players = [];
let currentMatch = 0;
let tournamentStage = 'Quarter-Finals';
let tournamentMatches = [];
let tournamentWinner = '';
let isTournament = false;

document.getElementById('tournament-btn').addEventListener('click', function() {
    // Hide the multiplayer options menu
    isTournament = true;
    document.getElementById('multiplayer-menu').style.display = 'none';

    // Display the tournament setup
    document.getElementById('tournamentSetup').style.display = 'block';
    document.getElementById('playerCount').textContent = 'Select Players Nicknames (0/8)';
    players = [];
    currentMatch = 0;
    tournamentStage = 'Quarter-Finals';
    tournamentMatches = [];
    tournamentWinner = '';
    document.getElementById('playerInputs').innerHTML = '<label for="player1">Player 1: </label><input type="text" id="player1" name="player1">';
    document.getElementById('startTournamentBtn').style.display = 'none';
    document.getElementById('return-menu-btn').style.display = 'none'; // Hide the "Return to Menu" button
    document.getElementById('go-back-btn').textContent = 'Go Back'; // Reset button text to "Go Back"
});

document.getElementById('addPlayerBtn').addEventListener('click', function() {
    const playerInput = document.getElementById(`player${players.length + 1}`);
    if (playerInput && playerInput.value.trim() !== '') {
        players.push(playerInput.value.trim());
        document.getElementById('playerCount').textContent = `Select Players Nicknames (${players.length}/8)`;
        if (players.length < 8) {
            const nextPlayer = players.length + 1;
            document.getElementById('playerInputs').innerHTML = `<label for="player${nextPlayer}">Player ${nextPlayer}: </label><input type="text" id="player${nextPlayer}" name="player${nextPlayer}">`;
        }
        if (players.length >= 2) {
            document.getElementById('startTournamentBtn').style.display = 'block';
            document.getElementById('startTournamentBtn').textContent = `Start with ${players.length} players`;
        }
    }
});

document.getElementById('startTournamentBtn').addEventListener('click', function() {
    // Fill remaining slots with AI
    while (players.length < 8) {
        players.push(`AI ${players.length + 1}`);
    }

    // Create tournament matches
    tournamentMatches = [
        { stage: 'Quarter-Finals', match: 1, player1: players[0], player2: players[1] },
        { stage: 'Quarter-Finals', match: 2, player1: players[2], player2: players[3] },
        { stage: 'Quarter-Finals', match: 3, player1: players[4], player2: players[5] },
        { stage: 'Quarter-Finals', match: 4, player1: players[6], player2: players[7] },
        { stage: 'Semi-Finals', match: 1, player1: '', player2: '' },
        { stage: 'Semi-Finals', match: 2, player1: '', player2: '' },
        { stage: 'Finals', match: 1, player1: '', player2: '' }
    ];

    // Hide the tournament setup and show the first match
    document.getElementById('tournamentSetup').style.display = 'none';
    document.getElementById('startTournamentBtn').style.display = 'none'; // Hide the "Start with X players" button
    document.getElementById('tournamentMatch').style.display = 'block';
    showNextMatch();
});

document.getElementById('goBackBtn').addEventListener('click', function() {
    // Go back to the multiplayer options menu
    document.getElementById('tournamentSetup').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'flex';
});

document.getElementById('startMatchBtn').addEventListener('click', function() {
    // Start the local match between the two players
    document.getElementById('tournamentMatch').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'block';
    LocalMultiplayer = true;
    playerRole = 'player1';
    startGame();
    //show winner and match type (quarter-finals, semi-finals, finals)
});

document.getElementById('proceedBtn').addEventListener('click', function() {
    // Proceed to the next match
    document.getElementById('pongCanvas').style.display = 'none';
    document.getElementById('proceedBtn').style.display = 'none';
    showNextMatch();
});

document.getElementById('goBackToMenuBtn').addEventListener('click', function() {
    // Go back to the multiplayer options menu
    document.getElementById('tournamentWinner').style.display = 'none';
    document.getElementById('multiplayer-menu').style.display = 'flex';
});

function showNextMatch() {
    while (currentMatch < tournamentMatches.length) {
        const match = tournamentMatches[currentMatch];
        if (match.player1.startsWith('AI') && match.player2.startsWith('AI')) {
            // Both players are AI, randomly select a winner
            const winner = Math.random() < 0.5 ? match.player1 : match.player2;
            updateTournamentMatches(match, winner);
            currentMatch++;
        } else {
            // At least one player is a human, show the match preparation screen
            document.getElementById('tournamentStage').textContent = `${match.stage} (${match.match}/${match.stage === 'Quarter-Finals' ? 4 : match.stage === 'Semi-Finals' ? 2 : 1})`;
            document.getElementById('matchup').textContent = `${match.player1} VS. ${match.player2}`;
            document.getElementById('startMatchBtn').style.display = 'block';
            document.getElementById('tournamentMatch').style.display = 'block';
            currentMatch++;
            return;
        }
    }

    // Tournament is over, show the winner
    document.getElementById('tournamentMatch').style.display = 'none';
    document.getElementById('tournamentWinner').style.display = 'block';
    document.getElementById('winnerMessage').textContent = `${tournamentWinner} Wins! Congratulations!!!`;
}

function updateTournamentMatches(match, winner) {
    if (match.stage === 'Quarter-Finals') {
        if (match.match === 1) tournamentMatches[4].player1 = winner;
        if (match.match === 2) tournamentMatches[4].player2 = winner;
        if (match.match === 3) tournamentMatches[5].player1 = winner;
        if (match.match === 4) tournamentMatches[5].player2 = winner;
    } else if (match.stage === 'Semi-Finals') {
        if (match.match === 1) tournamentMatches[6].player1 = winner;
        if (match.match === 2) tournamentMatches[6].player2 = winner;
    } else if (match.stage === 'Finals') {
        tournamentWinner = winner;
    }
}

function startTournamentGame() {
    // Initialize game state
    isMatchmaking = false;
    document.getElementById('pongCanvas').style.pointerEvents = 'auto';
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('pongCanvas').style.display = 'block';

    const startButton = document.getElementById('start-solo-game-btn');
    startButton.textContent = 'Restart Game';

    startButton.removeEventListener('click', startGame);
    startButton.addEventListener('click', restartPong);

    gameRunning = true;
    requestAnimationFrame(draw);
}

function endGameTournament() {
    document.getElementById('proceedBtn').style.display = 'block';
    document.getElementById('proceedBtn').textContent = 'Proceed to Next Match';
    // Determine the winner and update the tournament matches
    const match = tournamentMatches[currentMatch - 1];
    const winner = determineWinner(match.player1, match.player2);
    if (match.stage === 'Quarter-Finals') {
        if (match.match === 1) tournamentMatches[4].player1 = winner;
        if (match.match === 2) tournamentMatches[4].player2 = winner;
        if (match.match === 3) tournamentMatches[5].player1 = winner;
        if (match.match === 4) tournamentMatches[5].player2 = winner;
    } else if (match.stage === 'Semi-Finals') {
        if (match.match === 1) tournamentMatches[6].player1 = winner;
        if (match.match === 2) tournamentMatches[6].player2 = winner;
    } else if (match.stage === 'Finals') {
        tournamentWinner = winner;
    }

    // Hide the game canvas and show the proceed button
    // Check if the tournament is over
    if (currentMatch >= tournamentMatches.length) {
        isTournament = false;
        document.getElementById('pongCanvas').style.display = 'none';
        document.getElementById('tournamentMatch').style.display = 'none';
        document.getElementById('tournamentWinner').style.display = 'block';
        document.getElementById('winnerMessage').textContent = `${tournamentWinner} Wins! Congratulations!!!`;
    }
}

function determineWinner(player1, player2) {
    // Implement the logic to determine the winner of the match
    // For now, we'll randomly select a winner
    return Math.random() < 0.5 ? player1 : player2;
}