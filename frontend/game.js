const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

let paddleHeight = 100, paddleWidth = 10;
let paddleY1 = (canvas.height - paddleHeight) / 2;
let paddleY2 = (canvas.height - paddleHeight) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = 2;
let dy = -2;

let mouseY = canvas.height / 2; // Position de la souris initiale

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

function draw() 
{
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle(0, paddleY1); // Palette du joueur 1
    drawPaddle(canvas.width - paddleWidth, paddleY2); // Palette du joueur 2
    drawBall();

    // Déplace la palette du joueur en fonction de la souris
    paddleY1 = mouseY - paddleHeight / 2;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

function startGame() 
{
    document.getElementById('pongCanvas').style.display = 'block'; // Affiche le canvas
    draw(); // Démarre le jeu
}

// Cache le canvas du jeu au départ
document.getElementById('pongCanvas').style.display = 'none';

// Ajoute un gestionnaire d'événements pour suivre la position de la souris
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = event.clientY - rect.top; // Ajuste la position Y de la souris relative au canvas

    // Empeche la palette de sortir du canvas
    if (mouseY < paddleHeight / 2) 
	{
        mouseY = paddleHeight / 2;
    }
    if (mouseY > canvas.height - paddleHeight / 2) 
	{
        mouseY = canvas.height - paddleHeight / 2;
    }
});
