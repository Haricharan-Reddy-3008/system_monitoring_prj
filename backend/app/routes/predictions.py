from fastapi import APIRouter

router = APIRouter()

@router.get("/predictions/{project_id}")
async def get_predictions(project_id: str):
    """Get AI predictions for a project"""
    return {"message": f"Predictions for project {project_id}"}
