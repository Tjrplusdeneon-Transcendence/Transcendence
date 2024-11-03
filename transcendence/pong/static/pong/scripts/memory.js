const gameContainer = document.getElementById('memory-game-container');
const cardValues = ['🍓', '🍒', '🥑', '🥝', '🍎', '🍊', '🍉', '🍍','🍇', '🍋'];

let cards = [];
let flippedCards = [];
let botMemory = {}; 
let matchedCards = 0;
let points = 0;
let pairs = 6;
let isMemoryGameAIEnabled = true;
let isPlayerTurn = true;
let botMoveTimeout;
let defaultDifficulty = 'medium'; 

document.getElementById('start-memory-game-btn').addEventListener('click', () => {
    defaultDifficulty = document.getElementById('memoryDifficultySelect').value;
    
    document.getElementById('difficulty-menu-m').style.display = 'none';
    gameContainer.style.display = 'grid';

    startMemory();
});

function startMemory() 
{
    resetMemory();
    generateCardsBasedOnDifficulty();
    shuffle(cards);
    displayCards();
    if (isMemoryGameAIEnabled)
        botMoveTimeout = setTimeout(botMove, 1000);

    const startButton = document.getElementById('start-memory-game-btn');
    startButton.textContent = 'Restart Game';

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
}

function generateCardsBasedOnDifficulty() 
{
    if (defaultDifficulty === 'easy')
        pairs = 6;
    else if (defaultDifficulty === 'medium') 
        pairs = 8; 
    else
        pairs = 10; 

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

function displayCards() 
{
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'hidden');
        cardElement.dataset.index = index;
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
        matchedCards += 2;
        flippedCards = [];
        delete botMemory[index1];
        delete botMemory[index2];

        if (isPlayerTurn) 
        {
            card1.classList.add('player-match');
            card2.classList.add('player-match');
            points++;
        }
        else if (!isPlayerTurn && isMemoryGameAIEnabled)
        {
            card1.classList.add('bot-match');
            card2.classList.add('bot-match');
        }

        if (matchedCards === cards.length) 
        {
            setTimeout(() => {
                if (points > pairs / 2) 
                {
                    window.updateGameStats(1);
                    endGame('Joueur');
                } 
                else if (points === pairs / 2) 
                {
                    window.updateGameStats(0);
                    endGame('Égalité');
                } 
                else 
                {
                    window.updateGameStats(-1);
                    endGame('Bot');
                }
            }, 500);
        } 
        else if (!isPlayerTurn && isMemoryGameAIEnabled) 
            botMoveTimeout = setTimeout(botMove, 1000);
        
    } 
    else 
    {
        setTimeout(() => {
            hideCard(card1);
            hideCard(card2);
            flippedCards = [];
            botMemory[index1] = cards[index1].value;
            botMemory[index2] = cards[index2].value;

            if (isPlayerTurn) 
            {
                isPlayerTurn = false;
                botMoveTimeout = setTimeout(botMove, 1000);
            } 
            else if (!isPlayerTurn && isMemoryGameAIEnabled)
                isPlayerTurn = true;
        }, 1000);
    }
}

function botMove() 
{
    if (!isMemoryGameAIEnabled || isPlayerTurn) return;

    let rememberedPairs = [];

    for (let index1 in botMemory) 
    {
        for (let index2 in botMemory) 
        {
            if (index1 !== index2 && botMemory[index1] === botMemory[index2])
                rememberedPairs.push([index1, index2]);
        }
    }

    let randomCard1, randomCard2;

    if (rememberedPairs.length > 0) 
    {
        const pairToFlip = rememberedPairs[0];
        randomCard1 = cards[pairToFlip[0]];
        randomCard2 = cards[pairToFlip[1]];
    } 
    else 
    {
        const unmatchedCards = cards.filter(card => !card.matched);
        randomCard1 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        do 
        {
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

        if (cards[botCardElement1.dataset.index].matched && cards[botCardElement2.dataset.index].matched) 
        {
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

    const startButton = document.getElementById('start-memory-game-btn');
    startButton.textContent = 'Start Game';

    startButton.removeEventListener('click', restartMemory);
    startButton.addEventListener('click', startMemory);
}
