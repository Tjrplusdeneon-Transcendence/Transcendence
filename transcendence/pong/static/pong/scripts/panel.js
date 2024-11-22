document.getElementById('loginButton').addEventListener('click', function(event) 
{
    event.preventDefault();
    document.getElementById('loginPanel').style.display = 'block';
	document.getElementById('chatContainer').style.display = 'block';
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

document.getElementById('logoutButton').addEventListener('click', function() 
{
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('profileInfo').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none';
	document.getElementById('chatContainer').style.display = 'none';
	chatSocket.close();
});

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