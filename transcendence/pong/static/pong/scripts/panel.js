document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded");
    attachEventListeners();
});

document.addEventListener('htmx:afterRequest', function(evt) {
    // Process the response
    try {
        if (evt.detail.xhr.responseText) {
                const response = JSON.parse(evt.detail.xhr.responseText);
                if (response.panel_html) {
                    console.log("loginPanel");
                    document.getElementById('loginPanel').innerHTML = response.panel_html;
                }
                if (response.chat_html) {
                    console.log("chatSection");
                    document.getElementById('chatSection').innerHTML = response.chat_html;
                }
        }
    } catch (err) {
        console.log("htmx: not Json");
    }
    // Reinitialize HTMX for the updated content
    htmx.process(document.body);

    // Reinitialize WebSocket and event listeners after content update
    if (document.getElementById('chatContainer')) {
        initializeWebSocket();
        attachFormSubmitListener();
    }

    // Reattach event listeners for dynamically loaded content
    attachEventListeners();
});

function attachEventListeners() {
    attachLoginButtonListener();
    attachLogoutButtonListener();
    attachCloseButtonListener();
    attachProfileModalCloseListener();
}

function attachLoginButtonListener() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('loginPanel').style.display = 'block';
        });
    }
}

function attachLogoutButtonListener() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            closeChatSocket();
        });
    }
}

function attachCloseButtonListener() {
    const closeButton = document.getElementById('closeButton');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.getElementById('loginPanel').classList.add('slide-out');
            setTimeout(function() {
                document.getElementById('loginPanel').style.display = 'none';
                document.getElementById('loginPanel').classList.remove('slide-out');
            }, 300);
        });
    }
}

function attachProfileModalCloseListener() {
    const profileModalCloseButton = document.getElementById('closeProfileModal');
    if (profileModalCloseButton) {
        profileModalCloseButton.addEventListener('click', function() {
            document.getElementById('profileModal').style.display = 'none';
        });
    }
}

function openProfileModal(username, targetElement) {
    const modal = document.getElementById('profileModal');
    const profileUsername = document.getElementById('profileUsername');

    profileUsername.textContent = username;

    const rect = targetElement.getBoundingClientRect();

    modal.style.top = `${rect.bottom + window.scrollY + 10}px`;
    modal.style.left = `${rect.left + window.scrollX}px`;
    modal.style.display = 'block';
}
