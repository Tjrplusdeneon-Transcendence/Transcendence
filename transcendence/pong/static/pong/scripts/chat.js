const chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

chatSocket.onmessage = function(e) {
    document.getElementById('messageList').innerHTML += e.data;
    const chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    if (message) {
        chatSocket.send(JSON.stringify({
            'message': message
        }));
    messageInputDom.value = '';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeWebSocket();
    attachFormSubmitListener();
});

document.addEventListener('htmx:afterRequest', function(evt) {
    // Check if the updated content is the chat section
    if (evt.detail.target.id === 'chatSection') {
        initializeWebSocket();
        attachFormSubmitListener();
    }
});


// document.getElementById('addFriendBtn').addEventListener('click', function() 
// {
//     g'Friend request sent to ' + document.getElementById('profileUsername').textContent);
// });
