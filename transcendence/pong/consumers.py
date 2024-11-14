from channels.generic.websocket import WebsocketConsumer
from . import models
# from django.template.loader import render_to_string

import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # self.user = self.scope['user']
        # print("USER= ", self.user.username)
        self.accept()
