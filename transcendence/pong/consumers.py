from channels.generic.websocket import WebsocketConsumer
from .models import *
from django.template.loader import render_to_string
import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        self.accept()

    # def disconnect(self, close_code):
    #     pass

    def receive(self, event):
        print(event)
        self.send({
            "type": "websocket.send",
            "text": event["text"],
        })    

    # def receive(self, text_data):
    #     text_data_json = json.loads(text_data)
    #     content = text_data_json["content"]
    #     message = Chat.objects.create(
    #         content = content,
    #         author = self.user,
    #     )
    #     html = render_to_string('pong/partials/chat_message.html', context={'message': message})
    #     self.send(text_data=html)
