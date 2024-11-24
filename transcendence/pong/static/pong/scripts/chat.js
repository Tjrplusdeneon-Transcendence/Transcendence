let chatSocket = null;

function closeWebSocket() {
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null;
    }
}

function initializeWebSocket() {
    closeWebSocket();

    chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat');

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
        attachEventListeners();
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
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
                chatSocket.send(JSON.stringify({ 'message': message }));
                messageInput.value = '';
            }
        };
    }
}

function attachInfoButtonListener() {
    document.querySelectorAll('.info-button').forEach(button => {
        button.onclick = function(e) {
            const senderId = e.target.getAttribute('user-id');
            const authorId = e.target.getAttribute('author-id');
            if (authorId) {
                chatSocket.send(JSON.stringify({ 'info': authorId, 'sender': senderId }));
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

function attachJoinGameButtonListener() {
    document.querySelectorAll('.join-game-btn').forEach(button => {
        button.onclick = function(e) {
            launchOnlineGame();
        };
    });
}

function attachLogoutButtonListener() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            closeWebSocket();
        });
    }
}

function attachEventListeners() {
    attachFormSubmitListener();
    attachBanButtonListener();
    attachInviteButtonListener();
    attachJoinGameButtonListener();
    attachInfoButtonListener();
    attachLogoutButtonListener();
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatContainer')) {
        initializeWebSocket();
        attachEventListeners();
    }
});

document.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'chatSection') {
        initializeWebSocket();
        attachEventListeners();
    }
});
