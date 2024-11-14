from channels.generic.websocket import WebsocketConsumer
from . import models

import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        self.accept()
        
    def receive(self, text_data):
        content = (json.loads(text_data))["content"]
        print("CONTENT: ", content)