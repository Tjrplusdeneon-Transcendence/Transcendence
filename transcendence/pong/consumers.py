from channels.generic.websocket import WebsocketConsumer
from .models import *
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
import json
from channels.generic.websocket import AsyncWebsocketConsumer


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
        message = Chat.objects.get(id=event['message_id'])
        html = render_to_string('pong/partials/chat_message.html', context={'message': message})
        self.send(text_data=html)


class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Handle WebSocket disconnection
        pass

    async def receive(self, text_data):
        # Handle incoming messages
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'move_paddle':
            # Example: Process paddle movement
            await self.send(text_data=json.dumps({
                'status': 'paddle_moved',
                'details': data,
            }))
        elif action == 'game_update':
            # Example: Send updated game state
            await self.send(text_data=json.dumps({
                'status': 'game_updated',
                'state': {
                    'ball_position': [50, 50],
                    'player1_score': 1,
                    'player2_score': 2,
                },
            }))

# ATTENTION: la ws doit être disconnect en cas de logout (sinon, erreur sur l'auteur du message, qui reste le premier utilisateur log)