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
let messageDisplay = false;
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
let endMessage;

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

function startMemory() {
    resetMemory();
    generateCardsBasedOnDifficulty();
    shuffle(cards);
    displayCards();

    if (isOnlineMultiplayer && currentPlayer === playerRole_memory) {
        sendMemoryGameState(); // Send the initial game state to the server
    }
    if (isMemoryGameAIEnabled) {
        botMoveTimeout = setTimeout(botMove, 1000);
    }

    const startButton = document.getElementById('start-solo-game-btn-memo');
    startButton.textContent = 'Go back';

    startButton.removeEventListener('click', startMemory);
    startButton.addEventListener('click', restartMemory);

    // Ensure the game canvas is displayed
    document.getElementById('memory-game-container').style.display = 'grid';
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
    messageDisplay = false;
    attempts = 0;
    shuffleAttempts = 0;
    currentPlayer = 'player1';
    player1Points = 0;
    player2Points = 0;
    if (typeof endMessage !== 'undefined')
        endMessage.remove();
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
    shuffleMessage();
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

function onCardClick(cardElement) {
    if (!messageDisplay && isPlayerTurn && flippedCards.length < 2 && cardElement.classList.contains('hidden') && (!isOnlineMultiplayer || currentPlayer === playerRole_memory)) {
        revealCard(cardElement);
        flippedCards.push(cardElement);
        if (isOnlineMultiplayer) {
            sendCardFlip(cardElement.dataset.index); // Send card flip event to the server
        }
        if (flippedCards.length === 2) {
            checkForMatch();
        }
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

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const index1 = card1.dataset.index;
    const index2 = card2.dataset.index;

    if (cards[index1].value === cards[index2].value) {
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
                        // window.updateGameStats(1);
                        endGame('Joueur');
                    } else if (points === pairs / 2) {
                        // window.updateGameStats(0);
                        endGame('Égalité');
                    } else {
                        // window.updateGameStats(-1);
                        endGame('Bot');
                    }
                } else {
                    if (player1Points > player2Points) {
                        // window.updateGameStats(1);
                        endGame('Player 1');
                    } else if (player1Points === player2Points) {
                        // window.updateGameStats(0);
                        endGame('Draw');
                    } else {
                        // window.updateGameStats(-1);
                        endGame('Player 2');
                    }
                }
                if (isOnlineMultiplayer) {
                    sendMemoryGameState(); // Send updated game state to the server
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

            if (isOnlineMultiplayer) {
                sendMemoryGameState(); // Send updated game state to the server
                sendCardFlipResult(index1, index2, false); // Send card flip result to the server
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

function shuffleMessage() 
{
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
        <h1>Reshuffle !</h1>
        <p>No match since 4 tries, reshuffling...</p>
    `;
    
    messageDisplay = true;
    document.body.appendChild(endMessage);

    setTimeout(() => {
        endMessage.remove();
        messageDisplay = false;
    }, 4000);
}

function endGame(winner) 
{
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
        <h1>🎉 ${winner} win! 🎉</h1>
        <p>Thanks for playing.</p>
    `;

    document.body.appendChild(endMessage);
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

let isOnlineMultiplayer = false;
let bothPlayersReady_memory = false;
let playerReady_memory = false;
let rematchRequested_memory = false;
let playerRole_memory = null;
let socket_memory = null;

// gestion du online
function launchOnlineMemoryGame() {
    isOnlineMultiplayer = true;
    isMemoryGameAIEnabled = false;
    document.getElementById('multiplayer-menu-memory').style.display = 'none';
    document.getElementById('searching-menu-memory').style.display = 'flex';
    document.getElementById('go-back-btn-memo').style.display = 'inline-block';
    document.getElementById('go-back-btn-memo').textContent = 'Go Back';
    document.getElementById('return-menu-btn-memo').style.display = 'none';

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const path = '/ws/memory/';

    const socketUrl = `${protocol}://${host}${path}`;
    console.log(`Connecting to WebSocket at: ${socketUrl}`);

    socket_memory = new WebSocket(socketUrl);

    socket_memory.onopen = function(e) {
        console.log('WebSocket connected.');
        socket_memory.send(JSON.stringify({ type: 'matchmaking' }));
    };

    socket_memory.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'match_found') {
            playerRole_memory = data.player;
            document.getElementById('searching-btn-memory').textContent = 'Start Match';
            document.getElementById('searching-btn-memory').disabled = false;
            document.getElementById('searching-btn-memory').classList.add('active');
        } else if (data.type === 'player_ready') {
            if (data.player !== playerRole_memory) {
                bothPlayersReady_memory = true;
                document.getElementById('searching-btn-memory').textContent = 'Start Match';
                document.getElementById('searching-btn-memory').disabled = false;
                document.getElementById('searching-btn-memory').classList.add('active');
            }
        } else if (data.type === 'start_game') {
            document.getElementById('searching-menu-memory').style.display = 'none';
            document.getElementById('go-back-btn-memo').style.display = 'none';
            document.getElementById('rematch-btn-memory').style.display = 'inline-block';
            document.getElementById('quit-btn-memory').style.display = 'inline-block';
            document.getElementById('quit-btn-memory').textContent = 'Quit Match';
            document.getElementById('return-menu-btn-memo').style.display = 'inline-block';
            document.getElementById('return-menu-btn-memo').disabled = true;
            initializeMemoryGameState(data.initial_state);
            startMemory();
            resetMatchmakingStateMemory();
            document.getElementById('rematch-btn-memory').disabled = true;
            document.getElementById('quit-btn-memory').disabled = true;
        } else if (data.type === 'opponent_left') {
            document.getElementById('searching-btn-memory').textContent = 'Opponent has left the match';
            document.getElementById('searching-btn-memory').disabled = true;
            document.getElementById('searching-btn-memory').classList.remove('active');
            document.getElementById('rematch-btn-memory').textContent = 'Opponent has left the match';
            document.getElementById('rematch-btn-memory').disabled = true;
            document.getElementById('quit-btn-memory').disabled = false;
        } else if (data.type === 'rematch') {
            if (data.player !== playerRole_memory) {
                bothPlayersReady_memory = true;
                document.getElementById('rematch-btn-memory').textContent = 'Opponent wants a rematch';
                document.getElementById('rematch-btn-memory').disabled = false;
                document.getElementById('quit-btn-memory').disabled = false;
            }
            if (rematchRequested_memory && bothPlayersReady_memory) {
                socket_memory.send(JSON.stringify({ type: 'start_game' }));
            }
        } else if (data.type === 'game_update') {
            updateMemoryGameState(data.state);
        } else if (data.type === 'card_flipped') {
            handleCardFlip(data.player, data.card_index);
        } else if (data.type === 'card_flip_result') {
            handleCardFlipResult(data.player, data.card_indices, data.matched);
        }
    };

    socket_memory.onclose = function(event) {
        console.log('WebSocket closed.');
    };

    socket_memory.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

document.getElementById('searching-btn-memory').addEventListener('click', function() {
    if (this.textContent === 'Start Match') {
        this.textContent = 'Waiting for opponent...';
        this.disabled = true;
        playerReady_memory = true;
        socket_memory.send(JSON.stringify({ type: 'player_ready', player: playerRole_memory }));
        if (bothPlayersReady_memory) {
            socket_memory.send(JSON.stringify({ type: 'start_game' }));
        }
    }
});

document.getElementById('rematch-btn-memory').addEventListener('click', function() {
    this.textContent = 'Waiting for opponent...';
    this.disabled = true;
    rematchRequested_memory = true;
    socket_memory.send(JSON.stringify({ type: 'rematch', player: playerRole_memory }));
});

document.getElementById('quit-btn-memory').addEventListener('click', function() {
    socket_memory.send(JSON.stringify({ type: 'quit' }));
    resetMatchmakingStateMemory();
    document.getElementById('multiplayer-menu-memory').style.display = 'flex';
    document.getElementById('rematch-btn-memory').style.display = 'none';
    document.getElementById('quit-btn-memory').style.display = 'none';
    document.getElementById('memory-game-container').style.display = 'none';
    document.getElementById('go-back-btn-memo').style.display = 'none';
    document.getElementById('return-menu-btn-memo').style.display = 'inline-block';
    document.getElementById('return-menu-btn-memo').disabled = false;
});

function initializeMemoryGameState(initialState) {
    // Initialize the game state with the received initial state
    cards = initialState.cards;
    player1Points = initialState.player1_points;
    player2Points = initialState.player2_points;
    currentPlayer = initialState.current_player;

    // Ensure the game canvas is displayed
    document.getElementById('memory-game-container').style.display = 'grid';
    displayCards();
}

function updateMemoryGameState(state) {
    // Update the game state with the received state
    cards = state.cards;
    player1Points = state.player1_points;
    player2Points = state.player2_points;
    currentPlayer = state.current_player;
    displayCards();
}

function handleCardFlip(player, cardIndex) {
    // Handle the card flip event
    const cardElement = document.querySelector(`.card[data-index='${cardIndex}']`);
    revealCard(cardElement);
    flippedCards.push(cardElement);
    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function resetMatchmakingStateMemory() {
    bothPlayersReady = false;
    playerReady = false;
    rematchRequested = false;
    document.getElementById('searching-btn-memory').textContent = 'Searching for opponent...';
    document.getElementById('searching-btn-memory').disabled = true;
    document.getElementById('searching-btn-memory').classList.remove('active');
    document.getElementById('rematch-btn-memory').textContent = 'Rematch';
    document.getElementById('rematch-btn-memory').disabled = true;
    document.getElementById('quit-btn-memory').disabled = true;
}

function sendCardFlip(cardIndex) {
    if (socket_memory && socket_memory.readyState === WebSocket.OPEN) {
        socket_memory.send(JSON.stringify({
            type: 'card_flip',
            player: playerRole_memory,
            card_index: cardIndex
        }));
    }
}

function sendMemoryGameState() {
    if (socket_memory && socket_memory.readyState === WebSocket.OPEN) {
        socket_memory.send(JSON.stringify({
            type: 'game_update',
            state: {
                cards: cards,
                player1_points: player1Points,
                player2_points: player2Points,
                current_player: currentPlayer
            }
        }));
    }
}

function sendCardFlipResult(index1, index2, matched) {
    if (socket_memory && socket_memory.readyState === WebSocket.OPEN) {
        socket_memory.send(JSON.stringify({
            type: 'card_flip_result',
            player: playerRole_memory,
            card_indices: [index1, index2],
            matched: matched
        }));
    }
}
function handleCardFlipResult(player, cardIndices, matched) {
    const [index1, index2] = cardIndices;
    const cardElement1 = document.querySelector(`.card[data-index='${index1}']`);
    const cardElement2 = document.querySelector(`.card[data-index='${index2}']`);

    if (matched) {
        cardElement1.classList.add('matched');
        cardElement2.classList.add('matched');
        cards[index1].matched = true;
        cards[index2].matched = true;

        cards[index1].foundBy = player;
        cards[index2].foundBy = player;

        if (player === 'player1') {
            cardElement1.classList.add('player1-match');
            cardElement2.classList.add('player1-match');
        } else {
            cardElement1.classList.add('player2-match');
            cardElement2.classList.add('player2-match');
        }
    } else {
        setTimeout(() => {
            hideCard(cardElement1);
            hideCard(cardElement2);
        }, 1000);
    }
}