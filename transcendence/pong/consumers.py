from channels.generic.websocket import WebsocketConsumer
from .models import *
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        async_to_sync(self.channel_layer.group_add)("chat", self.channel_name) # ws channel joins the group
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)("chat", self.channel_name) # ws channel leaves the group

    def receive(self, text_data):
        content = (json.loads(text_data))["content"]
        message = Chat.objects.create(
            content = content,
            author = self.user
        )
        event = {
            'type': 'message_handler',
            'message_id': message.id,
        }
        async_to_sync(self.channel_layer.group_send)("chat", event)


    def message_handler(self, event):
        message = Chat.objects.get(id=event['message.id'])
        html = render_to_string('pong/partials/chat_message.html', context={'message': message})
        self.send(text_data=html)


# ATTENTION: la ws doit être disconnect en cas de logout (sinon, erreur sur l'auteur du message, qui reste le premier utilisateur log)