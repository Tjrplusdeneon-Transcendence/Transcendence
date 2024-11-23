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

    chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

    chatSocket.onmessage = function(e) {
        document.getElementById('messageList').innerHTML += e.data;
        const chatBox = document.getElementById('chatBox');
        chatBox.scrollTop = chatBox.scrollHeight;
        attachBanButtonListener();
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

function attachBanButtonListener() {
    document.querySelectorAll('.ban-button').forEach(button => {
        button.onclick = function(e) {
            const authorId = e.target.getAttribute('data-author');
            if (authorId) {
                chatSocket.send(JSON.stringify({ 'ban': authorId }));
            }
        };
    });
}

function attachInviteButtonListener() {
    document.querySelectorAll('.invite-button').forEach(button => {
        button.onclick = function(e) {
            const authorId = e.target.getAttribute('data-author');
            if (authorId) {
                chatSocket.send(JSON.stringify({ 'invite': authorId }));
            }
        };
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatContainer')) {
        initializeWebSocket();
        attachFormSubmitListener();
        attachBanButtonListener();
        attachInviteButtonListener();
    }
});

document.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'chatSection') {
        initializeWebSocket();
        attachFormSubmitListener();
        attachBanButtonListener();
        attachInviteButtonListener();
    }
});
