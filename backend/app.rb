# /!\ POur aller un peu vite et tester le frontend j'ai utilisé des framework qu'il faudra enlever !!!


require 'sinatra'         # Charge le framework Sinatra pour créer des applications web légères en Ruby
require 'json'            # Charge la bibliothèque JSON pour manipuler les données JSON
require 'securerandom'    # Fournit des méthodes pour générer des UUID aléatoires sécurisés
require 'bcrypt'          # Charge la bibliothèque BCrypt pour le hachage des mots de passe
require 'dotenv/load'     # Charge les variables d'environnement à partir d'un fichier .env
require 'cgi'             # Charge la bibliothèque CGI pour échapper les chaînes de caractères HTML
require 'rack/cors'       # Charge Rack::Cors pour la gestion des requêtes Cross-Origin Resource Sharing (CORS)

# Configurer CORS pour permettre à des requêtes provenant de différentes origines d'accéder au serveur
use Rack::Cors do
  allow do
    origins '*' # Permet les requêtes de toutes les origines (* signifie n'importe quelle origine)
    resource '*', 
      headers: :any, # Permet l'utilisation de tous les en-têtes dans les requêtes CORS
      methods: [:get, :post, :options] # Autorise les méthodes HTTP GET, POST et OPTIONS
  end
end

$players = []       # Tableau pour stocker les joueurs enregistrés
$tournaments = []   # Tableau pour stocker les tournois créés

# Méthode pour rechercher un tournoi par son ID
def find_tournament(tournament_id)
  $tournaments.find { |t| t[:id] == tournament_id }
end

# Méthode pour échapper les entrées de l'utilisateur afin d'éviter les injections de code
def sanitize_input(input)
  CGI.escapeHTML(input) # Convertit les caractères spéciaux en entités HTML (vraiment utile ? -> sûrement mais à voir)
end

# Méthode pour valider l'entrée de l'utilisateur
def validate_input(input, field)
  # Si l'entrée est nulle, vide ou trop longue (> 50 caractères), retourne une erreur 400
  halt 400, "#{field} is invalid" if input.nil? || input.strip.empty? || input.length > 50
  input
end

# Route GET pour vérifier que le serveur fonctionne
get '/' do
  'Pong Backend is running' # Retourne un message confirmant que le backend est actif (si on voit que ça comme message, le lien avec le front ne fonctionne pas)
end

# Route POST pour enregistrer un joueur
post '/register' do
  data = JSON.parse(request.body.read) # Analyse le corps de la requête JSON
  alias_name = sanitize_input(validate_input(data['alias'], 'Alias')) # Valide et nettoie l'alias du joueur
  password = validate_input(data['password'], 'Password') # Valide le mot de passe
  password_hash = BCrypt::Password.create(password) # Crée un hash sécurisé du mot de passe avec BCrypt
  player = { id: SecureRandom.uuid, alias: alias_name, password: password_hash } # Crée un objet joueur avec un UUID
  $players << player # Ajoute le joueur à la liste des joueurs
  player.to_json # Retourne le joueur enregistré en tant que JSON
end

# Route POST pour créer un tournoi
post '/tournament' do
  data = JSON.parse(request.body.read) # Analyse le corps de la requête JSON
  players = data['players'].map { |p| { alias: sanitize_input(p['alias']) } } # Nettoie les alias des joueurs
  tournament = { id: SecureRandom.uuid, players: players, matches: [] } # Crée un objet tournoi avec un UUID
  $tournaments << tournament # Ajoute le tournoi à la liste globale des tournois
  tournament.to_json # Retourne le tournoi créé en tant que JSON
end

# Route GET pour récupérer un tournoi par son ID
get '/tournament/:id' do
  tournament = find_tournament(params['id']) # Recherche le tournoi correspondant à l'ID fourni
  halt 404, 'Tournament not found' unless tournament # Si le tournoi n'est pas trouvé, retourne une erreur 404
  tournament.to_json # Retourne le tournoi trouvé en tant que JSON
end

# Route POST pour générer les matchs pour un tournoi
post '/matchmaking/:id' do
  tournament = find_tournament(params['id']) # Recherche le tournoi correspondant à l'ID fourni
  halt 404, 'Tournament not found' unless tournament # Si le tournoi n'est pas trouvé, retourne une erreur 404

  # Génère des paires de joueurs pour chaque match
  tournament[:players].each_with_index do |player, index|
    next_player = tournament[:players][(index + 1) % tournament[:players].length] # Trouve le prochain joueur dans la liste
    tournament[:matches] << { player1: player, player2: next_player } # Ajoute le match (player1 vs player2) à la liste des matchs
  end
  tournament.to_json # Retourne le tournoi mis à jour avec les matchs en tant que JSON
end

# Configure le serveur pour écouter sur toutes les interfaces réseau
set :bind, '0.0.0.0'
