const gameContainer = document.getElementById('memory-game-container');
const cardValues = ['🍓', '🍒', '🥑', '🥝', '🍎', '🍊', '🍉', '🍍','🍇', '🍋', '🥥', '🫐'];

let cards = [];
let flippedCards = [];
let botMemory = {}; 
let matchedCards = 0;
let points = 0;
let pairs = 10;
let isMemoryGameAIEnabled = true;
let isPlayerTurn = true;
let shuffleModeEnabled = false;
let hintModeEnabled = false;
let hintActive = false; // Indique si l'aide est en cours
let botMoveTimeout;
let defaultDifficulty = 'medium'; 
let attempts = 0; 
let shuffleAttempts = 0;

document.getElementById('start-solo-game-btn-memo').addEventListener('click', () => {
    defaultDifficulty = document.getElementById('memoryDifficultySelect').value;
    
    document.getElementById('difficulty-menu-m').style.display = 'none';
    document.getElementById('return-menu-btn-memo').style.display = 'none';
    gameContainer.style.display = 'grid';

    startMemory();
});

document.getElementById('shuffleToggle').addEventListener('change', function() {
    shuffleModeEnabled = this.checked; 
});

document.getElementById('hintToggle').addEventListener('change', function() {
    hintModeEnabled = this.checked; 
});

function startMemory() 
{
    resetMemory();
    generateCardsBasedOnDifficulty();
    shuffle(cards);
    displayCards();
    if (isMemoryGameAIEnabled)
        botMoveTimeout = setTimeout(botMove, 1000);

    const startButton = document.getElementById('start-solo-game-btn-memo');
    startButton.textContent = 'Go back';

    startButton.removeEventListener('click', startMemory);
    startButton.addEventListener('click', restartMemory);
}

function resetMemory() 
{
    clearTimeout(botMoveTimeout);
    gameContainer.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedCards = 0;
    points = 0;
    isPlayerTurn = true;
    attempts = 0;
    shuffleAttempts = 0;
}

function generateCardsBasedOnDifficulty() 
{
    if (defaultDifficulty === 'easy')
        pairs = 8;
    else if (defaultDifficulty === 'medium') 
        pairs = 10; 
    else
        pairs = 12; 

    for (let i = 0; i < pairs; i++) 
    {
        cards.push({ value: cardValues[i], matched: false });
        cards.push({ value: cardValues[i], matched: false });
    }
}

function shuffle(array) 
{
    for (let i = array.length - 1; i > 0; i--) 
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleUnmatchedCards() 
{
    if(shuffleModeEnabled)
    {
        // Extraire les cartes non trouvées
        const unmatchedCards = cards.filter(card => !card.matched);
        shuffle(unmatchedCards); // Utiliser la fonction de mélange existante

        // Réassigner uniquement les cartes non appariées sans toucher aux cartes trouvées
        let unmatchedIndex = 0;
        for (let i = 0; i < cards.length; i++) 
        {
            if (!cards[i].matched)
                cards[i] = unmatchedCards[unmatchedIndex++];
        }

        // Réinitialiser l'affichage pour refléter les nouvelles positions
        resetBoard();
    }
}

// Fonction pour réinitialiser l'affichage du tableau
function resetBoard() 
{
    gameContainer.innerHTML = ''; // Effacer les cartes existantes
    displayCards(); // Réafficher les cartes dans leur nouvel ordre
}

// Fonction pour montrer une carte non appariée
function showHintCard() {
    const unmatchedCards = cards.filter(card => !card.matched);
    if (unmatchedCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * unmatchedCards.length);
        const randomCard = unmatchedCards[randomIndex];
        const cardElement = document.querySelector(`[data-index='${cards.indexOf(randomCard)}']`);

        cardElement.classList.add('hint');
        revealCard(cardElement);
        setTimeout(() => {
            cardElement.classList.remove('hint');
            hideCard(cardElement);
        }, 1000); // La carte reste visible pendant 1 seconde
    }
}

function displayCards() {
    gameContainer.innerHTML = ''; // Effacer l'affichage existant
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.index = index;

        if (card.matched) {
            cardElement.textContent = card.value; // Afficher la valeur de la carte
            cardElement.classList.add('matched');
            
            // Appliquer le style spécifique basé sur le joueur
            if (card.foundBy === 'player') {
                cardElement.classList.add('player-match');
            } else if (card.foundBy === 'bot') {
                cardElement.classList.add('bot-match');
            }
        } else {
            cardElement.classList.add('hidden'); // Sinon, masquer la carte
        }

        cardElement.addEventListener('click', () => onCardClick(cardElement));
        gameContainer.appendChild(cardElement);
    });
    gameContainer.style.gridTemplateColumns = `repeat(${Math.sqrt(cards.length)}, 1fr)`;
}

function onCardClick(cardElement) 
{
    if (isPlayerTurn && flippedCards.length < 2 && cardElement.classList.contains('hidden')) 
    {
        revealCard(cardElement);
        flippedCards.push(cardElement);
        if (flippedCards.length === 2) 
            checkForMatch();
    }
}

function revealCard(cardElement) 
{
    const index = cardElement.dataset.index;
    cardElement.textContent = cards[index].value;
    cardElement.classList.remove('hidden');
}

function hideCard(cardElement) 
{
    cardElement.textContent = '';
    cardElement.classList.add('hidden');
}

function checkForMatch() 
{
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;

    if (cards[index1].value === cards[index2].value) 
    {
        card1.classList.add('matched');
        card2.classList.add('matched');
        cards[index1].matched = true;
        cards[index2].matched = true;
    
        // Ajouter la propriété de joueur pour les cartes appariées
        cards[index1].foundBy = isPlayerTurn ? 'player' : 'bot';
        cards[index2].foundBy = isPlayerTurn ? 'player' : 'bot';
        
        matchedCards += 2;
        flippedCards = [];
        attempts = 0; // Réinitialiser les tentatives sur succès
        shuffleAttempts = 0;
        delete botMemory[index1];
        delete botMemory[index2];

        if (isPlayerTurn) {
            card1.classList.add('player-match');
            card2.classList.add('player-match');
            points++;
        } else if (!isPlayerTurn && isMemoryGameAIEnabled) {
            card1.classList.add('bot-match');
            card2.classList.add('bot-match');
        }

        if (matchedCards === cards.length) {
            setTimeout(() => {
                if (points > pairs / 2) {
                    //window.updateGameStats(1);
                    endGame('Joueur');
                } else if (points === pairs / 2) {
                    //window.updateGameStats(0);
                    endGame('Égalité');
                } else {
                    //window.updateGameStats(-1);
                    endGame('Bot');
                }
            }, 500);
        } else if (!isPlayerTurn && isMemoryGameAIEnabled) {
            botMoveTimeout = setTimeout(botMove, 1000);
        }
    } else {
        // Logique pour une paire incorrecte
        setTimeout(() => {
            hideCard(card1);
            hideCard(card2);
            flippedCards = [];
            botMemory[index1] = cards[index1].value;
            botMemory[index2] = cards[index2].value;

            shuffleAttempts++;
            attempts++;
            if (shuffleAttempts >= 4 && shuffleModeEnabled) {
                shuffleUnmatchedCards(); // Mélanger les cartes non matchées
                shuffleAttempts = 0; // Réinitialiser après mélange
            }
            if (attempts >= 4 && hintModeEnabled) {
                setTimeout(showHintCard, 1200); // Afficher l'aide après un délai
                attempts = 0;
            }

            if (isPlayerTurn) {
                isPlayerTurn = false;
                botMoveTimeout = setTimeout(botMove, 1000);
            } else if (!isPlayerTurn && isMemoryGameAIEnabled) {
                isPlayerTurn = true;
            }
        }, 1000);
    }
}

function botMove() {
    if (!isMemoryGameAIEnabled || isPlayerTurn || hintActive) return; // Vérifie si l'aide est active

    let rememberedPairs = [];

    for (let index1 in botMemory) {
        for (let index2 in botMemory) {
            if (index1 !== index2 && botMemory[index1] === botMemory[index2])
                rememberedPairs.push([index1, index2]);
        }
    }

    let randomCard1, randomCard2;

    if (rememberedPairs.length > 0) {
        const pairToFlip = rememberedPairs[0];
        randomCard1 = cards[pairToFlip[0]];
        randomCard2 = cards[pairToFlip[1]];
    } else {
        const unmatchedCards = cards.filter(card => !card.matched);
        randomCard1 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        do {
            randomCard2 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        } while (randomCard1 === randomCard2);
    }

    const botCardElement1 = document.querySelector(`.card[data-index='${cards.indexOf(randomCard1)}']`);
    const botCardElement2 = document.querySelector(`.card[data-index='${cards.indexOf(randomCard2)}']`);

    revealCard(botCardElement1);
    flippedCards.push(botCardElement1);

    setTimeout(() => {
        revealCard(botCardElement2);
        flippedCards.push(botCardElement2);

        checkForMatch();

        if (cards[botCardElement1.dataset.index].matched && cards[botCardElement2.dataset.index].matched) {
            botCardElement1.classList.add('bot-match');
            botCardElement2.classList.add('bot-match');
        }
    }, 1000);
}

function endGame(winner) 
{
    const cardsContainer = document.querySelector(".cards-container"); 
    const endMessage = document.createElement("div");
    
    endMessage.style.position = "absolute";
    endMessage.style.top = "50%";
    endMessage.style.left = "50%";
    endMessage.style.transform = "translate(-50%, -50%)";
    endMessage.style.padding = "20px";
    endMessage.style.backgroundColor = "#1a1a1a";
    endMessage.style.color = "#fff";
    endMessage.style.borderRadius = "10px";
    endMessage.style.boxShadow = "0px 0px 10px rgba(255, 255, 255, 0.5)";
    endMessage.style.textAlign = "center";
    endMessage.style.zIndex = "1000";

    endMessage.innerHTML = `
        <h1>🎉 ${winner} a gagné! 🎉</h1>
        <p>Merci d'avoir joué.</p>
    `;

    document.body.appendChild(endMessage);

    setTimeout(() => {
        if (cardsContainer) {
            cardsContainer.style.opacity = "0"; 
            setTimeout(() => {
                cardsContainer.innerHTML = ""; 
                cardsContainer.style.opacity = "1"; 
            }, 500); 
        }
    }, 1000); 

    setTimeout(() => {
        endMessage.remove();
    }, 5000);
}

function restartMemory() 
{
    resetMemory();
    gameContainer.style.display = 'none';
    document.getElementById('difficulty-menu-m').style.display = 'block';

    const startButton = document.getElementById('start-solo-game-btn-memo');
    document.getElementById('return-menu-btn-memo').style.display = 'block';
    startButton.textContent = 'Start Game';

    startButton.removeEventListener('click', restartMemory);
    startButton.addEventListener('click', startMemory);
}
