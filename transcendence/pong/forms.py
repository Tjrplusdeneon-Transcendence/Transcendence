from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from pong.models import Chat

class SigninForm(forms.Form):
    username = forms.CharField(
        max_length=63,
        label='Username',
        widget=forms.TextInput(attrs={'autocomplete': 'username', 'placeholder': 'Username'})
    )
    password = forms.CharField(
        max_length=63,
        label='Password',
        widget=forms.PasswordInput(attrs={'autocomplete': 'current-password', 'placeholder': 'Password'})
    )

class SignupForm(UserCreationForm):
    class Meta(UserCreationForm):
        model = get_user_model()
        fields = ('username',)
        help_texts = {
            "username": None,
        }
    username = forms.CharField(
        max_length=63,
        label='Username',
        widget=forms.TextInput(attrs={'autocomplete': 'username', 'placeholder': 'Username'})
    )
    password1 = forms.CharField(
        label='Password',
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'placeholder': 'Password'})
    )
    password2 = forms.CharField(
        label='Confirm Password',
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'placeholder': 'Confirm Password'})
    )
