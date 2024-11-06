from django.http import HttpResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout
from django.conf import settings

def index(request):
    form = forms.LoginForm()
    message = ''
    if request.method == 'POST':
        form = forms.LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(username = form.cleaned_data['username'], password = form.cleaned_data['password'],)
            if user is not None:
                login(request, user)
                # message = f'{ user.username }, connected'
            else:
                message = 'Wrong credentials'
    return render(request, 'pong/index.html', context={'form': form, 'message': message})

def logout_user(request):
    logout(request)
    return redirect(settings.LOGIN_REDIRECT_URL)

def signup_page(request):
    form = forms.SignupForm()
    print('1')
    if request.method == 'POST':
        print('2')
        form = forms.SignupForm(request.POST)
        if form.is_valid():
            print('3')
            user = form.save()
            login(request, user)
            return redirect(settings.LOGIN_REDIRECT_URL)
    return render(request, 'pong/signup.html', context={'form': form})