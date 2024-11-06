from django.http import HttpResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from pong.models import Chat

def index(request):
    login_form = forms.LoginForm()
    chat_form = forms.ChatForm()
    message = ''
    if request.method == 'POST':
        print ('>>>>>>POST>>>>>>>')
        print(request.POST)
        print ('<<<<<<<<<<<<<<')
        if 'login' in request.POST:
            login_form = forms.LoginForm(request.POST)
            if login_form.is_valid():
                user = authenticate(username = login_form.cleaned_data['username'], password = login_form.cleaned_data['password'],)
                if user is not None:
                    login(request, user)
                    # message = f'{ user.username }, connected'
                else:
                    message = 'Wrong credentials'
        elif 'chat' in request.POST:
            chat_form = forms.ChatForm(request.POST)
            if chat_form.is_valid():
                new = chat_form.save(commit=False)
                new.user = request.user
                new.save()
    return render(request, 'pong/index.html', context={'login_form': login_form, 'chat_form': chat_form, 'message': message})

def logout_user(request):
    logout(request)
    return redirect(settings.LOGIN_REDIRECT_URL)

def signup_page(request):
    form = forms.SignupForm()
    if request.method == 'POST':
        form = forms.SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(settings.LOGIN_REDIRECT_URL)
    return render(request, 'pong/signup.html', context={'form': form})
