FROM ruby:3.0

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier tous les fichiers du répertoire courant dans le répertoire de travail du conteneur (/app)
COPY . .

# Installer le gestionnaire de dépendances Bundler
RUN gem install bundler

# Installer toutes les dépendances spécifiées dans le Gemfile
RUN bundle install

# Exposer le port 4567 pour permettre l'accès à l'application depuis l'extérieur du conteneur
EXPOSE 4567

# Démarrer le serveur WEBrick directement
CMD ["ruby", "app.rb"]