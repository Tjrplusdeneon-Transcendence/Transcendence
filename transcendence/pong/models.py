from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
	score = models.fields.IntegerField(default=0)
	games_played = models.fields.IntegerField(default=0)
	wins = models.fields.IntegerField(default=0)
	losses = models.fields.IntegerField(default=0)
	
	def __str__(self):
		return self.username

class Chat(models.Model):
	author = models.ForeignKey(User, on_delete=models.CASCADE)
	content = models.fields.CharField(max_length=100)

	def __str__(self):
		return f'{self.author.username} : {self.content}'
	
	class Meta:
		ordering = ['-created']