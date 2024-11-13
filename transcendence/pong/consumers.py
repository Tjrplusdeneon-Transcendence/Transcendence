from channels.generic.websocket import WebsocketConsumer

def ChatConsumer(WebsocketConsumer):
	def connect(self):
		self.accept()