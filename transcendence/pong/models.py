from django.db import models

class User(models.Model):
	username = models.fields.CharField(max_length=100) # gestion d erreur : bloquer la taille lors de la creation du username
	password = models.fields.CharField(max_length=100) # gestion d erreur : bloquer la taille lors de la creation du password
	score = models.fields.IntegerField()

class Chat(models.Model):
	message = models.fields.CharField(max_length=100)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
