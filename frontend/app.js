// URL de l'API du backend
const apiUrl = 'http://backend:4567';

// enregistrer un joueur
async function registerPlayer() 
{
    // Récupère les valeurs de 'alias' et 'password' 
    const alias = document.getElementById('alias').value;
    const password = document.getElementById('password').value;
    
    try 
	{
        // Envoie une requête POST au backend pour enregistrer le joueur
        const response = await fetch(`${apiUrl}/register`, 
		{
            method: 'POST', // Méthode HTTP
            headers: { 'Content-Type': 'application/json' }, // En-têtes de la requête
            body: JSON.stringify({ alias, password }) // requête convertie en JSON
        });
        
        if (!response.ok) 
		{
            throw new Error('Network response was not ok');
        }

        // Convertir la réponse en JSON
        const player = await response.json();
        console.log('Player registered:', player);
    } 
	catch (error) 
	{
        console.error('Error:', error);
    }
}

// Créer un tournoi
async function createTournament() 
{
    // Liste des joueurs participants
    const players = [{ alias: 'Player1' }, { alias: 'Player2' }];
    
    try 
	{
        // Envoie une requête POST au backend pour créer le tournoi
        const response = await fetch(`${apiUrl}/tournament`, 
		{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players }) 
        });

        if (!response.ok) 
		{
            throw new Error('Network response was not ok');
        }

        const tournament = await response.json();
        console.log('Tournament created:', tournament);
        
        // Affiche l'ID du tournoi dans l'élément HTML avec 'tournament-info'
        document.getElementById('tournament-info').innerText = `Tournament ID: ${tournament.id}`;
    } 
	catch (error) 
	{
        console.error('Error:', error); // Affiche l'erreur en cas de problème
    }
}

// Ajoute des écouteurs d'événements aux boutons une fois le DOM chargé
document.addEventListener('DOMContentLoaded', (event) => 
{
    const registerBtn = document.getElementById('register-btn');
    const createTournamentBtn = document.getElementById('create-tournament-btn');
    const startGameBtn = document.getElementById('start-game-btn'); 

    // Vérifie si le bouton d'inscription existe et lui ajoute un gestionnaire de clic
    if (registerBtn) 
	{
        registerBtn.addEventListener('click', registerPlayer);
    } 
	else 
	{
        console.error('Register button not found');
    }

    if (createTournamentBtn) 
	{
        createTournamentBtn.addEventListener('click', createTournament);
    } 
	else 
	{
        console.error('Create Tournament button not found');
    }

    if (startGameBtn) 
	{
        startGameBtn.addEventListener('click', startGame);
    } 
	else 
	{
        console.error('Start Game button not found');
    }
});
