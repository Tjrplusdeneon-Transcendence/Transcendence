function isUserLogged() {
    return document.body.getAttribute('data-user-authenticated') === 'True';
}

function increaseWins() {
    if (isUserLogged())
    {
        const csrfToken = document.querySelector('body').getAttribute('hx-headers').match(/"X-CSRFToken": "([^"]+)"/)[1];
        fetch('/increase_wins/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({})
        }).then(response => {
            if (response.ok) {
                response.text().then(html => {
                    document.getElementById('panel').innerHTML = html; // Update the entire panel
                });
            }
        });
    }
}

function increaseLosses() {
    if (isUserLogged())
    {
        const csrfToken = document.querySelector('body').getAttribute('hx-headers').match(/"X-CSRFToken": "([^"]+)"/)[1];
        fetch('/increase_losses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({})
        }).then(response => {
            if (response.ok) {
                response.text().then(html => {
                    document.getElementById('panel').innerHTML = html; // Update the entire panel
                });
            }
        });
    }
}

function increaseGamesPlayed() {
    if (isUserLogged())
    {
        console.log("user is logged");
        const csrfToken = document.querySelector('body').getAttribute('hx-headers').match(/"X-CSRFToken": "([^"]+)"/)[1];
        fetch('/increase_games_played/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({})
        }).then(response => {
            if (response.ok) {
                response.text().then(html => {
                    document.getElementById('panel').innerHTML = html; // Update the entire panel
                });
            }
        });
    } else {
        console.log("user is NOT logged");
    }
}
