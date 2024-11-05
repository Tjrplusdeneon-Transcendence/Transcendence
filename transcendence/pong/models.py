from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
	score = models.fields.IntegerField(default=0)

class Chat(models.Model):
	message = models.fields.CharField(max_length=100)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
