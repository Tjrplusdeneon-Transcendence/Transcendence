function isUserLogged() {
    return document.body.getAttribute('data-user-authenticated') === 'True';
}

function increaseWins() {
    console.log("NewWin");
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
                    document.getElementById('gameStats').innerHTML = html;
                });
            }
        });
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
        }).then(response => {
            if (response.ok) {
                response.text().then(html => {
                    document.getElementById('gameStats').innerHTML = html;
                });
            }
        });
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
        }).then(response => {
            if (response.ok) {
                response.text().then(html => {
                    document.getElementById('gameStats').innerHTML = html;
                });
            }
        });
    } else {
        console.log("Gamestats: user is not logged");
    }
}
