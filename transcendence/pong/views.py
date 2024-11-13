from django.http import HttpResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from pong.models import Chat

def index(request):
    return render(request, 'pong/index.html')

def signin_user(request):
    sign_form = forms.SigninForm()
    signin_error_message = ''
    if request.method == 'POST':
        sign_form = forms.SigninForm(request.POST)
        if sign_form.is_valid():
            user = authenticate(username = sign_form.cleaned_data['username'], password = sign_form.cleaned_data['password'],)
            if user is not None:
                login(request, user)
                return render(request, 'pong/partials/panel.html')
            else:
                signin_error_message = 'Wrong credentials'
    return render(request, 'pong/partials/signin.html', context={'sign_form': sign_form, 'signin_error_message': signin_error_message})

def signup_user(request):
    sign_form = forms.SignupForm()
    if request.method == 'POST':
        sign_form = forms.SignupForm(request.POST)
        if sign_form.is_valid():
            user = sign_form.save()
            login(request, user)
            return render(request, 'pong/partials/panel.html')
    return render(request, 'pong/partials/signup.html', context={'sign_form': sign_form})

def logout_user(request):
    logout(request)
    return render(request, 'pong/partials/panel.html')

def chat(request):
    chat_form = forms.ChatForm()
    if request.method == 'POST':
        chat_form = forms.ChatForm(request.POST)
        if chat_form.is_valid():
            chat_form.save()
            return render(request, 'pong/partials/chat_message.html')
    return render(request, 'pong/chat.html', context={'chat_form': chat_form})