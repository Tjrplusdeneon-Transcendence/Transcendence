from django.http import HttpResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from pong.models import Chat

def index(request):
    sign_form = None
    signin_error_message = ''
    chat_form = forms.ChatForm()
    chat_messages = Chat.objects.all()[:10]
    if request.method == 'POST':
        print ('>>>>>>POST>>>>>>>', request.POST, '<<<<<<<<<<<<<<')
        if 'signin' in request.POST:
            sign_form = forms.LoginForm(prefix="signin")
            return render(request, 'pong/partials/sign_p.html', context={'sign_form': sign_form})
        elif 'signup' in request.POST:
            sign_form = forms.SignupForm(prefix="signup")
        elif ('submit' and 'signin-username') in request.POST:
            sign_form = forms.LoginForm(request.POST, prefix="signin")
            if sign_form.is_valid():
                user = authenticate(username = sign_form.cleaned_data['username'], password = sign_form.cleaned_data['password'],)
                if user is not None:
                    login(request, user)
                else:
                    signin_error_message = 'Wrong credentials'
        elif ('submit' and 'signup-username') in request.POST:
            sign_form = forms.SignupForm(request.POST, prefix="signup")
            if sign_form.is_valid():
                user = sign_form.save()
                login(request, user)
        elif 'logout' in request.POST:
            print('loging out')
            logout(request)
        elif 'chat' in request.POST:
            chat_form = forms.ChatForm(request.POST)
            if chat_form.is_valid():
                new = chat_form.save(commit=False)
                new.user = request.user
                new.save()
                chat_form = forms.ChatForm()
    return render(request,
        'pong/index.html',
        context={'sign_form': sign_form,
                 'signin_error_message': signin_error_message,
                 'chat_form': chat_form,
                 'chat_messages': chat_messages,
                 })
