from channels.generic.websocket import WebsocketConsumer
from .models import *
from django.template.loader import render_to_string
import json

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def receive(self, text_data):
        pass
 