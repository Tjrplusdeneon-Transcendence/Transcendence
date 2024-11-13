from channels.generic.websocket import WebsocketConsumer

def ChatConsumer(AsyncWebsocketConsumer):
	def connect(self):
		self.accept()