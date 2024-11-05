from django.http import HttpResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout

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

def logout(request):
    logout(request)
    return redirect('index')
