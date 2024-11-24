let gamesPlayed = 0;
let wins = 0;
let losses = 0;
let totalScore = 0;

function updateGameStats(score) 
{
    gamesPlayed++;
    
    if (score > 0)
        wins++;
    else
        losses++;

    if (document.getElementById('gamesPlayed')) 
    {
        totalScore += score;
        
        document.getElementById('gamesPlayed').innerText = gamesPlayed;
        document.getElementById('wins').innerText = wins;
        document.getElementById('losses').innerText = losses;
        document.getElementById('totalScore').innerText = totalScore;
    }
}

window.updateGameStats = updateGameStats;
