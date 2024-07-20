FROM ruby:3.0

# répertoire de travail dans le conteneur
WORKDIR /app

# copier tous les fichiers du répertoire courant (donc où se trouve le Dockerfile) dans le répertoire de travail du conteneur (/app)
COPY . .

# gestionnaire de dépendances pour les projets Ruby (donc voué à changer si au final on utilise pas ruby)
RUN gem install bundler

# Installer toutes les dépendances qui se trouveront dans le Gemfile
RUN bundle install

EXPOSE 4567

# démarrer le serveur Rack (à voir plus tard si c'est vraiment utile) avec Bundler sur le port 4567 et accessible depuis n'importe quelle adresse IP
CMD ["bundle", "exec", "rackup", "--host", "0.0.0.0", "-p", "4567"]
