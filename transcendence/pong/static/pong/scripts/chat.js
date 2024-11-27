/* Chat Socket */
let chatSocket = null;

function closeChatSocket() {
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null;
    }
}

function initializeChatSocket() {
    closeChatSocket();

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host; // Includes hostname and port (if present)
    const path = '/ws/chat';

    const socketUrl = `${protocol}://${host}${path}`;
    console.log(`Connecting to ChatSocket at: ${socketUrl}`);

    chatSocket = new WebSocket(socketUrl);

    console.log('ChatSocket connected.');

    chatSocket.onmessage = function(e) {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'info_handler') {
                document.getElementById('loginPanel').innerHTML = data.html;
            }
        } catch (err) {
            // If parsing fails, assume it's HTML and append it to messageList
            document.getElementById('messageList').innerHTML += e.data;
            const chatBox = document.getElementById('chatBox');
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        attachChatEventListeners();
        attachPanelEventListeners();
        attachProfileModalCloseListener();
    };

    chatSocket.onclose = function(e) {
        console.log('Chat socket closed');
    };
}

/* Listeners for the side panel's buttons */

function attachLogoutButtonListener() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            closeChatSocket();
        });
    }
}

function attachLoginButtonListener() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('loginPanel').style.display = 'block';
        });
    }
}

function attachCloseButtonListener() {
    const closeButton = document.getElementById('closeButton');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.getElementById('loginPanel').classList.add('slide-out');
            setTimeout(function() {
                document.getElementById('loginPanel').style.display = 'none';
                document.getElementById('loginPanel').classList.remove('slide-out');
            }, 300);
        });
    }
}

function attachPanelEventListeners() {
	attachLoginButtonListener();
    attachLogoutButtonListener();
	attachCloseButtonListener();
}

/* Listeners for the chat's buttons */

function attachJoinGameButtonListener() {
    document.querySelectorAll('.join-game-btn').forEach(button => {
        button.onclick = function(e) {
            launchOnlineGame();
        };
    });
}

function attachInviteButtonListener() {
    document.querySelectorAll('.invite-button').forEach(button => {
        button.onclick = function(e) {
            const senderId = e.target.getAttribute('user-id');
            const authorId = e.target.getAttribute('author-id');
            if (authorId) {
                chatSocket.send(JSON.stringify({ 'invite': authorId, 'sender': senderId }));
                launchOnlineGame();
            }
        };
    });
}

function attachBanButtonListener() {
    document.querySelectorAll('.ban-button').forEach(button => {
        button.onclick = function(e) {
            const authorId = e.target.getAttribute('author-id');
            if (authorId) {
                chatSocket.send(JSON.stringify({ 'ban': authorId }));
            }
        };
    });
}

function tournamentGameStarting(playerId) {
    console.log("playerId", playerId);
    if (playerId) {
        chatSocket.send(JSON.stringify({'tournament': playerId }));
    }
}

function attachInfoButtonListener() {
    document.querySelectorAll('.info-button').forEach(button => {
        button.onclick = function(e) {
            const senderId = e.target.getAttribute('user-id');
            console.log("Début du test"); // TO REMOVE
            console.log("SenderId", senderId);
            tournamentGameStarting(senderId); // TO REMOVE
            console.log("Fin du test"); // TO REMOVE
            // const authorId = e.target.getAttribute('author-id');
            // if (authorId) {
            //     chatSocket.send(JSON.stringify({ 'info': authorId, 'sender': senderId }));
            // }
        };
    });
}

function attachFormSubmitListener() {
    const messageInput = document.querySelector('#chat-message-input');
    const messageSubmit = document.querySelector('#chat-message-submit');

    if (messageInput && messageSubmit) {
        messageInput.onkeyup = function(e) {
            if (e.key === 'Enter') {
                messageSubmit.click();
            }
        };

        messageSubmit.onclick = function(e) {
            const message = messageInput.value.trim();
            if (message) {
                chatSocket.send(JSON.stringify({'message': message }));
                messageInput.value = '';
            }
        };
    }
}

function attachChatEventListeners() {
    attachFormSubmitListener();
    attachBanButtonListener();
    attachInviteButtonListener();
    attachJoinGameButtonListener();
    attachInfoButtonListener();
}

/* Listeners for the profile modal's buttons */

function attachProfileModalCloseListener() {
    const profileModalCloseButton = document.getElementById('closeProfileModal');
    if (profileModalCloseButton) {
        profileModalCloseButton.addEventListener('click', function() {
            document.getElementById('profileModal').style.display = 'none';
        });
    }
}

function openProfileModal(username, targetElement) {
    const modal = document.getElementById('profileModal');
    const profileUsername = document.getElementById('profileUsername');

    profileUsername.textContent = username;

    const rect = targetElement.getBoundingClientRect();

    modal.style.top = `${rect.bottom + window.scrollY + 10}px`;
    modal.style.left = `${rect.left + window.scrollX}px`;
    modal.style.display = 'block';
}

/* Loading listeners after htmx request, swap or at Dom Load */
document.addEventListener('htmx:afterRequest', function(evt) {
    // Process the response
    try {
        if (evt.detail.xhr.responseText) {
                const response = JSON.parse(evt.detail.xhr.responseText);
                if (response.panel_html) {
                    document.getElementById('loginPanel').innerHTML = response.panel_html;
                }
                if (response.chat_html) {
                    document.getElementById('chatSection').innerHTML = response.chat_html;
                }
        }
    } catch (err) {
        console.log("htmx: not Json");
    }
    // Reinitialize HTMX for the updated content
    htmx.process(document.body);

    // Reinitialize WebSocketafter content update
    if (document.getElementById('chatContainer')) {
        initializeChatSocket();
        attachChatEventListeners();
    }
    
    // Reattach event listeners for dynamically loaded content
    attachPanelEventListeners();
    attachProfileModalCloseListener();
});

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatContainer')) {
        initializeChatSocket();
        attachChatEventListeners();
    }
    attachPanelEventListeners();
    attachProfileModalCloseListener();
});

document.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'chatSection') {
        initializeChatSocket();
        attachChatEventListeners();
    }
    attachPanelEventListeners();
    attachProfileModalCloseListener();
});
