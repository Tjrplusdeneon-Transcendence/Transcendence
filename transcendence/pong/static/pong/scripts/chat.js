let isLoggedIn = false;

document.getElementById('loginButton').addEventListener('click', function(event) 
{
    event.preventDefault();
    document.getElementById('loginPanel').style.display = 'block';
});

document.getElementById('closeButton').addEventListener('click', function() 
{
    document.getElementById('loginPanel').classList.add('slide-out');
    setTimeout(function() 
    {
        document.getElementById('loginPanel').style.display = 'none';
        document.getElementById('loginPanel').classList.remove('slide-out');
    }, 300);
});

// document.getElementById('submitButton').addEventListener('click', function() 
// {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     if (username === 'user' && password === '123') 
//     {
//         isLoggedIn = true;
//         document.getElementById('loginForm').style.display = 'none';
//         document.getElementById('profileInfo').style.display = 'block';
//         document.getElementById('gameStats').style.display = 'block';
//     } 
//     else 
//     {
//         alert('Invalid username or password!');
//     }
// });

document.getElementById('logoutButton').addEventListener('click', function() 
{
    isLoggedIn = false;
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('profileInfo').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none'; 
});

// document.getElementById('sendMessageBtn').addEventListener('click', function() 
// {
//     if (isLoggedIn) 
//     {
//         const chatBox = document.getElementById('chatBox');
//         const messageInput = document.getElementById('chatMessage');
//         const message = messageInput.value.trim();
//         let Username = "user";

//         if (message !== '') 
//         {
//             const usernameElement = document.createElement('span');
//             usernameElement.textContent = Username;
//             usernameElement.classList.add('clickable-username');
//             usernameElement.style.cursor = 'pointer';
//             usernameElement.style.color = 'blue';

//             const messageElement = document.createElement('p');
//             messageElement.appendChild(usernameElement);
//             messageElement.append(`: ${message}`);
//             chatBox.appendChild(messageElement);
//             chatBox.scrollTop = chatBox.scrollHeight;
//             messageInput.value = '';

//             usernameElement.addEventListener('click', function(event) 
//             {
//                 openProfileModal(Username, event.target);
//             });
//         }
//     } 
//     else 
//         alert('You must be logged in to send messages.');
// });

function openProfileModal(username, targetElement) 
{
    const modal = document.getElementById('profileModal');
    const profileUsername = document.getElementById('profileUsername');
    
    profileUsername.textContent = username;

    const rect = targetElement.getBoundingClientRect();

    modal.style.top = `${rect.bottom + window.scrollY + 10}px`;
    modal.style.left = `${rect.left + window.scrollX}px`;
    modal.style.display = 'block';
}

document.getElementById('closeProfileModal').addEventListener('click', function() 
{
    document.getElementById('profileModal').style.display = 'none';
});

document.getElementById('addFriendBtn').addEventListener('click', function() 
{
    alert('Friend request sent to ' + document.getElementById('profileUsername').textContent);
});

document.getElementById('chatMessage').addEventListener('keydown', function(e) 
{
    if (e.key === 'Enter' && isLoggedIn) 
        document.getElementById('sendMessageBtn').click();
    else if (e.key === 'Enter' && !isLoggedIn)
        alert('You must be logged in to send messages.');
});







/*//////////////////////////////////////////////////////////////////


BACKEND VERSION  | |  


//////////////////////////////////////////////////////////////////*/



/*
// Ouvrir une connexion WebSocket avec le serveur
const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/chat/'
);

// Quand un message est reçu via le WebSocket
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const chatBox = document.getElementById('chatBox');
    const messageElement = document.createElement('p');
    messageElement.textContent = `${data.username}: ${data.message}`;
    chatBox.appendChild(messageElement);

    // Auto-scroll vers le bas du chat lorsqu'un nouveau message arrive
    chatBox.scrollTop = chatBox.scrollHeight;
};

// Gérer les erreurs de connexion WebSocket
chatSocket.onclose = function(e) {
    console.error('Chat socket fermé de manière inattendue');
};

// Envoyer un message en appuyant sur le bouton
document.getElementById('sendMessageBtn').addEventListener('click', function () {
    const messageInputDom = document.getElementById('chatMessage');
    const message = messageInputDom.value;

    // Envoyer le message via WebSocket au serveur
    chatSocket.send(JSON.stringify({
        'message': message
    }));

    // Réinitialiser le champ de saisie du message
    messageInputDom.value = '';
});

// Permettre d'envoyer un message en appuyant sur la touche "Enter"
document.getElementById('chatMessage').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const messageInputDom = document.getElementById('chatMessage');
        const message = messageInputDom.value;

        // Envoyer le message via WebSocket au serveur
        chatSocket.send(JSON.stringify({
            'message': message
        }));

        // Réinitialiser le champ de saisie du message
        messageInputDom.value = '';
    }
});

*/