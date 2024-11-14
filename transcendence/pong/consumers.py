from channels.generic.websocket import WebsocketConsumer
from .models import *
from django.template.loader import render_to_string

import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        self.accept()
        
    def receive(self, text_data):
        content = (json.loads(text_data))["content"]
        message = Chat.objects.create(
            content = content,
            author = self.user
        )
        html = render_to_string('pong/partials/chat_message.html', context={'message': message})
        self.send(text_data=html)

# ATTENTION: la ws doit être disconnect en cas de logout (sinon, erreur sur l'auteur du message, qui reste le premier utilisateur log)