function isUserLogged() {
    return document.body.getAttribute('data-user-authenticated') === 'True';
}

function handleResponse(response) {
    if (response.ok) {
        response.json().then(data => {
            document.getElementById('gameStats').innerHTML = data.gamestats_html;
        });
    }
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
        }).then(handleResponse);
    }
}

function increaseLosses() {
    console.log("NewLoss");
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
        }).then(handleResponse);
    }
}

function increaseGamesPlayed() {
    console.log("NewGame");
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
        }).then(handleResponse);
    }
}
