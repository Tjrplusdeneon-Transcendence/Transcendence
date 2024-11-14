from channels.generic.websocket import WebsocketConsumer
from .models import *

import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        self.accept()
        
    def receive(self, text_data):
        content = (json.loads(text_data))["content"]
        print("CONTENT: ", content)
        print("AUTHOR: ", self.user.username)
        message = Chat.objects.create(
            content = content,
            author = self.user
        )