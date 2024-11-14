from channels.generic.websocket import WebsocketConsumer
from . import models

import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # self.user = self.scope['user']
        # print("USER= ", self.user.username)
        self.accept()
