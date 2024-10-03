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

document.getElementById('submitButton').addEventListener('click', function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'user' && password === '123') {
        isLoggedIn = true;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('profileInfo').style.display = 'block';
        document.getElementById('gameStats').style.display = 'block';
    } else {
        alert('Invalid username or password!');
    }
});

document.getElementById('logoutButton').addEventListener('click', function() {
    isLoggedIn = false;

    document.getElementById('loginForm').style.display = 'block';


    document.getElementById('profileInfo').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none'; 
});

document.getElementById('sendMessageBtn').addEventListener('click', function() 
{
    if (isLoggedIn) 
    {
        const chatBox = document.getElementById('chatBox');
        const messageInput = document.getElementById('chatMessage');
        const message = messageInput.value.trim();
        let Username = "user";

        if (message !== '') 
        {
            const messageElement = document.createElement('p');

            messageElement.textContent = Username + " : " + message;
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
            messageInput.value = '';
        }
    } 
    else 
        alert('You must be logged in to send messages.');
});

document.getElementById('chatMessage').addEventListener('keydown', function(e) 
{
    if (e.key === 'Enter' && isLoggedIn) 
        document.getElementById('sendMessageBtn').click();
    else if (e.key === 'Enter' && !isLoggedIn)
        alert('You must be logged in to send messages.');
});