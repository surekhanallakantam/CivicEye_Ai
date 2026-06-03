from fastapi import FastAPI
from app.core.database import is_database_configured
from app.api.v1.routes import ai as ai_routes
from app.api.v1.routes import complaints as complaints_routes
from app.api.v1.routes import analytics as analytics_routes
from app.api.v1.routes import clusters as clusters_routes
from dotenv import load_dotenv


load_dotenv()

app = FastAPI(title="CivicEye AI API")

app.include_router(ai_routes.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(complaints_routes.router, prefix="/api/v1/complaints", tags=["complaints"])
app.include_router(clusters_routes.router, prefix="/api/v1/admin/clusters", tags=["clusters"])
app.include_router(analytics_routes.router, prefix="/api/v1/admin", tags=["analytics"])


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "database_configured": is_database_configured(),
    }
