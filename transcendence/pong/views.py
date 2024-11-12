from django.http import HttpResponse
from django.shortcuts import render, redirect
from . import forms
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from pong.models import Chat



def index(request):
    return render(request, 'pong/index.html')

def signin(request):
    print('1')
    sign_form = forms.LoginForm()
    signin_error_message = ''
    if request.method == 'POST':
        print('2')
        sign_form = forms.LoginForm(request.method)
        if sign_form.is_valid():
            print('3')
            user = authenticate(username = sign_form.cleaned_data['username'], password = sign_form.cleaned_data['password'],)
            if user is not None:
                print('4')
                login(request, user)
                sign_form = None
            else:
                print('5')
                signin_error_message = 'Wrong credentials'
    return render(request, 'pong/partials/signin.html', context={'sign_form': sign_form, 'signin_error_message': signin_error_message})

                # return render(request, 'pong/partials/signin.html', context={'sign_form': sign_form, 'signin_error_message': signin_error_message})
                # return render(request, 'pong/partials/signin.html', context={'sign_form': sign_form, 'signin_error_message': signin_error_message})

# def index(request):
#     # sign_form = None
#     # signin_error_message = ''
#     chat_form = forms.ChatForm()
#     chat_messages = Chat.objects.all()[:10]
#     if request.method == 'POST':
#         print ('>>>>>>POST>>>>>>>', request.POST, '<<<<<<<<<<<<<<')
#         # if 'signin' in request.POST:
#         #     print('ICI')
#         #     sign_form = forms.LoginForm(prefix="signin")
#         #     context={'sign_form': sign_form, 'signin_error_message': signin_error_message}
#         #     return render(request, 'pong/partials/sign.html', context)
#         # if 'signup' in request.POST:
#         #     sign_form = forms.SignupForm(prefix="signup")
#         # if ('submit' and 'signin-username') in request.POST:
#         #     sign_form = forms.LoginForm(request.POST, prefix="signin")
#         #     if sign_form.is_valid():
#         #         user = authenticate(username = sign_form.cleaned_data['username'], password = sign_form.cleaned_data['password'],)
#         #         if user is not None:
#         #             login(request, user)
#         #         else:
#         #             signin_error_message = 'Wrong credentials'
#         # elif ('submit' and 'signup-username') in request.POST:
#         #     sign_form = forms.SignupForm(request.POST, prefix="signup")
#         #     if sign_form.is_valid():
#         #         user = sign_form.save()
#         #         login(request, user)
#         if 'logout' in request.POST:
#             print('loging out')
#             logout(request)
#         elif 'chat' in request.POST:
#             chat_form = forms.ChatForm(request.POST)
#             if chat_form.is_valid():
#                 new = chat_form.save(commit=False)
#                 new.user = request.user
#                 new.save()
#                 chat_form = forms.ChatForm()
#     return render(request,
#         'pong/index.html',
#         context={'sign_form': None,
#                  'signin_error_message': None,
#                  'chat_form': chat_form,
#                  'chat_messages': chat_messages,
#                  })

# def signin(request):
#     print('SIGNIN')
#     sign_form = forms.LoginForm()
#     context = {
#         'sign_form': sign_form,
#         'signin_error_message': None,
#     }
#     return(request, 'pong/partials/sign.html', context)

# def signup(request):
#     print('SIGNUP')
#     sign_form = forms.SignupForm()
#     context = {
#         'sign_form': sign_form,
#         'signin_error_message': None,
#     }
#     return(request, 'pong/partials/sign.html', context)