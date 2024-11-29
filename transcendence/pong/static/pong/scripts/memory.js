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
let currentPlayer = 'player1'; // Track the current player
let player1Points = 0;
let player2Points = 0;

document.getElementById('start-solo-game-btn-memo').addEventListener('click', () => {
    defaultDifficulty = document.getElementById('memoryDifficultySelect').value;
    
    document.getElementById('difficulty-menu-m').style.display = 'none';
    document.getElementById('return-menu-btn-memo').style.display = 'none';
    document.getElementById('gamecustom-shuffle').style.display = 'none';
    document.getElementById('gamecustom-hint').style.display = 'none';
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
    currentPlayer = 'player1';
    player1Points = 0;
    player2Points = 0;
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
        const unmatchedCards = cards.filter(card => !card.matched);
        shuffle(unmatchedCards);

        let unmatchedIndex = 0;
        for (let i = 0; i < cards.length; i++) 
        {
            if (!cards[i].matched)
                cards[i] = unmatchedCards[unmatchedIndex++];
        }

        resetBoard();
    }
}

function resetBoard() 
{
    gameContainer.innerHTML = '';
    displayCards();
}

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
        }, 1000);
    }
}

function displayCards() {
    gameContainer.innerHTML = '';
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.index = index;

        if (card.matched) {
            cardElement.textContent = card.value;
            cardElement.classList.add('matched');
            
            if (card.foundBy === 'player') {
                cardElement.classList.add('player-match');
            } else if (card.foundBy === 'bot') {
                cardElement.classList.add('bot-match');
            } else if (card.foundBy === 'player1') {
                cardElement.classList.add('player1-match');
            } else if (card.foundBy === 'player2') {
                cardElement.classList.add('player2-match');
            }
        } else {
            cardElement.classList.add('hidden');
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
    
        cards[index1].foundBy = isMemoryGameAIEnabled ? (isPlayerTurn ? 'player' : 'bot') : currentPlayer;
        cards[index2].foundBy = isMemoryGameAIEnabled ? (isPlayerTurn ? 'player' : 'bot') : currentPlayer;
        
        matchedCards += 2;
        flippedCards = [];
        attempts = 0;
        shuffleAttempts = 0;
        delete botMemory[index1];
        delete botMemory[index2];

        if (isMemoryGameAIEnabled) {
            if (isPlayerTurn) {
                card1.classList.add('player-match');
                card2.classList.add('player-match');
                points++;
            } else {
                card1.classList.add('bot-match');
                card2.classList.add('bot-match');
            }
        } else {
            if (currentPlayer === 'player1') {
                card1.classList.add('player1-match');
                card2.classList.add('player1-match');
                player1Points++;
            } else {
                card1.classList.add('player2-match');
                card2.classList.add('player2-match');
                player2Points++;
            }
        }

        if (matchedCards === cards.length) {
            setTimeout(() => {
                if (isMemoryGameAIEnabled) {
                    if (points > pairs / 2) {
                        window.updateGameStats(1);
                        endGame('Joueur');
                    } else if (points === pairs / 2) {
                        window.updateGameStats(0);
                        endGame('Égalité');
                    } else {
                        window.updateGameStats(-1);
                        endGame('Bot');
                    }
                } else {
                    if (player1Points > player2Points) {
                        window.updateGameStats(1);
                        endGame('Player 1');
                    } else if (player1Points === player2Points) {
                        window.updateGameStats(0);
                        endGame('Draw');
                    } else {
                        window.updateGameStats(-1);
                        endGame('Player 2');
                    }
                }
            }, 500);
        } else if (!isPlayerTurn && isMemoryGameAIEnabled) {
            botMoveTimeout = setTimeout(botMove, 1000);
        }
    } else {
        setTimeout(() => {
            hideCard(card1);
            hideCard(card2);
            flippedCards = [];
            botMemory[index1] = cards[index1].value;
            botMemory[index2] = cards[index2].value;

            shuffleAttempts++;
            attempts++;
            if (shuffleAttempts >= 4 && shuffleModeEnabled) {
                shuffleUnmatchedCards();
                shuffleAttempts = 0;
            }
            if (attempts >= 4 && hintModeEnabled) {
                setTimeout(showHintCard, 1200);
                attempts = 0;
            }

            if (isMemoryGameAIEnabled) {
                if (isPlayerTurn) {
                    isPlayerTurn = false;
                    botMoveTimeout = setTimeout(botMove, 1000);
                } else {
                    isPlayerTurn = true;
                }
            } else {
                currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
                isPlayerTurn = true; // Ensure the next player can click
            }
        }, 1000);
    }
}

function botMove() {
    if (!isMemoryGameAIEnabled || isPlayerTurn || hintActive) return;

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
    alert(`${winner} a gagné!`);
}

function restartMemory() 
{
    resetMemory();
    gameContainer.style.display = 'none';
    document.getElementById('difficulty-menu-m').style.display = 'block';
    document.getElementById('gamecustom-shuffle').style.display = 'block';
    document.getElementById('gamecustom-hint').style.display = 'block';

    const startButton = document.getElementById('start-solo-game-btn-memo');
    document.getElementById('return-menu-btn-memo').style.display = 'block';
    startButton.textContent = 'Start Game';

    startButton.removeEventListener('click', restartMemory);
    startButton.addEventListener('click', startMemory);
}

function resetDisplay_memory()
{
    document.getElementById('mainMenuCanvas-memory').display = 'none';
    document.getElementById('singleplayerButton-memory').display = 'none';
    document.getElementById('multiplayerButton-memory').display = 'none';
    document.getElementById('leftSideM').display = 'none';
    document.getElementById('rightSideM').display = 'none';
	// document.getElementById('closeModalM');

    document.getElementById('difficulty-menu-m').display = 'none';
    document.getElementById('multiplayer-menu-memory').display = 'none';
    document.getElementById('local-btn-memory').display = 'none';
    document.getElementById('memory-game-container').display = 'none';
	document.getElementById('gamecustom-shuffle').display = 'none';
	document.getElementById('gamecustom-hint').display = 'none';

    document.getElementById('start-solo-game-btn-memo').display = 'none';
    document.getElementById('go-back-btn-memo').display = 'none';
    document.getElementById('return-menu-btn-memo').display = 'none';
}


// Boutons du multi-joueur



document.getElementById('local-btn-memory').addEventListener('click', () => {
    isMemoryGameAIEnabled = false;
});

document.getElementById('leftSideM').addEventListener('click', () => {
    resetDisplay_memory();
    isMemoryGameAIEnabled = true;
    document.getElementById('difficulty-menu-m').display = 'block';
    document.getElementById('gamecustom-shuffle').display = 'block';
    document.getElementById('gamecustom-hint').display = 'block';
    document.getElementById('start-solo-game-btn-memo').display = 'block';
    document.getElementById('return-menu-btn-memo').display = 'block';
    document.getElementById('start-solo-game-btn-memo').textContent = 'Start Game';
});