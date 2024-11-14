from channels.generic.websocket import WebsocketConsumer

import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
