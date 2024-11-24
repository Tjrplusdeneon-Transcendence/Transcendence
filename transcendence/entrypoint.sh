#!/bin/sh

# Wait for the database to be ready
while ! nc -z db 5432; do
  sleep 0.1
done

# Run migrations
python manage.py makemigrations
python manage.py migrate

exec "$@"
