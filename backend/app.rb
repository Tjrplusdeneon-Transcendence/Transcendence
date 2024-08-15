require 'json'
require 'securerandom'
require 'bcrypt'
require 'dotenv/load'
require 'cgi'
require 'webrick'

# Serveur HTTP basique utilisant WEBrick
server = WEBrick::HTTPServer.new(Port: 4567)

$players = []
$tournaments = []

# Méthode pour rechercher un tournoi par son ID
def find_tournament(tournament_id)
  $tournaments.find { |t| t[:id] == tournament_id }
end

# Méthode pour échapper les entrées de l'utilisateur afin d'éviter les injections de code
def sanitize_input(input)
  CGI.escapeHTML(input)
end

# Méthode pour valider l'entrée de l'utilisateur
def validate_input(input, field)
  halt(400, "#{field} is invalid") if input.nil? || input.strip.empty? || input.length > 50
  input
end

# Handler pour la route GET /
server.mount_proc '/' do |req, res|
  if req.request_method == 'GET'
    res.body = 'Pong Backend is running'
    res['Content-Type'] = 'text/plain'
  else
    res.status = 405 # Method Not Allowed
  end
end

# Handler pour la route POST /register
server.mount_proc '/register' do |req, res|
  if req.request_method == 'POST'
    data = JSON.parse(req.body)
    alias_name = sanitize_input(validate_input(data['alias'], 'Alias'))
    password = validate_input(data['password'], 'Password')
    password_hash = BCrypt::Password.create(password)
    player = { id: SecureRandom.uuid, alias: alias_name, password: password_hash }
    $players << player
    res.body = player.to_json
    res['Content-Type'] = 'application/json'
  else
    res.status = 405
  end
end

# Handler pour la route POST /tournament
server.mount_proc '/tournament' do |req, res|
  if req.request_method == 'POST'
    data = JSON.parse(req.body)
    players = data['players'].map { |p| { alias: sanitize_input(p['alias']) } }
    tournament = { id: SecureRandom.uuid, players: players, matches: [] }
    $tournaments << tournament
    res.body = tournament.to_json
    res['Content-Type'] = 'application/json'
  else
    res.status = 405
  end
end

# Handler pour la route GET /tournament/:id
server.mount_proc '/tournament' do |req, res|
  if req.request_method == 'GET'
    # Extraire l'ID du tournoi de l'URL
    tournament_id = req.path.split('/').last
    tournament = find_tournament(tournament_id)
    if tournament
      res.body = tournament.to_json
      res['Content-Type'] = 'application/json'
    else
      res.status = 404
      res.body = 'Tournament not found'
    end
  else
    res.status = 405
  end
end

# Handler pour la route POST /matchmaking/:id
server.mount_proc '/matchmaking' do |req, res|
  if req.request_method == 'POST'
    # Extraire l'ID du tournoi de l'URL
    tournament_id = req.path.split('/').last
    tournament = find_tournament(tournament_id)
    if tournament
      tournament[:players].each_with_index do |player, index|
        next_player = tournament[:players][(index + 1) % tournament[:players].length]
        tournament[:matches] << { player1: player, player2: next_player }
      end
      res.body = tournament.to_json
      res['Content-Type'] = 'application/json'
    else
      res.status = 404
      res.body = 'Tournament not found'
    end
  else
    res.status = 405
  end
end

# Démarre le serveur
trap('INT') { server.shutdown }
server.start
