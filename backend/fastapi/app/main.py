from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import is_database_configured
from app.api.v1.routes import ai as ai_routes
from app.api.v1.routes import complaints as complaints_routes
from app.api.v1.routes import analytics as analytics_routes
from app.api.v1.routes import clusters as clusters_routes
from app.api.v1.routes import auth as auth_routes
from dotenv import load_dotenv


load_dotenv()

app = FastAPI(title="CivicEye AI API")

# Enable CORS for frontend web application development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(ai_routes.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(complaints_routes.router, prefix="/api/v1/complaints", tags=["complaints"])
app.include_router(clusters_routes.router, prefix="/api/v1/admin/clusters", tags=["clusters"])
app.include_router(analytics_routes.router, prefix="/api/v1/admin", tags=["analytics"])


from fastapi import WebSocket, WebSocketDisconnect
from app.core.websocket import manager

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the socket open and receive message if client speaks
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "database_configured": is_database_configured(),
    }
