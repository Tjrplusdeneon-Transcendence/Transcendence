from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
	path("ws/chat", consumers.ChatConsumer.as_asgi()),
	re_path("ws/pong/$", consumers.PongConsumer.as_asgi()),
]