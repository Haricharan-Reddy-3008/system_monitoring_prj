from fastapi import APIRouter

router = APIRouter()

@router.post("/metrics")
async def ingest_metrics():
    """Endpoint for ingesting metrics data"""
    return {"message": "Metrics endpoint - to be implemented"}

@router.get("/metrics/{project_id}")
async def get_metrics(project_id: str):
    """Get metrics for a project"""
    return {"message": f"Get metrics for project {project_id}"}
