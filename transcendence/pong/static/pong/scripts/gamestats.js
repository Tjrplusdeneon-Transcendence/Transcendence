function increaseWins() {
    const csrfToken = document.querySelector('body').getAttribute('hx-headers').match(/"X-CSRFToken": "([^"]+)"/)[1];
    fetch('/increase-wins/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // Use the CSRF token retrieved from hx-headers
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

function increaseLosses() {
    const csrfToken = document.querySelector('body').getAttribute('hx-headers').match(/"X-CSRFToken": "([^"]+)"/)[1];
    fetch('/increase-losses/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // Use the CSRF token retrieved from hx-headers
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

function increaseGamesPlayed() {
    const csrfToken = document.querySelector('body').getAttribute('hx-headers').match(/"X-CSRFToken": "([^"]+)"/)[1];
    fetch('/increase-games_played/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // Use the CSRF token retrieved from hx-headers
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


// let gamesPlayed = 0;
// let wins = 0;
// let losses = 0;
// let totalScore = 0;

// function updateGameStats(score) 
// {
//     gamesPlayed++;
    
//     if (score > 0)
//         wins++;
//     else
//         losses++;

//     if (document.getElementById('gamesPlayed')) 
//     {
//         totalScore += score;
        
//         document.getElementById('gamesPlayed').innerText = gamesPlayed;
//         document.getElementById('wins').innerText = wins;
//         document.getElementById('losses').innerText = losses;
//         document.getElementById('totalScore').innerText = totalScore;
//     }
// }

// window.updateGameStats = updateGameStats;

