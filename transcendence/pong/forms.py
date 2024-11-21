from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from pong.models import Chat

class SigninForm(forms.Form):
	username = forms.CharField(max_length=63, label='Username')
	password = forms.CharField(max_length=63, widget=forms.PasswordInput, label='Password')

class SignupForm(UserCreationForm):
	class Meta(UserCreationForm):
		model = get_user_model()
		fields = ('username',)
		help_texts = {
			"username": None,
		}

class ChatForm(forms.ModelForm):
	class Meta:
		model = Chat
		fields = ('content',)
	
	content = forms.CharField(widget=forms.Textarea(attrs={'placeholder': 'Écrire un message...', 'rows': 4, 'cols': 50}))