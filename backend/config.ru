# /!\ POur aller un peu vite et tester le frontend j'ai utilisé des framework qu'il faudra enlever !!!


require 'sinatra'      # Charge le framework Sinatra pour créer des applications web légères en Ruby
require 'rack/cors'    # Charge Rack::Cors pour la gestion des requêtes Cross-Origin Resource Sharing (CORS)
require './server'     # Charge le fichier 'server.rb' où les routes de l'application sont définies

# Configuration de CORS pour permettre à des requêtes provenant de différentes origines d'accéder au serveur
use Rack::Cors do
  allow do
    origins '*' # Permet les requêtes de toutes les origines (à voir à quoi ça correspond)
    resource '*',
      headers: :any, # Permet l'utilisation de tous les en-têtes dans les requêtes CORS
      methods: [:get, :post, :options] # Autorise les méthodes HTTP GET, POST et OPTIONS
  end
end

# Démarre l'application Sinatra
run Sinatra::Application
