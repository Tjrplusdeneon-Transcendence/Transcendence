let chatSocket = null;

function closeWebSocket() {
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null; // Reset the chatSocket variable
    }
}

function initializeWebSocket() {
    // Ensure an existing WebSocket connection is closed
    closeWebSocket();

    chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat');

    chatSocket.onmessage = function(e) {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'info_handler') {
                document.getElementById('panel').innerHTML = data.html;
            } else {
                document.getElementById('messageList').innerHTML += e.data;
                const chatBox = document.getElementById('chatBox');
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        } catch (err) {
            // Assume it's HTML if not JSON
            document.getElementById('panel').innerHTML = e.data;
        }       
        
        attachBanButtonListener();
        attachInviteButtonListener();
        attachJoinGameButtonListener();
        attachInfoButtonListener();
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
            launchOnlineGame();  // Placeholder action, replace with your logic
        };
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatContainer')) {
        initializeWebSocket();
        attachFormSubmitListener();
        attachBanButtonListener();
        attachInviteButtonListener();
        attachJoinGameButtonListener();
        attachInfoButtonListener();
    }
});

document.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'chatSection') {
        initializeWebSocket();
        attachFormSubmitListener();
        attachBanButtonListener();
        attachInviteButtonListener();
        attachJoinGameButtonListener();
        attachInfoButtonListener();
    }
});
