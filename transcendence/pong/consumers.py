from channels.generic.websocket import WebsocketConsumer
from .models import *
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import re
import math
import random

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
    players_waiting = []

    async def connect(self):
        await self.accept()
        PongConsumer.players_waiting.append(self)

        if len(PongConsumer.players_waiting) >= 2:
            player1 = PongConsumer.players_waiting.pop(0)
            player2 = PongConsumer.players_waiting.pop(0)

            match_id = self.generate_valid_group_name(f"match_{player1.channel_name}_{player2.channel_name}")

            await self.channel_layer.group_add(match_id, player1.channel_name)
            await self.channel_layer.group_add(match_id, player2.channel_name)

            await player1.send(json.dumps({'type': 'match_found', 'match_id': match_id, 'player': 'player1'}))
            await player2.send(json.dumps({'type': 'match_found', 'match_id': match_id, 'player': 'player2'}))

            player1.match_id = match_id
            player2.match_id = match_id

            # Generate initial game state
            initial_state = self.generate_initial_game_state()

            # Notify both players to start the game with the initial state
            await self.channel_layer.group_send(
                match_id,
                {
                    'type': 'start_game',
                    'initial_state': initial_state
                }
            )

    async def disconnect(self, close_code):
        if self in PongConsumer.players_waiting:
            PongConsumer.players_waiting.remove(self)
        else:
            await self.channel_layer.group_discard(self.match_id, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('type')

        if action == 'move_paddle':
            await self.channel_layer.group_send(
                self.match_id,
                {
                    'type': 'paddle_moved',
                    'player': data['player'],
                    'position': data['position']
                }
            )
        elif action == 'game_update':
            await self.channel_layer.group_send(
                self.match_id,
                {
                    'type': 'game_update',
                    'state': data['state']
                }
            )

    async def paddle_moved(self, event):
        await self.send(text_data=json.dumps({
            'type': 'paddle_moved',
            'player': event['player'],
            'position': event['position']
        }))

    async def game_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'state': event['state']
        }))

    async def start_game(self, event):
        await self.send(text_data=json.dumps({
            'type': 'start_game',
            'initial_state': event['initial_state']
        }))

    def generate_initial_game_state(self):
        paddle_height = 100  # Paddle height from your game
        canvas_height = 400  # Canvas height from your game
        canvas_width = 800   # Canvas width from your game

        paddleY1 = (canvas_height - paddle_height) / 2
        paddleY2 = (canvas_height - paddle_height) / 2
        x = canvas_width / 2
        y = canvas_height / 2

        min_angle = math.pi / 20
        max_angle = math.pi / 5
        angle = (random.random() < 0.5 and -1 or 1) * (random.random() * (max_angle - min_angle) + min_angle)
        speed = 300  # Speed from your game
        dx = -abs(speed * math.cos(angle))
        dy = speed * math.sin(angle)

        player_speed = 300  # Correct player speed
        ai_speed = 300      # Correct AI speed

        return {
            'ball_position': [x, y],
            'paddle1_position': paddleY1,
            'paddle2_position': paddleY2,
            'dx': dx,
            'dy': dy,
            'player_speed': player_speed,
            'ai_speed': ai_speed
        }

    def generate_valid_group_name(self, name):
        # Replace invalid characters with underscores
        valid_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
        # Ensure the length is less than 100 characters
        return valid_name[:100]

# ATTENTION: la ws doit être disconnect en cas de logout (sinon, erreur sur l'auteur du message, qui reste le premier utilisateur log)