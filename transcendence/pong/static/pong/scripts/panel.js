document.getElementById('loginButton').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('loginPanel').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', function() {
    attachButtonListeners();
});

document.addEventListener('htmx:afterRequest', function(evt) {
    const response = JSON.parse(evt.detail.xhr.responseText);
    document.getElementById('loginPanel').innerHTML = response.panel_html;
    document.getElementById('chatSection').innerHTML = response.chat_html;

    // Reinitialize HTMX for the updated content
    htmx.process(document.body);

    // Reinitialize WebSocket and event listeners after content update
    initializeWebSocket();
    attachFormSubmitListener();
    attachButtonListeners(); 
});

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            closeWebSocket();
        });
    }
});

// Attach the listener for the logout button after content updates
document.addEventListener('htmx:afterRequest', function(evt) {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            closeWebSocket();
        });
    }
});

// document.getElementById('profileInfo').style.display = 'none';
// document.getElementById('gameStats').style.display = 'none';
// document.getElementById('chatContainer').style.display = 'none';

document.getElementById('closeButton').addEventListener('click', function() 
{
    document.getElementById('loginPanel').classList.add('slide-out');
    setTimeout(function() 
    {
        document.getElementById('loginPanel').style.display = 'none';
        document.getElementById('loginPanel').classList.remove('slide-out');
    }, 300);
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