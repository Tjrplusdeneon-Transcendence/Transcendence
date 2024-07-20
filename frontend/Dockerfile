# /!\ A METTRE DANS UN DOSSIER AVEC LE DEFAULT.CONF

FROM nginx:stable

# Installer OpenSSL pour générer des certificats auto-signés
RUN apt-get update && apt-get install -y openssl && apt-get clean

# Créer un répertoire pour les certificats
RUN mkdir -p /etc/nginx/certs

# Générer un certificat auto-signé
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/certs/server.key \
  -out /etc/nginx/certs/server.crt \
  -subj "/CN=localhost"

COPY . /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY app.js /usr/share/nginx/html/app.js
COPY default.conf /etc/nginx/conf.d/default.conf

RUN chown -R www-data:www-data /usr/share/nginx/html

EXPOSE 80 443
