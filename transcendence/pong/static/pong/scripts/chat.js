let chatSocket = null;

function closeWebSocket() {
    if (chatSocket) {
        chatSocket.close();
        chatSocket = null;  // Reset the chatSocket variable
    }
}

function initializeWebSocket() {
    chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

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

document.addEventListener('htmx:afterRequest', function(evt) {
    const response = JSON.parse(evt.detail.xhr.responseText);
    // If chat section is updated, reinitialize WebSocket and event listeners
    if (document.getElementById('chatSection').contains(evt.detail.target)) {
        closeWebSocket();
        initializeWebSocket();
        attachFormSubmitListener();
    }
});