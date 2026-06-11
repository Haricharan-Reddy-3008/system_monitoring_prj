from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import metrics, logs, predictions, anomalies, explanations, projects

# Initialize FastAPI app
app = FastAPI(
    title="System Monitoring API",
    description="Real-time system monitoring with AI predictions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(metrics.router, prefix="/api", tags=["metrics"])
app.include_router(logs.router, prefix="/api", tags=["logs"])
app.include_router(predictions.router, prefix="/api", tags=["predictions"])
app.include_router(anomalies.router, prefix="/api", tags=["anomalies"])
app.include_router(explanations.router, prefix="/api", tags=["explanations"])
app.include_router(projects.router, prefix="/api", tags=["projects"])

@app.get("/")
async def root():
    return {
        "message": "System Monitoring API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Force reload 2
