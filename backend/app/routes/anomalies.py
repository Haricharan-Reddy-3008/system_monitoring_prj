from fastapi import APIRouter

router = APIRouter()

@router.get("/anomalies/{project_id}")
async def get_anomalies(project_id: str):
    """Get detected anomalies for a project"""
    return {"message": f"Anomalies for project {project_id}"}
