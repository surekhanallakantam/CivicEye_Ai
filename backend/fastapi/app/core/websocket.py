from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        message_str = json.dumps(message)
        # Iterate over a copy of the list to prevent modification issues during disconnection
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_str)
            except Exception as e:
                print(f"Failed to send message to client. Disconnecting: {e}")
                self.disconnect(connection)

manager = ConnectionManager()
