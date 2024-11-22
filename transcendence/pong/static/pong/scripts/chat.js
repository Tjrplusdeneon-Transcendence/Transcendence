let chatSocket = null;

function initializeWebSocket() {
    // Check if a WebSocket connection already exists and is open
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        return;
    }
    
    chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

    chatSocket.onopen = function(e) {
        console.log('WebSocket CONNECT');
    };

    chatSocket.onmessage = function(e) {
        document.getElementById('messageList').innerHTML += e.data;
        const chatBox = document.getElementById('chatBox');
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
}

function attachFormSubmitListener() {
    const messageInput = document.querySelector('#chat-message-input');
    const messageSubmit = document.querySelector('#chat-message-submit');

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

document.addEventListener('DOMContentLoaded', function() {
    initializeWebSocket();
    attachFormSubmitListener();
});

document.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'chatSection') {
        initializeWebSocket(); // Ensure WebSocket is reinitialized correctly
        attachFormSubmitListener(); // Reattach event listeners
    }
});
