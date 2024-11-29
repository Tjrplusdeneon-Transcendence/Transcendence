from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from pong.models import Chat
from django.template.loader import render_to_string
from django.middleware.csrf import get_token

def view_404(request, exception=None):
    return redirect('index')

def index(request):
    chat_messages = Chat.objects.all()[:20]
    return render(request, 'pong/index.html', context={'chat_messages': chat_messages})

def signin_user(request):
    sign_form = forms.SigninForm()
    signin_error_message = ''
    sign_html = None
    if request.method == 'POST':
        sign_form = forms.SigninForm(request.POST)
        if sign_form.is_valid():
            user = authenticate(username = sign_form.cleaned_data['username'], password = sign_form.cleaned_data['password'],)
            if user is not None:
                login(request, user)
                chat_messages = Chat.objects.all()[:20]
                panel_html = render_to_string('pong/partials/panel.html', request=request)
                chat_html = render_to_string('pong/chat.html', context={'chat_messages': chat_messages}, request=request)
                return JsonResponse({
                    'panel_html': panel_html,
                    'chat_html': chat_html
                })
            else:
                signin_error_message = 'Wrong credentials'
    csrf_token = get_token(request)
    sign_html = render_to_string('pong/partials/signin.html', context={'csrf_token': csrf_token, 'sign_form': sign_form, 'signin_error_message': signin_error_message})
    panel_html = render_to_string('pong/partials/panel.html', context={'sign_html': sign_html}, request=request)
    return JsonResponse({'panel_html': panel_html})

def signup_user(request):
    sign_form = forms.SignupForm()
    sign_html = None
    if request.method == 'POST':
        sign_form = forms.SignupForm(request.POST)
        if sign_form.is_valid():
            user = sign_form.save()
            login(request, user)
            chat_messages = Chat.objects.all()[:20]
            panel_html = render_to_string('pong/partials/panel.html', request=request)
            chat_html = render_to_string('pong/chat.html', {'chat_messages': chat_messages}, request=request)
            return JsonResponse({
                'panel_html': panel_html,
                'chat_html': chat_html
            })
    csrf_token = get_token(request)
    sign_html = render_to_string('pong/partials/signup.html', context={'csrf_token': csrf_token, 'sign_form': sign_form})
    panel_html = render_to_string('pong/partials/panel.html', context={'sign_html': sign_html}, request=request)
    return JsonResponse({'panel_html': panel_html})

def logout_user(request):
    logout(request)
    panel_html = render_to_string('pong/partials/panel.html', request=request)
    chat_html = render_to_string('pong/chat.html', request=request)
    return JsonResponse({
        'panel_html': panel_html,
        'chat_html': chat_html
        })
