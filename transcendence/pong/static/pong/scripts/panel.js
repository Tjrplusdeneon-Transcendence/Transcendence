document.getElementById('loginButton').addEventListener('click', function(event) 
{
    event.preventDefault();
    document.getElementById('loginPanel').style.display = 'block';
	// document.getElementById('chatContainer').style.display = 'block';
});




function attachButtonListeners() {
    const signinButton = document.querySelector('#signinButton');
    const signupButton = document.querySelector('#signupButton');
    
    if (signinButton) {
        signinButton.addEventListener('click', function() {
            console.log("Sign in button clicked");
        });
    }

    if (signupButton) {
        signupButton.addEventListener('click', function() {
            console.log("Sign up button clicked");
        });
    }
}

document.addEventListener('htmx:afterOnLoad', function(evt) {
    if (evt.detail.target.id === 'loginPanel') {
        const response = JSON.parse(evt.detail.xhr.responseText);
        document.getElementById('loginPanel').innerHTML = response.panel_html;
        document.getElementById('chatSection').innerHTML = response.chat_html;
        attachButtonListeners(); // Reattach listeners after content swap
    }
});

document.addEventListener('DOMContentLoaded', attachButtonListeners); // Attach listeners on initial load

// document.addEventListener('htmx:afterOnLoad', function(evt) {
//     if (evt.detail.target.id === 'loginPanel') {
//             const response = JSON.parse(evt.detail.xhr.responseText);
//             document.getElementById('loginPanel').innerHTML = response.panel_html;
//             document.getElementById('chatSection').innerHTML = response.chat_html;
//     }
// });


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
    // document.getElementById('profileInfo').style.display = 'none';
    // document.getElementById('gameStats').style.display = 'none';
	// document.getElementById('chatContainer').style.display = 'none';
	chatSocket.close();
});

// function openProfileModal(username, targetElement) 
// {
//     const modal = document.getElementById('profileModal');
//     const profileUsername = document.getElementById('profileUsername');
    
//     profileUsername.textContent = username;

//     const rect = targetElement.getBoundingClientRect();

//     modal.style.top = `${rect.bottom + window.scrollY + 10}px`;
//     modal.style.left = `${rect.left + window.scrollX}px`;
//     modal.style.display = 'block';
// }

// document.getElementById('closeProfileModal').addEventListener('click', function() 
// {
//     document.getElementById('profileModal').style.display = 'none';
// });